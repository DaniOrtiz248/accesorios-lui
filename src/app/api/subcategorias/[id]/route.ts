import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subcategoria from '@/models/Subcategoria';
import Categoria from '@/models/Categoria';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';
import { isValidObjectId, sanitizeObject, pickAllowedFields } from '@/lib/security';

const ALLOWED_SUBCATEGORIA_FIELDS = ['nombre', 'descripcion', 'categoria', 'activo'] as const;

// GET: Obtener subcategoría por ID (público si está activa; inactiva sólo para admin)
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

    if (!subcategoria.activo) {
      try {
        verifyAdmin(request);
      } catch {
        return errorResponse('Subcategoría no encontrada', 404);
      }
    }

    return successResponse(subcategoria);
  } catch (error: any) {
    console.error('Error al obtener subcategoría:', error);
    return errorResponse('Error al obtener subcategoría', 500);
  }
}

// PUT: Actualizar subcategoría (requiere rol admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdmin(request);
    if (!isValidObjectId(params.id)) return errorResponse('ID inválido', 400);
    await connectDB();
    Categoria;

    const rawBody = await request.json();
    const body = sanitizeObject(pickAllowedFields<any>(rawBody, ALLOWED_SUBCATEGORIA_FIELDS as unknown as string[]));

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
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al actualizar subcategoría:', error);
    return handleMongoError(error);
  }
}

// DELETE: Eliminar subcategoría (requiere rol admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdmin(request);
    if (!isValidObjectId(params.id)) return errorResponse('ID inválido', 400);
    await connectDB();

    const subcategoria = await Subcategoria.findByIdAndDelete(params.id);
    if (!subcategoria) return errorResponse('Subcategoría no encontrada', 404);

    return successResponse(null, 'Subcategoría eliminada exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al eliminar subcategoría:', error);
    return errorResponse('Error al eliminar subcategoría', 500);
  }
}
