import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Tipos de archivo permitidos (solo imágenes)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    verifyAuth(request);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return errorResponse('No se proporcionó ninguna imagen', 400);
    }

    // Validaciones de seguridad
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG y WebP', 400);
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('El archivo es demasiado grande. Máximo 10MB', 400);
    }
    
    if (file.size < 100) {
      return errorResponse('El archivo es demasiado pequeño. Posible archivo corrupto', 400);
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
