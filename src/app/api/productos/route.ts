import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Producto from '@/models/Producto';
import Categoria from '@/models/Categoria';
import Material from '@/models/Material';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';
import { sanitizeString, sanitizeNumber, isValidObjectId, limitArrayLength } from '@/lib/security';
import mongoose from 'mongoose';

// GET: Obtener productos con filtros (público)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Force model registration for serverless cold starts
    Categoria; Material;
    
    const { searchParams } = new URL(request.url);
    
    // Construir filtros con sanitización
    const filtros: any = {};
    
    // Solo filtrar por activo si no se solicita incluir inactivos (para admin)
    const includeInactive = searchParams.get('includeInactive');
    if (!includeInactive) {
      filtros.activo = true;
    }
    
    const categoria = searchParams.get('categoria');
    const material = searchParams.get('material');
    const busqueda = searchParams.get('busqueda');
    const precioMin = searchParams.get('precioMin');
    const precioMax = searchParams.get('precioMax');
    
    // Sanitizar y validar inputs
    if (categoria && isValidObjectId(categoria)) {
      filtros.categoria = categoria;
    }
    
    if (material && isValidObjectId(material)) {
      filtros.material = material;
    }
    
    if (busqueda) {
      const busquedaSanitizada = sanitizeString(busqueda);
      if (busquedaSanitizada) {
        filtros.$text = { $search: busquedaSanitizada };
      }
    }
    
    if (precioMin || precioMax) {
      filtros.precio = {};
      const minSanitizado = sanitizeNumber(precioMin);
      const maxSanitizado = sanitizeNumber(precioMax);
      if (minSanitizado !== undefined) filtros.precio.$gte = minSanitizado;
      if (maxSanitizado !== undefined) filtros.precio.$lte = maxSanitizado;
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
        .populate('material', 'nombre')
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
    console.error('❌ [API] ERROR al obtener productos:', error);
    console.error('❌ [API] Stack trace:', error.stack);
    return errorResponse('Error al obtener productos: ' + error.message, 500);
  }
}

// POST: Crear nuevo producto (requiere auth)
export async function POST(request: NextRequest) {
  try {
    verifyAuth(request);
    await connectDB();
    // Force model registration for serverless cold starts
    Categoria; Material;
    
    const body = await request.json();
    console.log('📦 Body recibido en POST:', JSON.stringify(body, null, 2));
    console.log('🖼️ Imágenes originales:', body.imagenes);
    
    // Limpiar array de imágenes: eliminar valores null, undefined o strings vacíos
    if (body.imagenes && Array.isArray(body.imagenes)) {
      const imagenesAntes = [...body.imagenes];
      body.imagenes = body.imagenes.filter((img: any) => img && typeof img === 'string' && img.trim() !== '');
      console.log('🧹 Imágenes antes del filtro:', imagenesAntes);
      console.log('✅ Imágenes después del filtro:', body.imagenes);
    } else {
      console.log('⚠️ No hay array de imágenes o no es un array');
    }
    
    console.log('💾 Creando producto con data:', JSON.stringify(body, null, 2));
    const producto = await Producto.create(body);
    console.log('✅ Producto creado exitosamente:', producto._id);
    console.log('🖼️ Imágenes guardadas en DB:', producto.imagenes);
    
    return successResponse(producto, 'Producto creado exitosamente');
  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error al crear producto:', error);
    return handleMongoError(error);
  }
}
