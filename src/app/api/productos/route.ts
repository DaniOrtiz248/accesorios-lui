import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Producto from '@/models/Producto';
import Categoria from '@/models/Categoria';
import Material from '@/models/Material';
import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleMongoError } from '@/lib/api-utils';
import mongoose from 'mongoose';

// GET: Obtener productos con filtros (público)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Iniciando GET /api/productos');
    await connectDB();
    console.log('✅ [API] Conexión a DB establecida');
    
    const { searchParams } = new URL(request.url);
    
    // Construir filtros
    const filtros: any = {};
    
    // Solo filtrar por activo si no se solicita incluir inactivos (para admin)
    const includeInactive = searchParams.get('includeInactive');
    if (!includeInactive) {
      filtros.activo = true;
    }
    console.log('📊 [API] Filtros aplicados:', JSON.stringify(filtros));
    
    const categoria = searchParams.get('categoria');
    const material = searchParams.get('material');
    const busqueda = searchParams.get('busqueda');
    const precioMin = searchParams.get('precioMin');
    const precioMax = searchParams.get('precioMax');
    
    if (categoria) filtros.categoria = categoria;
    if (material) {
      console.log('🎨 [API] Filtrando por material:', material);
      // Buscar material tanto como ObjectId como String (para migración)
      try {
        const materialObjectId = new mongoose.Types.ObjectId(material);
        filtros.$or = [
          { material: materialObjectId },
          { material: material }
        ];
        console.log('✅ [API] Filtro OR creado para ObjectId y String');
      } catch (e) {
        // Si no es un ObjectId válido, buscar como string
        filtros.material = { $regex: material, $options: 'i' };
        console.log('⚠️ [API] No es ObjectId válido, usando regex');
      }
    }
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
    
    console.log('🔎 [API] Ejecutando query con paginación:', { page, limit, skip, sort });
    console.log('🔍 [API] Filtros finales:', JSON.stringify(filtros, null, 2));
    
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
    
    console.log(`✅ [API] Query ejecutada: ${productos.length} productos encontrados de ${total} total`);
    if (material && productos.length > 0) {
      console.log('📦 [API] Materiales de productos encontrados:', productos.map(p => ({
        nombre: p.nombre,
        material: p.material,
        materialType: typeof p.material,
        materialId: p.material?._id || p.material
      })));
    }
    
    const response = {
      productos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    
    console.log('📤 [API] Enviando respuesta exitosa');
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
