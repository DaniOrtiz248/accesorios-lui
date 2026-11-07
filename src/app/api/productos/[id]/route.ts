import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Producto from '@/models/Producto';
import Categoria from '@/models/Categoria';
import Subcategoria from '@/models/Subcategoria';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';
import { saveWithImages, tryCleanupImages } from '@/lib/image-lifecycle';
import { sanitizeImageBody } from '@/lib/image-validation';
import { isValidObjectId, limitArrayLength, validateTextInput, sanitizeNumber, pickAllowedFields } from '@/lib/security';

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
    body = sanitizeImageBody(body);
    
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
    
    const producto = await saveWithImages('producto', params.id, body, 'update');

    if (!producto) {
      return errorResponse('Producto no encontrado', 404);
    }
    
    await tryCleanupImages();
    await producto.populate([
      { path: 'categoria', select: 'nombre slug' },
      { path: 'subcategorias', select: 'nombre' },
    ]);
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
    
    const producto = await saveWithImages('producto', params.id, {}, 'delete');
    if (!producto) return errorResponse('Producto no encontrado', 404);
    await tryCleanupImages();

    return successResponse(null, 'Producto eliminado exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al eliminar producto:', error);
    return errorResponse('Error al eliminar producto', 500);
  }
}
