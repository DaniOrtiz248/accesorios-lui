import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Categoria from '@/models/Categoria';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';

// GET: Obtener todas las categorías activas (público)
export async function GET() {
  try {
    await connectDB();
    
    const categorias = await Categoria.find({ activo: true }).sort({ nombre: 1 });
    
    return successResponse(categorias);
  } catch (error: any) {
    console.error('Error al obtener categorías:', error);
    return errorResponse('Error al obtener categorías', 500);
  }
}

// POST: Crear nueva categoría (requiere auth)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    verifyAuth(request);
    
    await connectDB();
    
    const body = await request.json();
    const categoria = await Categoria.create(body);
    
    return successResponse(categoria, 'Categoría creada exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al crear categoría:', error);
    return handleMongoError(error);
  }
}
