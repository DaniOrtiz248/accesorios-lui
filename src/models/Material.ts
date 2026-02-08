import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMaterial extends Document {
  nombre: string;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema: Schema = new Schema(
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
      trim: true,
      maxlength: [200, 'La descripción no puede exceder 200 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

const Material: Model<IMaterial> =
  mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);

export default Material;
