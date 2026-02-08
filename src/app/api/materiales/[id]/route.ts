import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Material from '@/models/Material';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';

// PUT: Actualizar material (requiere auth)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    await connectDB();
    
    const body = await request.json();
    
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
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al actualizar material:', error);
    return handleMongoError(error);
  }
}

// DELETE: Eliminar material (requiere auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    await connectDB();
    
    const material = await Material.findByIdAndDelete(params.id);
    
    if (!material) {
      return errorResponse('Material no encontrado', 404);
    }
    
    return successResponse(null, 'Material eliminado exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al eliminar material:', error);
    return errorResponse('Error al eliminar material', 500);
  }
}
