import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { username, password, nombre } = await request.json();

    if (!username || !password || !nombre) {
      return errorResponse('Todos los campos son requeridos', 400);
    }

    // Crear usuario
    const usuario = await Usuario.create({
      username,
      password,
      nombre,
      rol: 'admin',
    });

    return successResponse(
      {
        usuario: {
          id: usuario._id,
          username: usuario.username,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      },
      'Usuario registrado exitosamente'
    );
  } catch (error: any) {
    console.error('Error en registro:', error);
    return handleMongoError(error);
  }
}
