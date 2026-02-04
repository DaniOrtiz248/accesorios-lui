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
 * @returns URL pública de la imagen
 */
export async function uploadImage(file: string, folder: string = 'accesorios-lui'): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw new Error('Error al subir imagen a Cloudinary');
  }
}

/**
 * Elimina una imagen de Cloudinary
 * @param imageUrl - URL de la imagen a eliminar
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
