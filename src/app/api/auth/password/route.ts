import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleAuthError, handleMongoError } from '@/lib/api-utils';

// PUT: Cambiar la contraseña del administrador autenticado.
// Sólo permite modificar el propio usuario (identificado por el JWT).
// Reutiliza el hook pre-save del modelo Usuario (bcrypt, 10 salt rounds) —
// no implementa una lógica de hashing paralela.
export async function PUT(request: NextRequest) {
  try {
    const payload = verifyAdmin(request);
    await connectDB();

    const rawBody = await request.json();

    const currentPassword =
      typeof rawBody?.currentPassword === 'string' ? rawBody.currentPassword : '';
    const newPassword =
      typeof rawBody?.newPassword === 'string' ? rawBody.newPassword : '';
    const confirmPassword =
      typeof rawBody?.confirmPassword === 'string' ? rawBody.confirmPassword : '';

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse('Todos los campos son requeridos', 400);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse('Las contraseñas nuevas no coinciden', 400);
    }

    if (newPassword.length < 8 || newPassword.length > 100) {
      return errorResponse('La nueva contraseña debe tener entre 8 y 100 caracteres', 400);
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

    const isSamePassword = await usuario.comparePassword(newPassword);

    if (isSamePassword) {
      return errorResponse('La nueva contraseña debe ser diferente a la actual', 400);
    }

    // Asignar en texto plano: el hook pre('save') del modelo se encarga de
    // hashear con bcrypt (10 salt rounds), igual que en el registro.
    usuario.password = newPassword;
    await usuario.save();

    return successResponse(
      null,
      'Contraseña actualizada exitosamente. Por seguridad, inicia sesión nuevamente.'
    );
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al actualizar contraseña');
    return handleMongoError(error);
  }
}
