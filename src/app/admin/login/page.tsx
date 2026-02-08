'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FiMail, FiLock, FiShoppingBag } from 'react-icons/fi';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 via-accent to-primary-700 px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border border-primary-100">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-accent-light rounded-full mb-4">
            <FiShoppingBag className="text-4xl text-primary-800" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 tracking-wide">Luisa Ramirez</h1>
          <p className="text-lg text-primary-600 font-light italic">Accesorios</p>
          <p className="text-primary-700 mt-3 font-medium text-sm">Panel de Administración</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-800 mb-2">
              Usuario
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-primary-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="usuario"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-800 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-primary-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-lg font-bold hover:bg-accent-dark transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-primary-600">
          <p>Solo administradores autorizados</p>
        </div>
      </div>
    </div>
  );
}
