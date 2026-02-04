'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiUpload, FiX, FiSave } from 'react-icons/fi';
import { CldUploadWidget } from 'next-cloudinary';

interface Categoria {
  _id: string;
  nombre: string;
}

export default function ProductoFormPage() {
  const { token, isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else {
      fetchCategorias();
      if (isEditing) {
        fetchProducto();
      }
    }
  }, [isAuthenticated, isEditing]);

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

  const handleImageUpload = (result: any) => {
    if (result.event === 'success') {
      const imageUrl = result.info.secure_url;
      setFormData((prev) => ({
        ...prev,
        imagenes: [...prev.imagenes, imageUrl],
      }));
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

    try {
      const url = isEditing ? `/api/productos/${params.id}` : '/api/productos';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
        }),
      });

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
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'accesorios-lui'}
                  onSuccess={handleImageUpload}
                  options={{
                    maxFiles: 1,
                    folder: 'productos',
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open?.()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition flex flex-col items-center justify-center"
                    >
                      <FiUpload className="text-3xl text-gray-400 mb-2" />
                      <span className="text-gray-600">Subir imagen</span>
                      <span className="text-sm text-gray-400 mt-1">
                        {formData.imagenes.length}/5 imágenes
                      </span>
                    </button>
                  )}
                </CldUploadWidget>
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
