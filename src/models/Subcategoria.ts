import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubcategoria extends Document {
  nombre: string;
  descripcion?: string;
  categoria: mongoose.Types.ObjectId;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubcategoriaSchema: Schema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripción no puede exceder 200 caracteres'],
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoría es requerida'],
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SubcategoriaSchema.index({ categoria: 1, activo: 1 });
SubcategoriaSchema.index({ categoria: 1, nombre: 1 }, { unique: true });

const Subcategoria: Model<ISubcategoria> =
  mongoose.models.Subcategoria || mongoose.model<ISubcategoria>('Subcategoria', SubcategoriaSchema);

export default Subcategoria;
