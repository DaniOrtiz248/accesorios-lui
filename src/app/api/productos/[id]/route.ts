import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Producto from '@/models/Producto';
import Categoria from '@/models/Categoria';
import Subcategoria from '@/models/Subcategoria';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';
import { deleteProductImage } from '@/lib/cloudinary';
import { sanitizeObject, isValidObjectId, limitArrayLength, validateTextInput, sanitizeNumber, pickAllowedFields } from '@/lib/security';

const MAX_IMAGENES = 10;

// Campos permitidos que un admin puede actualizar en un producto
const ALLOWED_PRODUCTO_FIELDS = [
  'nombre',
  'descripcion',
  'precio',
  'categoria',
  'subcategorias',
  'imagenes',
  'imagenesPublicIds',
  'activo',
] as const;

// GET: Obtener producto por ID (público si está activo; inactivo sólo para admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar ObjectId
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de producto inválido', 400);
    }
    
    await connectDB();
    // Force model registration for serverless cold starts
    Categoria; Subcategoria;
    
    const producto = await Producto.findById(params.id)
      .populate('categoria', 'nombre slug')
      .populate('subcategorias', 'nombre');
    
    if (!producto) {
      return errorResponse('Producto no encontrado', 404);
    }

    // Un producto inactivo sólo puede verlo un administrador autenticado
    if (!producto.activo) {
      try {
        verifyAdmin(request);
      } catch {
        return errorResponse('Producto no encontrado', 404);
      }
    }
    
    return successResponse(producto);
  } catch (error: any) {
    console.error('Error al obtener producto:', error);
    return errorResponse('Error al obtener producto', 500);
  }
}

// PUT: Actualizar producto (requiere rol admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdmin(request);
    
    // Validar ObjectId
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de producto inválido', 400);
    }
    
    await connectDB();
    // Force model registration for serverless cold starts
    Categoria; Subcategoria;
    
    const rawBody = await request.json();

    // Whitelist: sólo se aceptan campos previstos (previene mass assignment
    // y el uso de operadores de MongoDB como $set/$inc en el body)
    let body = pickAllowedFields<any>(rawBody, ALLOWED_PRODUCTO_FIELDS as unknown as string[]);
    
    // Sanitizar datos de entrada
    body = sanitizeObject(body);
    
    // Validar campos requeridos
    if (body.nombre && !validateTextInput(body.nombre, 2, 100)) {
      return errorResponse('Nombre inválido', 400);
    }
    
    if (body.precio !== undefined) {
      const precioValidado = sanitizeNumber(body.precio);
      if (precioValidado === undefined || precioValidado <= 0) {
        return errorResponse('Precio inválido', 400);
      }
      body.precio = precioValidado;
    }
    
    // Validar ObjectIds
    if (body.categoria && !isValidObjectId(body.categoria)) {
      return errorResponse('ID de categoría inválido', 400);
    }

    // Validar array de subcategorias
    if (body.subcategorias && Array.isArray(body.subcategorias)) {
      body.subcategorias = limitArrayLength(
        body.subcategorias.filter((id: any) => typeof id === 'string' && isValidObjectId(id)),
        20
      );
    }
    
    // Obtener producto actual para comparar imágenes
    const productoActual = await Producto.findById(params.id);
    
    if (!productoActual) {
      return errorResponse('Producto no encontrado', 404);
    }
    
    // Limpiar y limitar array de imágenes (máximo 10, igual que el modelo y la UI)
    if (body.imagenes && Array.isArray(body.imagenes)) {
      body.imagenes = limitArrayLength(
        body.imagenes.filter((img: any) => 
          img && typeof img === 'string' && img.trim() !== '' && img.startsWith('http')
        ),
        MAX_IMAGENES
      );

      // Limpiar/alinear array de public_ids (si viene) con el mismo límite
      if (body.imagenesPublicIds && Array.isArray(body.imagenesPublicIds)) {
        body.imagenesPublicIds = limitArrayLength(
          body.imagenesPublicIds.filter((id: any) => typeof id === 'string'),
          MAX_IMAGENES
        );
      }
      
      // Identificar imágenes que se eliminaron
      const imagenesActuales = productoActual.imagenes || [];
      const publicIdsActuales = productoActual.imagenesPublicIds || [];
      const imagenesNuevas = body.imagenes || [];
      
      const imagenesAEliminar: { url: string; publicId?: string }[] = [];
      imagenesActuales.forEach((imgActual: string, index: number) => {
        if (!imagenesNuevas.includes(imgActual)) {
          imagenesAEliminar.push({ url: imgActual, publicId: publicIdsActuales[index] });
        }
      });
      
      // Eliminar imágenes viejas de Cloudinary (por public_id si está disponible)
      if (imagenesAEliminar.length > 0) {
        await Promise.all(
          imagenesAEliminar.map(({ url, publicId }) => 
            deleteProductImage(url, publicId).catch((err) => {
              console.error('Error al eliminar imagen:', err);
            })
          )
        );
      }
    }
    
    const producto = await Producto.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('categoria', 'nombre slug')
     .populate('subcategorias', 'nombre');
    
    if (!producto) {
      return errorResponse('Producto no encontrado', 404);
    }
    
    return successResponse(producto, 'Producto actualizado exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al actualizar producto:', error);
    return handleMongoError(error);
  }
}

// DELETE: Eliminar producto (requiere rol admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdmin(request);
    
    // Validar ObjectId
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de producto inválido', 400);
    }
    
    await connectDB();
    // Force model registration for serverless cold starts
    Categoria; Subcategoria;
    
    const producto = await Producto.findById(params.id);
    
    if (!producto) {
      return errorResponse('Producto no encontrado', 404);
    }
    
    // Eliminar imágenes de Cloudinary (por public_id si está disponible)
    if (producto.imagenes && producto.imagenes.length > 0) {
      const publicIds = producto.imagenesPublicIds || [];
      await Promise.all(
        producto.imagenes.map((url, index) =>
          deleteProductImage(url, publicIds[index]).catch(console.error)
        )
      );
    }
    
    await Producto.findByIdAndDelete(params.id);
    
    return successResponse(null, 'Producto eliminado exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al eliminar producto:', error);
    return errorResponse('Error al eliminar producto', 500);
  }
}
