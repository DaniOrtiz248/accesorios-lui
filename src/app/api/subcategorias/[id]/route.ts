import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subcategoria from '@/models/Subcategoria';
import Categoria from '@/models/Categoria';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';
import { isValidObjectId, sanitizeObject } from '@/lib/security';

// GET: Obtener subcategoría por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidObjectId(params.id)) return errorResponse('ID inválido', 400);
    await connectDB();
    Categoria;

    const subcategoria = await Subcategoria.findById(params.id).populate('categoria', 'nombre');
    if (!subcategoria) return errorResponse('Subcategoría no encontrada', 404);

    return successResponse(subcategoria);
  } catch (error: any) {
    console.error('Error al obtener subcategoría:', error);
    return errorResponse('Error al obtener subcategoría', 500);
  }
}

// PUT: Actualizar subcategoría (requiere auth)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    if (!isValidObjectId(params.id)) return errorResponse('ID inválido', 400);
    await connectDB();
    Categoria;

    const body = sanitizeObject(await request.json());

    if (body.categoria && !isValidObjectId(body.categoria)) {
      return errorResponse('ID de categoría inválido', 400);
    }

    const subcategoria = await Subcategoria.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('categoria', 'nombre');

    if (!subcategoria) return errorResponse('Subcategoría no encontrada', 404);

    return successResponse(subcategoria, 'Subcategoría actualizada exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al actualizar subcategoría:', error);
    return handleMongoError(error);
  }
}

// DELETE: Eliminar subcategoría (requiere auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    if (!isValidObjectId(params.id)) return errorResponse('ID inválido', 400);
    await connectDB();

    const subcategoria = await Subcategoria.findByIdAndDelete(params.id);
    if (!subcategoria) return errorResponse('Subcategoría no encontrada', 404);

    return successResponse(null, 'Subcategoría eliminada exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al eliminar subcategoría:', error);
    return errorResponse('Error al eliminar subcategoría', 500);
  }
}
