'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiLayers, FiEye, FiEyeOff } from 'react-icons/fi';

interface Categoria {
  _id: string;
  nombre: string;
}

interface Subcategoria {
  _id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  categoria: { _id: string; nombre: string };
}

export default function AdminSubcategoriasPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    activo: true,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    } else if (!isLoading && isAuthenticated) {
      fetchCategorias();
      fetchSubcategorias();
    }
  }, [isAuthenticated, isLoading]);

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias?includeInactive=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCategorias(data.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const params = new URLSearchParams({ includeInactive: 'true' });
      if (filtroCategoria) params.set('categoria', filtroCategoria);

      const res = await fetch(`/api/subcategorias?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSubcategorias(data.data);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchSubcategorias();
  }, [filtroCategoria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoria) {
      alert('Debes seleccionar una categoría');
      return;
    }

    try {
      const url = editingId ? `/api/subcategorias/${editingId}` : '/api/subcategorias';
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
        setFormData({ nombre: '', descripcion: '', categoria: '', activo: true });
        fetchSubcategorias();
      } else {
        alert(data.message || 'Error al guardar subcategoría');
      }
    } catch (error) {
      alert('Error al guardar subcategoría');
    }
  };

  const handleEdit = (sub: Subcategoria) => {
    setEditingId(sub._id);
    setFormData({
      nombre: sub.nombre,
      descripcion: sub.descripcion || '',
      categoria: sub.categoria._id,
      activo: sub.activo,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar esta subcategoría?')) return;

    try {
      const res = await fetch(`/api/subcategorias/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchSubcategorias();
      } else {
        alert(data.message || 'Error al eliminar subcategoría');
      }
    } catch (error) {
      alert('Error al eliminar subcategoría');
    }
  };

  const handleToggleActivo = async (sub: Subcategoria) => {
    try {
      const res = await fetch(`/api/subcategorias/${sub._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !sub.activo }),
      });
      const data = await res.json();
      if (data.success) fetchSubcategorias();
    } catch (error) {
      alert('Error al actualizar subcategoría');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', categoria: '', activo: true });
  };

  // Agrupar subcategorías por categoría para mostrar
  const subcategoriasPorCategoria = subcategorias.reduce((acc, sub) => {
    const catNombre = sub.categoria?.nombre || 'Sin categoría';
    if (!acc[catNombre]) acc[catNombre] = [];
    acc[catNombre].push(sub);
    return acc;
  }, {} as Record<string, Subcategoria[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4 md:h-16 gap-3">
            <div className="flex items-center space-x-3">
              <Link href="/admin" className="text-gray-600 hover:text-primary-600">
                <FiArrowLeft className="text-2xl" />
              </Link>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Gestión de Subcategorías</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm md:text-base"
            >
              <FiPlus />
              <span>Nueva Subcategoría</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">

        {/* Filtro por categoría */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por categoría</label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full md:w-72 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {/* Modal Formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    maxLength={50}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Tejida, Mujer, Fino..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={2}
                    maxLength={200}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Descripción opcional"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo-sub"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="activo-sub" className="ml-2 text-sm text-gray-700">
                    Activa (visible en el catálogo)
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista agrupada por categoría */}
        {loading ? (
          <div className="text-center py-20">Cargando...</div>
        ) : subcategorias.length === 0 ? (
          <div className="text-center py-20">
            <FiLayers className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No hay subcategorías creadas</p>
            <p className="text-gray-400 mt-2">Crea la primera subcategoría con el botón de arriba</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(subcategoriasPorCategoria).map(([catNombre, subs]) => (
              <div key={catNombre} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-primary-900 text-white px-6 py-3">
                  <h2 className="text-lg font-bold">{catNombre}</h2>
                  <p className="text-xs text-primary-200">{subs.length} subcategoría{subs.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {subs.map((sub) => (
                    <div key={sub._id} className="flex items-center justify-between px-6 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${sub.activo ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                            {sub.nombre}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${sub.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {sub.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        {sub.descripcion && (
                          <p className="text-sm text-gray-500 mt-0.5">{sub.descripcion}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleToggleActivo(sub)}
                          className={`p-2 rounded-lg transition ${sub.activo ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                          title={sub.activo ? 'Desactivar' : 'Activar'}
                        >
                          {sub.activo ? <FiEye /> : <FiEyeOff />}
                        </button>
                        <button
                          onClick={() => handleEdit(sub)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
