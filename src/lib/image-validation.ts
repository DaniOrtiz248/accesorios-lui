import { sanitizeObject } from './security';

export class ImageInputError extends Error {
  constructor(message: string) { super(message); this.name = 'ImageInputError'; }
}

export interface ImageReference { url: string; publicId: string; }

export function validateImageUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length > 4096 || /[\s\u0000-\u001f]/.test(value)) {
    throw new ImageInputError('URL de imagen inválida');
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' ||
        url.username || url.password || url.port || url.hash) throw new Error();
    return value; // Nunca truncar ni reconstruir la URL.
  } catch { throw new ImageInputError('URL de imagen inválida'); }
}

export function validatePublicId(value: unknown): string {
  if (value === '' || value === undefined || value === null) return '';
  if (typeof value !== 'string' || value.length > 255 ||
      /[\u0000-\u001f\u007f?&#\\%<>]/.test(value) || value.trim() !== value ||
      value.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new ImageInputError('Identificador de imagen inválido');
  }
  return value;
}

// La sanitización de textos comerciales no se aplica a URLs ni public IDs.
export function sanitizeImageBody(body: Record<string, any>): Record<string, any> {
  const { imagenes, imagenesPublicIds, imagen, imagenPublicId, ...text } = body;
  const result = sanitizeObject(text);
  for (const key of ['imagenes', 'imagenesPublicIds', 'imagen', 'imagenPublicId']) {
    if (Object.prototype.hasOwnProperty.call(body, key)) result[key] = body[key];
  }
  return result;
}

export function productImageReferences(body: Record<string, any>): ImageReference[] {
  if (!Array.isArray(body.imagenes) || body.imagenes.length > 10) {
    throw new ImageInputError('Se permiten hasta 10 imágenes');
  }
  const ids = body.imagenesPublicIds ?? [];
  if (!Array.isArray(ids) || (ids.length !== 0 && ids.length !== body.imagenes.length)) {
    throw new ImageInputError('Las imágenes y sus identificadores no coinciden');
  }
  const refs = body.imagenes.map((url: unknown, index: number) => ({
    url: validateImageUrl(url), publicId: validatePublicId(ids[index]),
  }));
  if (new Set(refs.map(ref => ref.url)).size !== refs.length) {
    throw new ImageInputError('No se puede repetir una imagen');
  }
  return refs;
}

export function categoryImageReferences(body: Record<string, any>): ImageReference[] {
  if (!body.imagen) {
    if (body.imagen !== '' && body.imagen !== undefined && body.imagen !== null) {
      throw new ImageInputError('URL de imagen inválida');
    }
    if (body.imagenPublicId) throw new ImageInputError('Falta la URL de imagen');
    return [];
  }
  return [{ url: validateImageUrl(body.imagen), publicId: validatePublicId(body.imagenPublicId) }];
}
