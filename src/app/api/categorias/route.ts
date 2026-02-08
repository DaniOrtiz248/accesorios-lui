import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Categoria from '@/models/Categoria';
import Producto from '@/models/Producto';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';

// GET: Obtener todas las categorías activas (público) o todas con conteo (admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive');
    const includeCount = searchParams.get('includeCount');
    
    // Si se solicitan todas las categorías (admin)
    const query = includeInactive ? {} : { activo: true };
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
