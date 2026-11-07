import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 10000,
});

export default cloudinary;

/**
 * Sube una imagen a Cloudinary
 * @param file - Base64 string de la imagen
 * @param folder - Carpeta en Cloudinary (ej: 'productos')
 * @returns URL pública y public_id de la imagen
 */
export async function uploadImage(
  file: string,
  folder: string = 'accesorios-lui',
  publicId?: string,
): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      ...(publicId ? { public_id: publicId, overwrite: false } : { folder }),
      timeout: 60000,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:best' },
      ],
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary');
    throw new Error('Error al subir imagen a Cloudinary');
  }
}
/**
 * Elimina una imagen de Cloudinary usando su public_id real.
 * Este es el método preferido y confiable.
 */
export async function deleteImageByPublicId(publicId: string): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    // not found permite reintentar después de perder la respuesta de un borrado.
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error('Cloudinary no confirmó la eliminación');
    }
  } catch (error) {
    console.error('Cloudinary no confirmó la eliminación de una imagen');
    throw new Error('Error al eliminar imagen de Cloudinary');
  }
}
