import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Por favor define la variable JWT_SECRET en las variables de entorno');
  }
  return secret;
}

export interface JWTPayload {
  userId: string;
  username: string;
  rol: string;
}

/**
 * Genera un token JWT
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJWTSecret(), { expiresIn: '7d' });
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJWTSecret()) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extrae el token del header Authorization
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware: Verifica si el usuario está autenticado
 */
export function verifyAuth(request: NextRequest): JWTPayload {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    throw new Error('No autorizado');
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    throw new Error('Token inválido o expirado');
  }

  return payload;
}

/**
 * Error tipado para distinguir problemas de autorización (403) de
 * problemas de autenticación (401) en los handlers de las rutas.
 */
export class ForbiddenError extends Error {
  constructor(message: string = 'No tienes permisos para realizar esta acción') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Middleware: Verifica autenticación Y que el usuario tenga rol 'admin'.
 * Reutiliza verifyAuth() para la parte de autenticación.
 */
export function verifyAdmin(request: NextRequest): JWTPayload {
  const payload = verifyAuth(request);

  if (payload.rol !== 'admin') {
    throw new ForbiddenError();
  }

  return payload;
}
