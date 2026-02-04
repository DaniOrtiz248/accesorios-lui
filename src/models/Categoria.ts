import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategoria extends Document {
  nombre: string;
  descripcion?: string;
  slug: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategoriaSchema: Schema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      unique: true,
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    descripcion: {
      type: String,
      maxlength: [200, 'La descripción no puede exceder 200 caracteres'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
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

// Generar slug automáticamente antes de guardar
CategoriaSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('nombre')) {
    this.slug = this.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// También generar slug en create
CategoriaSchema.pre('validate', function (next) {
  if (!this.slug && this.nombre) {
    this.slug = this.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Categoria: Model<ICategoria> =
  mongoose.models.Categoria || mongoose.model<ICategoria>('Categoria', CategoriaSchema);

export default Categoria;
