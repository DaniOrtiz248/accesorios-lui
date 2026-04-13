import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subcategoria from '@/models/Subcategoria';
import Categoria from '@/models/Categoria';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';
import { isValidObjectId, sanitizeObject } from '@/lib/security';

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

    if (!includeInactive) {
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

// POST: Crear subcategoría (requiere auth)
export async function POST(request: NextRequest) {
  try {
    verifyAuth(request);
    await connectDB();
    Categoria;

    const body = sanitizeObject(await request.json());

    if (!body.categoria || !isValidObjectId(body.categoria)) {
      return errorResponse('ID de categoría inválido', 400);
    }

    const subcategoria = await Subcategoria.create(body);
    await subcategoria.populate('categoria', 'nombre');

    return successResponse(subcategoria, 'Subcategoría creada exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al crear subcategoría:', error);
    return handleMongoError(error);
  }
}
