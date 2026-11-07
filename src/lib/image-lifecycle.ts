import { createHash } from 'crypto';
import mongoose, { ClientSession, Model } from 'mongoose';
import Imagen from '@/models/Imagen';
import Producto from '@/models/Producto';
import Categoria from '@/models/Categoria';
import { deleteImageByPublicId } from './cloudinary';
import {
  ImageInputError, ImageReference, productImageReferences, categoryImageReferences,
} from './image-validation';

export const PENDING_IMAGE_MS = 24 * 60 * 60 * 1000;
type Entity = 'producto' | 'categoria';

function savedReferences(entity: Entity, doc: any): ImageReference[] {
  if (!doc) return [];
  if (entity === 'categoria') return doc.imagen ? [{ url: doc.imagen, publicId: doc.imagenPublicId || '' }] : [];
  return (doc.imagenes || []).map((url: string, index: number) => ({
    url, publicId: doc.imagenesPublicIds?.[index] || '',
  }));
}

// Los registros antiguos sólo se reconocen desde documentos persistidos, nunca
// a partir de un public_id arbitrario enviado por el cliente.
async function existingReference(url: string, session: ClientSession): Promise<ImageReference | null> {
  const product = await Producto.findOne({ imagenes: url }).session(session);
  if (product) return savedReferences('producto', product).find(ref => ref.url === url)!;
  const category = await Categoria.findOne({ imagen: url }).session(session);
  return category ? savedReferences('categoria', category)[0] : null;
}

async function reserve(ref: ImageReference, owner: string, session: ClientSession): Promise<ImageReference> {
  let image = await Imagen.findOne({ url: ref.url }).session(session);
  if (!image) {
    const legacy = await existingReference(ref.url, session);
    if (!legacy || (ref.publicId && ref.publicId !== legacy.publicId)) {
      throw new ImageInputError('La imagen no corresponde a una carga registrada');
    }
    // Nunca borrar automáticamente un archivo heredado sin prueba de upload.
    [image] = await Imagen.create([{
      _id: `legacy:${createHash('sha256').update(ref.url).digest('hex')}`,
      url: ref.url, publicId: legacy.publicId || undefined, managed: false,
      state: 'review', references: [], expiresAt: new Date(),
      lastError: 'Imagen heredada: requiere comprobar asociación antes de eliminar',
    }], { session });
  }
  if (ref.publicId && ref.publicId !== (image.publicId || '')) {
    throw new ImageInputError('La URL y el identificador no corresponden a la misma imagen');
  }
  if (['uploading', 'deleting', 'deleted'].includes(image.state)) {
    throw new ImageInputError('La imagen no está disponible; vuelve a subirla');
  }
  // Esta escritura comparte transacción con el producto/categoría. Compite
  // atómicamente con la transición a deleting del recolector.
  await Imagen.updateOne({ _id: image._id }, {
    $addToSet: { references: owner },
    $set: { state: image.managed ? 'active' : 'review' },
  }, { session });
  return { url: ref.url, publicId: image.publicId || '' };
}

/** MongoDB confirma documento + referencias + bajas pendientes en una transacción.
 * Ninguna llamada destructiva a Cloudinary ocurre dentro de la transacción. */
export async function saveWithImages(
  entity: Entity, id: string, body: Record<string, any>, operation: 'create' | 'update' | 'delete',
) {
  await Imagen.init();
  const session = await mongoose.startSession();
  let result: any = null;
  try {
    await session.withTransaction(async () => {
      const model: Model<any> = entity === 'producto' ? Producto : Categoria;
      const current = operation === 'create' ? null : await model.findById(id).session(session);
      if (operation !== 'create' && !current) { result = null; return; }
      const owner = `${entity}:${id}`;
      const previous = savedReferences(entity, current);
      const changesImages = operation === 'create' || operation === 'delete' ||
        Object.prototype.hasOwnProperty.call(body, entity === 'producto' ? 'imagenes' : 'imagen');
      if (!changesImages && Object.prototype.hasOwnProperty.call(body,
        entity === 'producto' ? 'imagenesPublicIds' : 'imagenPublicId')) {
        throw new ImageInputError('Debes enviar la imagen junto con su identificador');
      }
      let next = previous;
      const update = { ...body };
      if (changesImages) {
        next = operation === 'delete' ? [] : entity === 'producto'
          ? productImageReferences({ imagenes: [], ...body }) : categoryImageReferences(body);
        const resolved: ImageReference[] = [];
        for (const ref of next) resolved.push(await reserve(ref, owner, session));
        next = resolved;
        if (entity === 'producto') {
          update.imagenes = next.map(ref => ref.url);
          update.imagenesPublicIds = next.map(ref => ref.publicId);
        } else {
          update.imagen = next[0]?.url || '';
          update.imagenPublicId = next[0]?.publicId || '';
        }
      }
      if (operation === 'delete') {
        result = await model.findByIdAndDelete(id, { session });
      } else if (operation === 'create') {
        [result] = await model.create([{ ...update, _id: id }], { session });
      } else {
        result = await model.findByIdAndUpdate(id, update, { new: true, runValidators: true, session });
      }
      if (changesImages) {
        for (const ref of previous.filter(old => !next.some(image => image.url === old.url))) {
          let image = await Imagen.findOne({ url: ref.url }).session(session);
          if (!image) {
            [image] = await Imagen.create([{
              _id: `legacy:${createHash('sha256').update(ref.url).digest('hex')}`,
              url: ref.url, publicId: ref.publicId || undefined, managed: false,
              state: 'review', references: [], expiresAt: new Date(),
              lastError: 'Imagen heredada retirada: revisar manualmente; no se borra automáticamente',
            }], { session });
          }
          await Imagen.updateOne({ _id: image._id }, { $pull: { references: owner } }, { session });
          await Imagen.updateOne({ _id: image._id, managed: true, references: { $size: 0 } }, {
            $set: { state: 'delete_pending', nextAttemptAt: new Date() },
          }, { session });
        }
      }
    });
    return result;
  } finally { await session.endSession(); }
}

