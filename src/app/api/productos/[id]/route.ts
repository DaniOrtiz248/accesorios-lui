import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Producto from '@/models/Producto';
import Categoria from '@/models/Categoria';
import Material from '@/models/Material';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';
import { deleteImage } from '@/lib/cloudinary';
import { sanitizeObject, isValidObjectId, limitArrayLength, validateTextInput, sanitizeNumber } from '@/lib/security';

// GET: Obtener producto por ID (público)
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
    Categoria; Material;
    
    const producto = await Producto.findById(params.id)
      .populate('categoria', 'nombre slug')
      .populate('material', 'nombre');
    
    if (!producto) {
      return errorResponse('Producto no encontrado', 404);
    }
    
    return successResponse(producto);
  } catch (error: any) {
    console.error('Error al obtener producto:', error);
    return errorResponse('Error al obtener producto', 500);
  }
}

// PUT: Actualizar producto (requiere auth)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    
    // Validar ObjectId
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de producto inválido', 400);
    }
    
    await connectDB();
    // Force model registration for serverless cold starts
    Categoria; Material;
    
    let body = await request.json();
    
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
    
    if (body.material && !isValidObjectId(body.material)) {
      return errorResponse('ID de material inválido', 400);
    }
    
    // Obtener producto actual para comparar imágenes
    const productoActual = await Producto.findById(params.id);
    
    if (!productoActual) {
      return errorResponse('Producto no encontrado', 404);
    }
    
    // Limpiar y limitar array de imágenes
    if (body.imagenes && Array.isArray(body.imagenes)) {
      body.imagenes = limitArrayLength(
        body.imagenes.filter((img: any) => 
          img && typeof img === 'string' && img.trim() !== '' && img.startsWith('http')
        ),
        10
      );
      
      // Identificar imágenes que se eliminaron
      const imagenesActuales = productoActual.imagenes || [];
      const imagenesNuevas = body.imagenes || [];
      const imagenesAEliminar = imagenesActuales.filter(
        (imgActual: string) => !imagenesNuevas.includes(imgActual)
      );
      
      // Eliminar imágenes viejas de Cloudinary
      if (imagenesAEliminar.length > 0) {
        await Promise.all(
          imagenesAEliminar.map((url: string) => 
            deleteImage(url).catch((err) => {
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
     .populate('material', 'nombre');
    
    if (!producto) {
      return errorResponse('Producto no encontrado', 404);
    }
    
    return successResponse(producto, 'Producto actualizado exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al actualizar producto:', error);
    return handleMongoError(error);
  }
}

// DELETE: Eliminar producto (requiere auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    
    // Validar ObjectId
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de producto inválido', 400);
    }
    
    await connectDB();
    // Force model registration for serverless cold starts
    Categoria; Material;
    
    const producto = await Producto.findById(params.id);
    
    if (!producto) {
      return errorResponse('Producto no encontrado', 404);
    }
    
    // Eliminar imágenes de Cloudinary
    if (producto.imagenes && producto.imagenes.length > 0) {
      await Promise.all(
        producto.imagenes.map((url) => deleteImage(url).catch(console.error))
      );
    }
    
    await Producto.findByIdAndDelete(params.id);
    
    return successResponse(null, 'Producto eliminado exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al eliminar producto:', error);
    return errorResponse('Error al eliminar producto', 500);
  }
}
