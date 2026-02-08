'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiBox } from 'react-icons/fi';

interface Material {
  _id: string;
  nombre: string;
  descripcion?: string;
  productosCount?: number;
}

export default function AdminMaterialesPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    } else if (!isLoading && isAuthenticated) {
      fetchMateriales();
    }
  }, [isAuthenticated, isLoading]);

  const fetchMateriales = async () => {
    try {
      const res = await fetch('/api/materiales?includeCount=true');
      const data = await res.json();
      if (data.success) {
        setMateriales(data.data);
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/materiales/${editingId}` : '/api/materiales';
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
        fetchMateriales();
      } else {
        alert(data.message || 'Error al guardar material');
      }
    } catch (error) {
      alert('Error al guardar material');
    }
  };

  const handleEdit = (material: Material) => {
    setEditingId(material._id);
    setFormData({
      nombre: material.nombre,
      descripcion: material.descripcion || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este material?')) return;

    try {
      const res = await fetch(`/api/materiales/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        fetchMateriales();
      } else {
        alert(data.message || 'Error al eliminar material');
      }
    } catch (error) {
      alert('Error al eliminar material');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
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
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-primary-600">
                <FiArrowLeft className="text-2xl" />
              </Link>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Gestión de Materiales</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm md:text-base"
            >
              <FiPlus />
              <span>Nuevo Material</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Formulario Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Editar Material' : 'Nuevo Material'}
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Algodón"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Descripción opcional del material"
                  />
                </div>
                <div className="flex gap-3 pt-4">
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
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Materiales */}
        {loading ? (
          <div className="text-center py-20">Cargando...</div>
        ) : materiales.length === 0 ? (
          <div className="text-center py-20">
            <FiBox className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">No hay materiales registrados</p>
            <p className="text-gray-500">Crea tu primer material usando el bot��n de arriba</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materiales.map((material) => (
              <div
                key={material._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {material.nombre}
                    </h3>
                    {material.descripcion && (
                      <p className="text-sm text-gray-600">{material.descripcion}</p>
                    )}
                  </div>
                  <FiBox className="text-2xl text-primary-600" />
                </div>
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Productos:</span>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-accent-light text-primary-900">
                      {material.productosCount || 0}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(material)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    <FiEdit />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(material._id)}
                    className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    title="Eliminar"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
