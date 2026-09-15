import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Producto from '@/models/Producto';
import Categoria from '@/models/Categoria';
import Subcategoria from '@/models/Subcategoria';
import { verifyAdmin } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError, handleAuthError } from '@/lib/api-utils';
import { sanitizeString, sanitizeNumber, isValidObjectId, limitArrayLength, pickAllowedFields, sanitizeObject } from '@/lib/security';

const MAX_IMAGENES = 10;

// Campos permitidos que un admin puede establecer al crear un producto
const ALLOWED_PRODUCTO_FIELDS = [
  'nombre',
  'descripcion',
  'precio',
  'categoria',
  'subcategorias',
  'imagenes',
  'imagenesPublicIds',
  'activo',
] as const;

// GET: Obtener productos con filtros (público)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Force model registration for serverless cold starts
    Categoria; Subcategoria;
    
    const { searchParams } = new URL(request.url);
    
    // Construir filtros con sanitización
    const filtros: any = {};
    
    // Solo admins pueden ver productos inactivos
    const includeInactive = searchParams.get('includeInactive');
    if (includeInactive) {
      try {
        verifyAdmin(request);
      } catch {
        filtros.activo = true;
      }
    } else {
      filtros.activo = true;
    }
    
    const categoria = searchParams.get('categoria');
    const subcategoriaIds = searchParams.getAll('subcategoria');
    const busqueda = searchParams.get('busqueda');
    const precioMin = searchParams.get('precioMin');
    const precioMax = searchParams.get('precioMax');
    
    // Sanitizar y validar inputs
    if (categoria && isValidObjectId(categoria)) {
      filtros.categoria = categoria;
    }
    
    const validSubs = subcategoriaIds.filter(id => isValidObjectId(id));
    if (validSubs.length === 1) {
      filtros.subcategorias = validSubs[0];
    } else if (validSubs.length > 1) {
      filtros.subcategorias = { $in: validSubs };
    }
    
    if (busqueda) {
      const busquedaSanitizada = sanitizeString(busqueda);
      if (busquedaSanitizada) {
        filtros.$text = { $search: busquedaSanitizada };
      }
    }
    
    if (precioMin) {
      const minSanitizado = sanitizeNumber(precioMin);
      if (minSanitizado !== undefined) {
        filtros.precio = filtros.precio || {};
        filtros.precio.$gte = minSanitizado;
      }
    }
    if (precioMax) {
      const maxSanitizado = sanitizeNumber(precioMax);
      if (maxSanitizado !== undefined) {
        filtros.precio = filtros.precio || {};
        filtros.precio.$lte = maxSanitizado;
      }
    }
    
    // Paginación con límites de seguridad
    const page = Math.max(1, Math.min(1000, parseInt(searchParams.get('page') || '1')));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;
    
    // Ordenamiento seguro
    const sortParam = searchParams.get('sort') || '-createdAt';
    const allowedSorts = ['createdAt', '-createdAt', 'precio', '-precio', 'nombre', '-nombre'];
    const sort = allowedSorts.includes(sortParam) ? sortParam : '-createdAt';
    
    const [productos, total] = await Promise.all([
      Producto.find(filtros)
        .populate('categoria', 'nombre slug')
        .populate('subcategorias', 'nombre')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Producto.countDocuments(filtros),
    ]);
    
    const response = {
      productos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    return successResponse(response);
  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    return errorResponse('Error al obtener productos', 500);
  }
}

// POST: Crear nuevo producto (requiere auth de admin)
export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);
    await connectDB();
    // Force model registration for serverless cold starts
    Categoria; Subcategoria;
    
    const rawBody = await request.json();

    // Whitelist: sólo se aceptan campos previstos (previene mass assignment)
    let body = pickAllowedFields<any>(rawBody, ALLOWED_PRODUCTO_FIELDS as unknown as string[]);
    body = sanitizeObject(body);
    
    // Limpiar array de imágenes: eliminar valores null, undefined o strings vacíos
    if (body.imagenes && Array.isArray(body.imagenes)) {
      body.imagenes = limitArrayLength(
        body.imagenes.filter((img: any) => img && typeof img === 'string' && img.trim() !== ''),
        MAX_IMAGENES
      );
    }

    // Limpiar array de public_ids de Cloudinary (alineado con imagenes)
    if (body.imagenesPublicIds && Array.isArray(body.imagenesPublicIds)) {
      body.imagenesPublicIds = limitArrayLength(
        body.imagenesPublicIds.filter((id: any) => id && typeof id === 'string'),
        MAX_IMAGENES
      );
    }

    // Limpiar array de subcategorias
    if (body.subcategorias && Array.isArray(body.subcategorias)) {
      body.subcategorias = limitArrayLength(
        body.subcategorias.filter((id: any) => typeof id === 'string' && isValidObjectId(id)),
        20
      );
    }
    
    const producto = await Producto.create(body);
    
    return successResponse(producto, 'Producto creado exitosamente');
  } catch (error: any) {
    const authErrorResponse = handleAuthError(error);
    if (authErrorResponse) return authErrorResponse;
    console.error('Error al crear producto:', error);
    return handleMongoError(error);
  }
}


