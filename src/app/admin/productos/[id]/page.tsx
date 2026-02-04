'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiUpload, FiX, FiSave, FiCamera, FiImage } from 'react-icons/fi';

interface Categoria {
  _id: string;
  nombre: string;
}

export default function ProductoFormPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== 'nuevo';

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    material: '',
    categoria: '',
    imagenes: [] as string[],
    activo: true,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    } else if (!isLoading && isAuthenticated) {
      fetchCategorias();
      if (isEditing) {
        fetchProducto();
      }
    }
  }, [isAuthenticated, isLoading, isEditing]);

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      if (data.success) {
        setCategorias(data.data);
        if (data.data.length > 0 && !formData.categoria) {
          setFormData((prev) => ({ ...prev, categoria: data.data[0]._id }));
        }
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchProducto = async () => {
    try {
      const res = await fetch(`/api/productos/${params.id}`);
      const data = await res.json();
      if (data.success) {
        const producto = data.data;
        setFormData({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio.toString(),
          material: producto.material,
          categoria: producto.categoria._id || producto.categoria,
          imagenes: producto.imagenes || [],
          activo: producto.activo,
        });
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📸 Archivo seleccionado:', file.name, file.type, file.size);

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no debe superar 10MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    setUploadingImage(true);
    console.log('⏳ Iniciando upload...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Enviando a /api/upload...');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Respuesta recibida, status:', res.status);

      const data = await res.json();
      console.log('📦 Data:', data);

      if (data.success) {
        const imageUrl = data.data?.url || data.url;
        console.log('✅ Imagen subida exitosamente:', imageUrl);
        setFormData((prev) => ({
          ...prev,
          imagenes: [...prev.imagenes, imageUrl],
        }));
        alert('Imagen subida correctamente');
      } else {
        console.error('❌ Error del servidor:', data.message);
        alert(data.message || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      alert('Error al subir imagen: ' + error);
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = {
      ...formData,
      precio: parseFloat(formData.precio),
    };

    console.log('📝 FormData antes de enviar:', formData);
    console.log('🖼️ Imágenes en formData:', formData.imagenes);
    console.log('📤 Data a enviar:', dataToSend);

    try {
      const url = isEditing ? `/api/productos/${params.id}` : '/api/productos';
      const method = isEditing ? 'PUT' : 'POST';

      console.log('🚀 Enviando', method, 'a', url);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('📡 Respuesta recibida, status:', res.status);

      const data = await res.json();

      if (data.success) {
        router.push('/admin/productos');
      } else {
        alert(data.message || 'Error al guardar producto');
      }
    } catch (error) {
      alert('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-3 md:space-x-4 py-4 md:h-16">
            <Link href="/admin/productos" className="text-gray-600 hover:text-primary-600">
              <FiArrowLeft className="text-2xl" />
            </Link>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes (máximo 5)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
                {formData.imagenes.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={img}
                      alt={`Imagen ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
              {formData.imagenes.length < 5 && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Botón Cámara */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition flex flex-col items-center justify-center min-h-[120px]">
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                          <span className="text-xs text-gray-600">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <FiCamera className="text-3xl text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Cámara</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {formData.imagenes.length}/5
                          </span>
                        </>
                      )}
                    </div>
                  </label>

                  {/* Botón Galería */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition flex flex-col items-center justify-center min-h-[120px]">
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                          <span className="text-xs text-gray-600">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <FiImage className="text-3xl text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Galería</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {formData.imagenes.length}/5
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                maxLength={100}
                className="input-field"
                placeholder="Ej: Anillo de plata con piedra"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
                maxLength={500}
                rows={4}
                className="input-field"
                placeholder="Describe el producto..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.descripcion.length}/500 caracteres
              </p>
            </div>

            {/* Precio y Material */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (COP) *
                </label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  required
                  min="0"
                  step="1"
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material *
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Ej: Plata 925"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
                className="input-field"
              >
                {categorias.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Activo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                Producto activo (visible en el catálogo)
              </label>
            </div>

            {/* Botones */}
            <div className="flex space-x-4 pt-4">
              <Link
                href="/admin/productos"
                className="flex-1 btn-secondary text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <FiSave />
                <span>{loading ? 'Guardando...' : 'Guardar Producto'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
