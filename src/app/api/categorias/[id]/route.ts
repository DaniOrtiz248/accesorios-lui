import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Categoria from '@/models/Categoria';
import Producto from '@/models/Producto';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';

// GET: Obtener categoría por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const categoria = await Categoria.findById(params.id);
    
    if (!categoria) {
      return errorResponse('Categoría no encontrada', 404);
    }
    
    return successResponse(categoria);
  } catch (error: any) {
    console.error('Error al obtener categoría:', error);
    return errorResponse('Error al obtener categoría', 500);
  }
}

// PUT: Actualizar categoría (requiere auth)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    await connectDB();
    
    const body = await request.json();
    const categoria = await Categoria.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!categoria) {
      return errorResponse('Categoría no encontrada', 404);
    }
    
    return successResponse(categoria, 'Categoría actualizada exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al actualizar categoría:', error);
    return handleMongoError(error);
  }
}

// DELETE: Eliminar categoría (requiere auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    await connectDB();
    
    // Verificar si hay productos con esta categoría
    const productosCount = await Producto.countDocuments({ categoria: params.id });
    
    if (productosCount > 0) {
      return errorResponse(
        `No se puede eliminar. Hay ${productosCount} producto(s) en esta categoría`,
        400
      );
    }
    
    const categoria = await Categoria.findByIdAndDelete(params.id);
    
    if (!categoria) {
      return errorResponse('Categoría no encontrada', 404);
    }
    
    return successResponse(null, 'Categoría eliminada exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al eliminar categoría:', error);
    return errorResponse('Error al eliminar categoría', 500);
  }
}
