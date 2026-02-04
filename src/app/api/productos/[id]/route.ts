import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Producto from '@/models/Producto';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';
import { deleteImage } from '@/lib/cloudinary';

// GET: Obtener producto por ID (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const producto = await Producto.findById(params.id).populate('categoria', 'nombre slug');
    
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
    await connectDB();
    
    const body = await request.json();
    
    // Limpiar array de imágenes: eliminar valores null, undefined o strings vacíos
    if (body.imagenes && Array.isArray(body.imagenes)) {
      body.imagenes = body.imagenes.filter((img: any) => img && typeof img === 'string' && img.trim() !== '');
    }
    
    const producto = await Producto.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('categoria', 'nombre slug');
    
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
    await connectDB();
    
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
