import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
  folder: string = 'accesorios-lui'
): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:best' },
      ],
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw new Error('Error al subir imagen a Cloudinary');
  }
}

/**
 * Elimina una imagen de Cloudinary usando su public_id real.
 * Este es el método preferido y confiable.
 */
export async function deleteImageByPublicId(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    throw new Error('Error al eliminar imagen de Cloudinary');
  }
}

/**
 * Elimina una imagen de Cloudinary a partir de su URL.
 * @deprecated Método legado (frágil) usado sólo como fallback para imágenes
 * antiguas que no tienen un public_id almacenado en la base de datos.
 * Preferir siempre deleteImageByPublicId() cuando se disponga del public_id.
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    throw new Error('Error al eliminar imagen de Cloudinary');
  }
}

/**
 * Elimina una imagen usando su public_id si está disponible; si no,
 * recurre al método legado de parseo de URL (compatibilidad con
 * productos creados antes de almacenar public_id).
 */
export async function deleteProductImage(url: string, publicId?: string | null): Promise<void> {
  if (publicId) {
    return deleteImageByPublicId(publicId);
  }
  return deleteImage(url);
}
