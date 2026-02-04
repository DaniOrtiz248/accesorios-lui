/**
 * Respuesta de éxito estandarizada
 */
export function successResponse(data: any, message?: string) {
  return Response.json({
    success: true,
    message,
    data,
  });
}

/**
 * Respuesta de error estandarizada
 */
export function errorResponse(message: string, status: number = 400) {
  return Response.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

/**
 * Maneja errores de MongoDB
 */
export function handleMongoError(error: any) {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return errorResponse(`Ya existe un registro con ese ${field}`, 409);
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return errorResponse(messages.join(', '), 400);
  }

  return errorResponse('Error interno del servidor', 500);
}
