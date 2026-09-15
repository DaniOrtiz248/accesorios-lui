/**
 * Utilidad de recorte de imágenes en el cliente (canvas).
 * No interactúa con Cloudinary ni con el backend: solo genera un Blob
 * recortado a partir de una imagen fuente y un área de recorte en píxeles.
 */

export interface PixelCropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // Necesario para poder leer los píxeles de imágenes servidas desde
    // Cloudinary (dominio distinto) sin "taintear" el canvas.
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = url;
  });
}

/**
 * Recorta una imagen según el área de píxeles indicada y devuelve un Blob
 * JPEG. Limita la dimensión máxima de salida para evitar archivos
 * innecesariamente grandes, sin degradar la calidad visual perceptible
 * (Cloudinary además aplica su propio límite/transformación al subir).
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: PixelCropArea,
  maxDimension: number = 1600,
  quality: number = 0.92
): Promise<Blob> {
  const image = await createImage(imageSrc);

  let targetWidth = Math.max(1, Math.round(pixelCrop.width));
  let targetHeight = Math.max(1, Math.round(pixelCrop.height));

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    const scale = maxDimension / Math.max(targetWidth, targetHeight);
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo obtener el contexto del canvas');
  }
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Error al generar la imagen recortada'));
      },
      'image/jpeg',
      quality
    );
  });
}
