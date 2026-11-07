import { NextRequest } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { successResponse, errorResponse, handleAuthError } from '@/lib/api-utils';
import { randomUUID } from 'crypto';
import connectDB from '@/lib/mongodb';
import Imagen from '@/models/Imagen';
import { PENDING_IMAGE_MS, tryCleanupImages } from '@/lib/image-lifecycle';
import { validateImageUrl } from '@/lib/image-validation';

// Tipos de archivo permitidos (solo imágenes)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || typeof file === 'string') {
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
    
    await connectDB();
    await Imagen.init();
    // Persistir identidad ANTES de subir: también recupera uploads cuya respuesta
    // se pierda o cuyo guardado posterior en MongoDB falle.
    const plannedId = `productos/${randomUUID()}`;
    await Imagen.create({
      _id: plannedId, publicId: plannedId,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      managed: true, state: 'uploading',
      references: [], expiresAt: new Date(Date.now() + PENDING_IMAGE_MS),
    });
    const { url, publicId } = await uploadImage(base64, 'productos', plannedId);
    if (publicId !== plannedId) throw new Error('Identificador de upload inesperado');
    validateImageUrl(url);
    const saved = await Imagen.updateOne({ _id: plannedId, state: 'uploading' }, { $set: { url, state: 'pending' } });
    if (saved.modifiedCount !== 1) throw new Error('No se pudo registrar la respuesta del upload');
    await tryCleanupImages();
    
    return successResponse({ url, publicId }, 'Imagen subida exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al subir imagen; las cargas registradas se recuperan mediante limpieza');
    return errorResponse('Error al subir imagen', 500);
  }
}
