'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiTag, FiImage } from 'react-icons/fi';

interface Categoria {
  _id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  slug: string;
  activo: boolean;
  productosCount?: number;
}

export default function AdminCategoriasPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    } else if (!isLoading && isAuthenticated) {
      fetchCategorias();
    }
  }, [isAuthenticated, isLoading]);

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias?includeInactive=true&includeCount=true');
      const data = await res.json();
      if (data.success) {
        setCategorias(data.data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imagen: data.data.url }));
      } else {
        alert(data.message || 'Error al subir imagen');
      }
    } catch {
      alert('Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/categorias/${editingId}` : '/api/categorias';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ nombre: '', descripcion: '' });
        fetchCategorias();
      } else {
        alert(data.message || 'Error al guardar categoría');
      }
    } catch (error) {
      alert('Error al guardar categoría');
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria._id);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      imagen: categoria.imagen || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar esta categoría?')) return;

    try {
      const res = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        fetchCategorias();
      } else {
        alert(data.message || 'Error al eliminar categoría');
      }
    } catch (error) {
      alert('Error al eliminar categoría');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', imagen: '' });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4 md:h-16 gap-3">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-primary-600">
                <FiArrowLeft className="text-2xl" />
              </Link>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Gestión de Categorías</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm md:text-base whitespace-nowrap"
            >
              <FiPlus />
              <span className="hidden sm:inline">Nueva Categoría</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Formulario Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      maxLength={50}
                      className="input-field"
                      placeholder="Ej: Joyería"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) =>
                        setFormData({ ...formData, descripcion: e.target.value })
                      }
                      maxLength={200}
                      rows={3}
                      className="input-field"
                      placeholder="Descripción opcional..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen de categoría
                    </label>
                    {formData.imagen && (
                      <div className="relative h-32 w-full rounded-lg overflow-hidden mb-2 bg-gray-100">
                        <Image src={formData.imagen} alt="Vista previa" fill className="object-cover" />
                      </div>
                    )}
                    <label
                      className={`cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-primary-400 transition ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <FiImage className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {uploadingImage ? 'Subiendo...' : formData.imagen ? 'Cambiar imagen' : 'Subir imagen'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 btn-primary">
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de Categorías */}
          {loading ? (
            <div className="text-center py-20">Cargando...</div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-20">
              <FiTag className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-4">No hay categorías</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <FiPlus />
                <span>Crear primera categoría</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorias.map((categoria) => (
                <div
                  key={categoria._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  {categoria.imagen && (
                    <div className="relative h-24 w-full rounded-lg overflow-hidden mb-4">
                      <Image src={categoria.imagen} alt={categoria.nombre} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {categoria.nombre}
                      </h3>
                      {categoria.descripcion && (
                        <p className="text-gray-600 text-sm mt-2">{categoria.descripcion}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(categoria)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <FiEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleDelete(categoria._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <FiTrash2 className="text-xl" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Productos:</span>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-accent-light text-primary-900">
                        {categoria.productosCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
