import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Categoria from '@/models/Categoria';
import Producto from '@/models/Producto';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';
import { sanitizeObject, pickAllowedFields } from '@/lib/security';

const ALLOWED_CATEGORIA_FIELDS = ['nombre', 'descripcion', 'imagen', 'activo'] as const;

// GET: Obtener todas las categorías activas (público) o todas con conteo (solo admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive');
    const includeCount = searchParams.get('includeCount');
    
    // Ver categorías inactivas requiere ser administrador autenticado
    let query: any = { activo: true };
    if (includeInactive) {
      try {
        verifyAdmin(request);
        query = {};
      } catch (error: any) {
        const authErrorResponse = handleAuthError(error);
        if (authErrorResponse) return authErrorResponse;
        throw error;
      }
    }
    
    const categorias = await Categoria.find(query).sort({ nombre: 1 }).lean();
    
    // Si se solicita incluir conteo de productos
    if (includeCount) {
      const categoriasConConteo = await Promise.all(
        categorias.map(async (cat) => {
          const count = await Producto.countDocuments({ categoria: cat._id });
          return { ...cat, productosCount: count };
        })
      );
      return successResponse(categoriasConConteo);
    }
    
    return successResponse(categorias);
  } catch (error: any) {
    console.error('Error al obtener categorías:', error);
    return errorResponse('Error al obtener categorías', 500);
  }
}

// POST: Crear nueva categoría (requiere rol admin)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol admin
    verifyAdmin(request);
    
    await connectDB();
    
    const rawBody = await request.json();
    const body = sanitizeObject(pickAllowedFields<any>(rawBody, ALLOWED_CATEGORIA_FIELDS as unknown as string[]));
    const categoria = await Categoria.create(body);
    
    return successResponse(categoria, 'Categoría creada exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al crear categoría:', error);
    return handleMongoError(error);
  }
}
