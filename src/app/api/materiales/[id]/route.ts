import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Material from '@/models/Material';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';
import { isValidObjectId, sanitizeObject, pickAllowedFields } from '@/lib/security';

const ALLOWED_MATERIAL_FIELDS = ['nombre', 'descripcion'] as const;

// PUT: Actualizar material (requiere rol admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdmin(request);
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de material inválido', 400);
    }
    await connectDB();
    
    const rawBody = await request.json();
    const body = sanitizeObject(pickAllowedFields<any>(rawBody, ALLOWED_MATERIAL_FIELDS as unknown as string[]));
    
    const material = await Material.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!material) {
      return errorResponse('Material no encontrado', 404);
    }
    
    return successResponse(material, 'Material actualizado exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al actualizar material:', error);
    return handleMongoError(error);
  }
}

// DELETE: Eliminar material (requiere rol admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdmin(request);
    if (!isValidObjectId(params.id)) {
      return errorResponse('ID de material inválido', 400);
    }
    await connectDB();
    
    const material = await Material.findByIdAndDelete(params.id);
    
    if (!material) {
      return errorResponse('Material no encontrado', 404);
    }
    
    return successResponse(null, 'Material eliminado exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al eliminar material:', error);
    return errorResponse('Error al eliminar material', 500);
  }
}
