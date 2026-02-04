import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

export interface JWTPayload {
  userId: string;
  username: string;
  rol: string;
}

/**
 * Genera un token JWT
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
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
