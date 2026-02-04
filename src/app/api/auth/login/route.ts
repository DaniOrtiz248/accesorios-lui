import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { username, password } = await request.json();

    if (!username || !password) {
      return errorResponse('Usuario y contraseña son requeridos', 400);
    }

    // Buscar usuario con password
    const usuario = await Usuario.findOne({ username, activo: true }).select('+password');

    if (!usuario) {
      return errorResponse('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isMatch = await usuario.comparePassword(password);

    if (!isMatch) {
      return errorResponse('Credenciales inválidas', 401);
    }

    // Generar token
    const token = generateToken({
      userId: usuario._id.toString(),
      username: usuario.username,
      rol: usuario.rol,
    });

    return successResponse(
      {
        token,
        usuario: {
          id: usuario._id,
          username: usuario.username,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      },
      'Login exitoso'
    );
  } catch (error: any) {
    console.error('Error en login:', error);
    return errorResponse('Error al iniciar sesión', 500);
  }
}
