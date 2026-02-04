import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Verificando autenticación...');
    verifyAuth(request);
    
    console.log('📦 Obteniendo FormData...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📁 Archivo recibido:', file ? `${file.name} (${file.size} bytes)` : 'null');
    
    if (!file) {
      return errorResponse('No se proporcionó ninguna imagen', 400);
    }

    console.log('🔄 Convirtiendo a base64...');
    // Convertir File a base64 para Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    console.log('☁️ Subiendo a Cloudinary...');
    const imageUrl = await uploadImage(base64, 'productos');
    console.log('✅ Imagen subida exitosamente:', imageUrl);
    
    return successResponse({ url: imageUrl }, 'Imagen subida exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      console.error('❌ Error de autenticación:', error.message);
      return errorResponse(error.message, 401);
    }
    console.error('❌ Error al subir imagen:', error);
    return errorResponse('Error al subir imagen: ' + error.message, 500);
  }
}
