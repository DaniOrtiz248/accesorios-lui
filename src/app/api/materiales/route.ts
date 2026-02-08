import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Material from '@/models/Material';
import Producto from '@/models/Producto';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';

// GET: Obtener todos los materiales (público) con conteo opcional
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('includeCount');
    
    const materiales = await Material.find().sort({ nombre: 1 }).lean();
    
    // Si se solicita incluir conteo de productos
    if (includeCount) {
      const materialesConConteo = await Promise.all(
        materiales.map(async (mat) => {
          const count = await Producto.countDocuments({ material: mat._id });
          return { ...mat, productosCount: count };
        })
      );
      return successResponse(materialesConConteo);
    }
    
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
