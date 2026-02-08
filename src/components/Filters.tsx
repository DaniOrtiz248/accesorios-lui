'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface Categoria {
  _id: string;
  nombre: string;
  slug: string;
}

interface Material {
  _id: string;
  nombre: string;
}

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

export default function Filters({ onFilterChange, initialFilters = {} }: FiltersProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [material, setMaterial] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  useEffect(() => {
    fetchCategorias();
    fetchMateriales();
  }, []);

  // Aplicar filtros iniciales cuando cambian
  useEffect(() => {
    if (initialFilters.categoria) {
      setCategoria(initialFilters.categoria);
    }
  }, [initialFilters]);

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      if (data.success) {
        setCategorias(data.data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchMateriales = async () => {
    try {
      const res = await fetch('/api/materiales');
      const data = await res.json();
      if (data.success) {
        setMateriales(data.data);
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error);
    }
  };

  // Aplicar filtros automáticamente cuando cambien (con debounce para búsqueda)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: any = {};
      if (busqueda) filters.busqueda = busqueda;
      if (categoria) filters.categoria = categoria;
      if (material) filters.material = material;
      if (precioMin) filters.precioMin = precioMin;
      if (precioMax) filters.precioMax = precioMax;
      onFilterChange(filters);
    }, busqueda ? 500 : 0); // 500ms debounce solo para búsqueda de texto

    return () => clearTimeout(timeoutId);
  }, [busqueda, categoria, material, precioMin, precioMax]);

  const handleClearFilters = () => {
    setBusqueda('');
    setCategoria('');
    setMaterial('');
    setPrecioMin('');
    setPrecioMax('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            {materiales.map((mat) => (
              <option key={mat._id} value={mat.nombre}>
                {mat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Precio (COP)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              placeholder="Mín"
              className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              placeholder="Máx"
              className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Botón Limpiar */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleClearFilters}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2"
        >
          <FiX />
          <span>Limpiar Filtros</span>
        </button>
      </div>
    </div>
  );
}
