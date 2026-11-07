import mongoose, { Schema, Model } from 'mongoose';

export interface IImagen {
  _id: string;
  url?: string;
  publicId?: string;
  cloudName?: string;
  managed: boolean;
  state: 'uploading' | 'pending' | 'active' | 'delete_pending' | 'deleting' | 'deleted' | 'review';
  references: string[];
  expiresAt: Date;
  nextAttemptAt: Date;
  attempts: number;
  lastError?: string;
  updatedAt: Date;
}

// Sin TTL: borrar el registro antes que el archivo impediría recuperarlo.
const schema = new Schema<IImagen>({
  _id: String,
  url: { type: String, index: true, unique: true, sparse: true },
  publicId: String,
  cloudName: String,
  managed: { type: Boolean, default: false },
  state: { type: String, required: true },
  references: { type: [String], default: [] },
  expiresAt: { type: Date, required: true },
  nextAttemptAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 },
  lastError: String,
}, { timestamps: true, collection: 'imagenes' });
schema.index({ state: 1, nextAttemptAt: 1 });

const Imagen: Model<IImagen> = mongoose.models.Imagen || mongoose.model<IImagen>('Imagen', schema);
export default Imagen;
