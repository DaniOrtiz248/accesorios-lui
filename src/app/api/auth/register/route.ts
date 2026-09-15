import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';

// POST: Crear nuevo admin (requiere rol admin - solo admins existentes pueden crear nuevos)
export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);
    
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
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error en registro:', error);
    return handleMongoError(error);
  }
}
