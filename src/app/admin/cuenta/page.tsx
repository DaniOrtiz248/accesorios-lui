'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiLock, FiSave } from 'react-icons/fi';

export default function AdminCuentaPage() {
  const { token, usuario, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [usernameForm, setUsernameForm] = useState({
    currentPassword: '',
    newUsername: '',
  });
  const [usernameError, setUsernameError] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSaving(true);

    try {
      const res = await fetch('/api/auth/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usernameForm),
      });
      const data = await res.json();

      if (!data.success) {
        setUsernameError(data.message || 'Error al actualizar el usuario');
        return;
      }

      setSuccessMessage('Usuario actualizado. Cerrando sesión por seguridad...');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (error) {
      setUsernameError('Error al actualizar el usuario');
    } finally {
      setUsernameSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaving(true);

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();

      if (!data.success) {
        setPasswordError(data.message || 'Error al actualizar la contraseña');
        return;
      }

      setSuccessMessage('Contraseña actualizada. Cerrando sesión por seguridad...');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (error) {
      setPasswordError('Error al actualizar la contraseña');
    } finally {
      setPasswordSaving(false);
    }
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
          <div className="flex items-center space-x-3 md:space-x-4 py-4 md:h-16">
            <Link href="/admin" className="text-gray-600 hover:text-primary-600">
              <FiArrowLeft className="text-2xl" />
            </Link>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">Configuración de cuenta</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        <p className="text-gray-600 mb-8">
          Sesión actual: <span className="font-medium">{usuario?.username}</span>
        </p>

        {/* Cambiar username */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiUser className="text-xl text-primary-600" />
            <h2 className="text-lg font-bold text-gray-800">Cambiar nombre de usuario</h2>
          </div>

          {usernameError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {usernameError}
            </div>
          )}

          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario actual
              </label>
              <input
                type="text"
                value={usuario?.username || ''}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo usuario
              </label>
              <input
                type="text"
                value={usernameForm.newUsername}
                onChange={(e) =>
                  setUsernameForm({ ...usernameForm, newUsername: e.target.value })
                }
                required
                minLength={3}
                maxLength={30}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="nuevo_usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña actual
              </label>
              <input
                type="password"
                value={usernameForm.currentPassword}
                onChange={(e) =>
                  setUsernameForm({ ...usernameForm, currentPassword: e.target.value })
                }
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={usernameSaving}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              <FiSave />
              <span>{usernameSaving ? 'Guardando...' : 'Guardar usuario'}</span>
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiLock className="text-xl text-primary-600" />
            <h2 className="text-lg font-bold text-gray-800">Cambiar contraseña</h2>
          </div>

          {passwordError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña actual
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Repite la nueva contraseña"
              />
            </div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              <FiSave />
              <span>{passwordSaving ? 'Guardando...' : 'Guardar contraseña'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
