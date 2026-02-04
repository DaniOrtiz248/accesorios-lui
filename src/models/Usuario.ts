import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUsuario extends Document {
  username: string;
  password: string;
  nombre: string;
  rol: 'admin';
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UsuarioSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'El usuario es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'El usuario debe tener al menos 3 caracteres'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    rol: {
      type: String,
      enum: ['admin'],
      default: 'admin',
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

// Hash password antes de guardar
UsuarioSchema.pre<IUsuario>('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar contraseñas
UsuarioSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Usuario: Model<IUsuario> =
  mongoose.models.Usuario || mongoose.model<IUsuario>('Usuario', UsuarioSchema);

export default Usuario;
