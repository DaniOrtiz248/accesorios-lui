import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProducto extends Document {
  nombre: string;
  descripcion: string;
  precio: number;
  material: mongoose.Types.ObjectId | string; // Soporta ambos durante la migración
  categoria: mongoose.Types.ObjectId;
  imagenes: string[];
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductoSchema: Schema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    material: {
      type: Schema.Types.Mixed, // Permite String o ObjectId durante la migración
      ref: 'Material',
      required: [true, 'El material es requerido'],
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoría es requerida'],
    },
    imagenes: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5;
        },
        message: 'No puedes subir más de 5 imágenes',
      },
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

// Índices para búsquedas optimizadas
ProductoSchema.index({ nombre: 'text', descripcion: 'text' });
ProductoSchema.index({ categoria: 1, activo: 1 });
ProductoSchema.index({ precio: 1 });

const Producto: Model<IProducto> =
  mongoose.models.Producto || mongoose.model<IProducto>('Producto', ProductoSchema);

export default Producto;
