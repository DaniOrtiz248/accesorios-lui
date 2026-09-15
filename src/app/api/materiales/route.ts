import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Material from '@/models/Material';
import Producto from '@/models/Producto';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';
import { sanitizeObject, pickAllowedFields } from '@/lib/security';

const ALLOWED_MATERIAL_FIELDS = ['nombre', 'descripcion'] as const;

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

// POST: Crear nuevo material (requiere rol admin)
export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);
    await connectDB();
    
    const rawBody = await request.json();
    const body = sanitizeObject(pickAllowedFields<any>(rawBody, ALLOWED_MATERIAL_FIELDS as unknown as string[]));
    const material = await Material.create(body);
    
    return successResponse(material, 'Material creado exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al crear material:', error);
    return handleMongoError(error);
  }
}
