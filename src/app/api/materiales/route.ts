import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Material from '@/models/Material';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';

// GET: Obtener todos los materiales (público)
export async function GET() {
  try {
    await connectDB();
    const materiales = await Material.find().sort({ nombre: 1 });
    return successResponse(materiales);
  } catch (error: any) {
    console.error('Error al obtener materiales:', error);
    return errorResponse('Error al obtener materiales', 500);
  }
}

// POST: Crear nuevo material (requiere auth)
export async function POST(request: NextRequest) {
  try {
    verifyAuth(request);
    await connectDB();
    
    const body = await request.json();
    const material = await Material.create(body);
    
    return successResponse(material, 'Material creado exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al crear material:', error);
    return handleMongoError(error);
  }
}
