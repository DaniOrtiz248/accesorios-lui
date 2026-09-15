import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Rate limiting simple en memoria (se reinicia en cold starts pero protege durante sesiones activas).
// NOTA: en un despliegue serverless con múltiples instancias (Vercel) esta protección es por-instancia,
// no distribuida. Para protección robusta contra ataques distribuidos se recomienda un store
// compartido (Redis, Upstash, etc.) — fuera del alcance de este cambio mínimo.
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_MAP_SIZE = 5000; // límite de seguridad para evitar crecimiento ilimitado del Map

function buildKey(ip: string, username: string): string {
  // Combinar IP + usuario: limita tanto el abuso desde una IP como el
  // bruteforce dirigido a una cuenta específica desde múltiples IPs.
  return `${ip}:${username.toLowerCase().trim()}`;
}

function cleanupStaleEntries(): void {
  if (loginAttempts.size <= MAX_MAP_SIZE) return;
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (now - record.lastAttempt > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(key);
  
  if (!record || now - record.lastAttempt > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, lastAttempt: now });
    return false;
  }
  
  record.count++;
  record.lastAttempt = now;
  
  return record.count > MAX_ATTEMPTS;
}

function getRetryAfterSeconds(key: string): number {
  const record = loginAttempts.get(key);
  if (!record) return Math.ceil(WINDOW_MS / 1000);
  const elapsed = Date.now() - record.lastAttempt;
  return Math.max(1, Math.ceil((WINDOW_MS - elapsed) / 1000));
}

function resetAttempts(key: string): void {
  loginAttempts.delete(key);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    await connectDB();
    
    const { username, password } = await request.json();

    if (!username || !password) {
      return errorResponse('Usuario y contraseña son requeridos', 400);
    }

    cleanupStaleEntries();
    const key = buildKey(ip, username);

    if (isRateLimited(key)) {
      const retryAfter = getRetryAfterSeconds(key);
      return errorResponse(
        `Demasiados intentos. Intenta de nuevo en ${Math.ceil(retryAfter / 60)} minutos`,
        429
      );
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
    resetAttempts(key);
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
