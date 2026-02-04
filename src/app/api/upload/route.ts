import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    verifyAuth(request);
    
    const formData = await request.json();
    const { file, folder } = formData;
    
    if (!file) {
      return errorResponse('No se proporcionó ninguna imagen', 400);
    }
    
    const imageUrl = await uploadImage(file, folder || 'accesorios-lui');
    
    return successResponse({ url: imageUrl }, 'Imagen subida exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al subir imagen:', error);
    return errorResponse('Error al subir imagen', 500);
  }
}
