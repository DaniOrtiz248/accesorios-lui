import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    verifyAuth(request);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return errorResponse('No se proporcionó ninguna imagen', 400);
    }

    // Convertir File a base64 para Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    const imageUrl = await uploadImage(base64, 'productos');
    
    return successResponse({ url: imageUrl }, 'Imagen subida exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al subir imagen:', error);
    return errorResponse('Error al subir imagen', 500);
  }
}
