import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subcategoria from '@/models/Subcategoria';
import Categoria from '@/models/Categoria';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';
import { isValidObjectId, sanitizeObject, pickAllowedFields } from '@/lib/security';

const ALLOWED_SUBCATEGORIA_FIELDS = ['nombre', 'descripcion', 'categoria', 'activo'] as const;

// GET: Obtener subcategorías, filtrar por categoría opcionalmente (público)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Force model registration
    Categoria;

    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoria');
    const includeInactive = searchParams.get('includeInactive');

    const query: any = {};

    // Ver subcategorías inactivas requiere ser administrador autenticado
    if (includeInactive) {
      try {
        verifyAdmin(request);
      } catch (error: any) {
        const authErrorResponse = handleAuthError(error);
        if (authErrorResponse) return authErrorResponse;
        throw error;
      }
    } else {
      query.activo = true;
    }

    if (categoriaId && isValidObjectId(categoriaId)) {
      query.categoria = categoriaId;
    }

    const subcategorias = await Subcategoria.find(query)
      .populate('categoria', 'nombre')
      .sort({ nombre: 1 })
      .lean();

    return successResponse(subcategorias);
  } catch (error: any) {
    console.error('Error al obtener subcategorías:', error);
    return errorResponse('Error al obtener subcategorías', 500);
  }
}

// POST: Crear subcategoría (requiere rol admin)
export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);
    await connectDB();
    Categoria;

    const rawBody = await request.json();
    const body = sanitizeObject(pickAllowedFields<any>(rawBody, ALLOWED_SUBCATEGORIA_FIELDS as unknown as string[]));

    if (!body.categoria || !isValidObjectId(body.categoria)) {
      return errorResponse('ID de categoría inválido', 400);
    }

    const subcategoria = await Subcategoria.create(body);
    await subcategoria.populate('categoria', 'nombre');

    return successResponse(subcategoria, 'Subcategoría creada exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al crear subcategoría:', error);
    return handleMongoError(error);
  }
}
