import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Categoria from '@/models/Categoria';
import Producto from '@/models/Producto';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';
import { isValidObjectId, sanitizeObject, pickAllowedFields } from '@/lib/security';

const ALLOWED_CATEGORIA_FIELDS = ['nombre', 'descripcion', 'imagen', 'activo'] as const;

// GET: Obtener categoría por ID (público si está activa; inactiva sólo para admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de categoría inválido', 400);
    }

    await connectDB();
    
    const categoria = await Categoria.findById(params.id);
    
    if (!categoria) {
      return errorResponse('Categoría no encontrada', 404);
    }

    if (!categoria.activo) {
      try {
        verifyAdmin(request);
      } catch {
        return errorResponse('Categoría no encontrada', 404);
      }
    }
    
    return successResponse(categoria);
  } catch (error: any) {
    console.error('Error al obtener categoría:', error);
    return errorResponse('Error al obtener categoría', 500);
  }
}

// PUT: Actualizar categoría (requiere rol admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdmin(request);
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de categoría inválido', 400);
    }
    await connectDB();
    
    const rawBody = await request.json();
    const body = sanitizeObject(pickAllowedFields<any>(rawBody, ALLOWED_CATEGORIA_FIELDS as unknown as string[]));

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
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al actualizar categoría:', error);
    return handleMongoError(error);
  }
}

// DELETE: Eliminar categoría (requiere rol admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdmin(request);
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de categoría inválido', 400);
    }
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
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al eliminar categoría:', error);
    return errorResponse('Error al eliminar categoría', 500);
  }
}
