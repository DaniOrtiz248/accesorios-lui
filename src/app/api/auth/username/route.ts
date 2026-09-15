import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleAuthError, handleMongoError } from '@/lib/api-utils';
import { validateTextInput } from '@/lib/security';

// PUT: Cambiar el username del administrador autenticado (requiere contraseña actual)
// Sólo permite modificar el propio usuario (identificado por el JWT), nunca por id
// recibido del cliente. No acepta rol/activo/_id ni otros campos.
export async function PUT(request: NextRequest) {
  try {
    const payload = verifyAdmin(request);
    await connectDB();

    const rawBody = await request.json();

    const currentPassword =
      typeof rawBody?.currentPassword === 'string' ? rawBody.currentPassword : '';
    const newUsernameRaw =
      typeof rawBody?.newUsername === 'string' ? rawBody.newUsername : '';
    const newUsername = newUsernameRaw.trim().toLowerCase();

    if (!currentPassword) {
      return errorResponse('La contraseña actual es requerida', 400);
    }

    if (
      !validateTextInput(newUsername, 3, 30) ||
      !/^[a-z0-9_.-]+$/.test(newUsername)
    ) {
      return errorResponse(
        'El nuevo usuario debe tener entre 3 y 30 caracteres y solo puede contener letras, números, punto, guion o guion bajo',
        400
      );
    }

    // Buscar únicamente al usuario autenticado (por id del JWT, no por dato del body)
    const usuario = await Usuario.findById(payload.userId).select('+password');

    if (!usuario) {
      return errorResponse('Usuario no encontrado', 404);
    }

    const isMatch = await usuario.comparePassword(currentPassword);

    if (!isMatch) {
      return errorResponse('Contraseña actual incorrecta', 401);
    }

    if (newUsername === usuario.username) {
      return errorResponse('El nuevo usuario debe ser diferente al actual', 400);
    }

    const existente = await Usuario.findOne({ username: newUsername });

    if (existente) {
      return errorResponse('Ese nombre de usuario ya está en uso', 409);
    }

    usuario.username = newUsername;
    await usuario.save();

    return successResponse(
      null,
      'Usuario actualizado exitosamente. Por seguridad, inicia sesión nuevamente.'
    );
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al actualizar username');
    return handleMongoError(error);
  }
}
