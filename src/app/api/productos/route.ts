import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Producto from '@/models/Producto';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';

// GET: Obtener productos con filtros (público)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Construir filtros
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
    
    if (categoria) filtros.categoria = categoria;
    if (material) filtros.material = { $regex: material, $options: 'i' };
    if (busqueda) {
      filtros.$text = { $search: busqueda };
    }
    if (precioMin || precioMax) {
      filtros.precio = {};
      if (precioMin) filtros.precio.$gte = Number(precioMin);
      if (precioMax) filtros.precio.$lte = Number(precioMax);
    }
    
    // Paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Ordenamiento
    const sort = searchParams.get('sort') || '-createdAt';
    
    const [productos, total] = await Promise.all([
      Producto.find(filtros)
        .populate('categoria', 'nombre slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Producto.countDocuments(filtros),
    ]);
    
    return successResponse({
      productos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    return errorResponse('Error al obtener productos', 500);
  }
}

// POST: Crear nuevo producto (requiere auth)
export async function POST(request: NextRequest) {
  try {
    verifyAuth(request);
    await connectDB();
    
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
