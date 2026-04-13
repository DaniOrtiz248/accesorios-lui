import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Rate limiting simple en memoria (se reinicia en cold starts pero protege durante sesiones activas)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  
  if (!record || now - record.lastAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return false;
  }
  
  record.count++;
  record.lastAttempt = now;
  
  return record.count > MAX_ATTEMPTS;
}

function resetAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    if (isRateLimited(ip)) {
      return errorResponse('Demasiados intentos. Intenta de nuevo en 15 minutos', 429);
    }
    
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
    resetAttempts(ip);
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