function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

async function isReferenced(url: string | undefined, publicId: string): Promise<boolean> {
  // También protege URLs heredadas con versión, transformación o extensión
  // distinta que todavía no tengan public_id. Ante coincidencia conservamos.
  const cloud = escapeRegex(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '');
  const aliases = new RegExp(`^https://res\\.cloudinary\\.com/${cloud}/image/upload/(?:[^?#]*/)?${escapeRegex(publicId)}(?:\\.[^/?#]+)?(?:[?#].*)?$`);
  const urls: any[] = [{ imagenes: aliases }];
  const categoryUrls: any[] = [{ imagen: aliases }];
  if (url) { urls.push({ imagenes: url }); categoryUrls.push({ imagen: url }); }
  const [product, category] = await Promise.all([
    Producto.exists({ $or: [{ imagenesPublicIds: publicId }, ...urls] }),
    Categoria.exists({ $or: [{ imagenPublicId: publicId }, ...categoryUrls] }),
  ]);
  return !!(product || category);
}

/** Lotes pequeños: admin autenticado o mutación. No depende de unload.
 * Reintentos persistentes; sólo uploads registrados por este servidor. */
export async function cleanupImages(limit = 10) {
  const startedAt = Date.now();
  const now = new Date();
  const candidates = await Imagen.find({ managed: true, references: { $size: 0 }, $or: [
    { state: { $in: ['uploading', 'pending'] }, expiresAt: { $lte: now } },
    { state: 'delete_pending', nextAttemptAt: { $lte: now } },
    { state: 'deleting', updatedAt: { $lte: new Date(Date.now() - 5 * 60 * 1000) } },
  ] }).sort({ nextAttemptAt: 1 }).limit(limit).lean();
  const summary = { deleted: 0, failed: 0, protected: 0 };
  for (const candidate of candidates) {
    if (Date.now() - startedAt > 5000) break;
    const image = await Imagen.findOneAndUpdate({
      _id: candidate._id, state: candidate.state, updatedAt: candidate.updatedAt,
      references: { $size: 0 }, managed: true,
    }, { $set: { state: 'deleting' }, $inc: { attempts: 1 } }, { new: true });
    if (!image) continue;
    try {
      if (!image.cloudName || image.cloudName !== process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        await Imagen.updateOne({ _id: image._id }, { $set: {
          state: 'review', lastError: 'Cuenta Cloudinary distinta o desconocida: archivo conservado',
        } });
        summary.protected++;
        continue;
      }
      if (!image.publicId || image._id !== image.publicId || !image.publicId.startsWith('productos/')) {
        throw new Error('Identidad de carga no comprobada');
      }
      if (await isReferenced(image.url, image.publicId)) {
        await Imagen.updateOne({ _id: image._id }, { $set: {
          state: 'review', lastError: 'Existe una referencia: archivo conservado para revisión',
        } });
        summary.protected++;
        continue;
      }
      await deleteImageByPublicId(image.publicId);
      await Imagen.updateOne({ _id: image._id }, {
        $set: { state: 'deleted' }, $unset: { lastError: 1 },
      });
      summary.deleted++;
    } catch {
      // No persistir errores del SDK que puedan contener credenciales/payloads.
      await Imagen.updateOne({ _id: image._id }, { $set: {
        state: 'delete_pending', lastError: 'No se pudo confirmar el borrado; pendiente de reintento',
        nextAttemptAt: new Date(Date.now() + Math.min(24 * 60, 2 ** Math.min(image.attempts, 10)) * 60000),
      } });
      console.error('Eliminación de imagen pendiente', { imageId: image._id });
      summary.failed++;
    }
  }
  return summary;
}

export async function tryCleanupImages() {
  try { return await cleanupImages(1); }
  catch { console.error('No se pudo ejecutar la limpieza; el registro persistente se conserva'); }
}
