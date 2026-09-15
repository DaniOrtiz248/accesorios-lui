'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiUpload, FiX, FiSave, FiCamera, FiImage, FiCrop } from 'react-icons/fi';
import ImageCropperModal from '@/components/ImageCropperModal';

const MAX_IMAGENES = 10;

interface Categoria {
  _id: string;
  nombre: string;
}

interface Subcategoria {
  _id: string;
  nombre: string;
  categoria: { _id: string; nombre: string };
}

export default function ProductoFormPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== 'nuevo';

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Estado del editor de recorte/encuadre reutilizable.
  // mode 'new' = imagen recién seleccionada (aún no subida a Cloudinary).
  // mode 'edit' = reencuadre de una imagen ya existente en el producto.
  const [cropperTarget, setCropperTarget] = useState<
    | { mode: 'new'; src: string }
    | { mode: 'edit'; src: string; index: number }
    | null
  >(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    subcategorias: [] as string[],
    categoria: '',
    imagenes: [] as string[],
    imagenesPublicIds: [] as string[],
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

  // Limpiar webcam al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      if (data.success) {
        setCategorias(data.data);
        // Solo auto-seleccionar primera categoría en modo creación.
        // En edición, fetchProducto() se encarga de setear la categoría y sus subcategorías.
        if (!isEditing && data.data.length > 0) {
          const primeraCat = data.data[0]._id;
          setFormData((prev) => ({ ...prev, categoria: primeraCat }));
          fetchSubcategorias(primeraCat);
        }
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchSubcategorias = async (categoriaId: string) => {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }
    try {
      const res = await fetch(`/api/subcategorias?categoria=${categoriaId}`);
      const data = await res.json();
      if (data.success) setSubcategorias(data.data);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  };

  const fetchProducto = async () => {
    try {
      const res = await fetch(`/api/productos/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const producto = data.data;
        setFormData({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio.toString(),
          subcategorias: (producto.subcategorias || []).map((s: any) =>
            typeof s === 'object' ? s._id : s
          ),
          categoria: producto.categoria?._id || producto.categoria,
          imagenes: producto.imagenes || [],
          imagenesPublicIds: producto.imagenesPublicIds || [],
          activo: producto.activo,
        });
        if (producto.categoria?._id || producto.categoria) {
          fetchSubcategorias(producto.categoria?._id || producto.categoria);
        }
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
    }
  };

  // Detectar si es dispositivo móvil
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Abrir webcam
  const openWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowWebcam(true);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  // Cerrar webcam
  const closeWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowWebcam(false);
  };

  // Capturar foto desde webcam
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      closeWebcam();
      const objectUrl = URL.createObjectURL(blob);
      setCropperTarget({ mode: 'new', src: objectUrl });
    }, 'image/jpeg', 0.9);
  };

  // Manejar clic en botón cámara
  const handleCameraClick = () => {
    if (isMobile()) {
      // En móvil, usar el input con capture
      document.getElementById('camera-input')?.click();
    } else {
      // En PC, abrir webcam
      openWebcam();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no debe superar 10MB');
      e.target.value = '';
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      e.target.value = '';
      return;
    }

    // Abrir el editor de recorte antes de subir nada a Cloudinary.
    const objectUrl = URL.createObjectURL(file);
    setCropperTarget({ mode: 'new', src: objectUrl });
    e.target.value = '';
  };

  // Sube el Blob ya recortado (nuevo o reencuadre de uno existente) y
  // agrega/actualiza la imagen correspondiente en formData.
  const handleCropConfirm = async (blob: Blob) => {
    if (!cropperTarget) return;
    const target = cropperTarget;

    setUploadingImage(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', blob, 'imagen-producto.jpg');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadForm,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Error al subir imagen');
        return;
      }

      const imageUrl = data.data?.url || data.url;
      const publicId = data.data?.publicId || '';

      if (target.mode === 'new') {
        setFormData((prev) => ({
          ...prev,
          imagenes: [...prev.imagenes, imageUrl],
          imagenesPublicIds: [...prev.imagenesPublicIds, publicId],
        }));
      } else {
        // Reencuadre de una imagen existente: se reemplaza en el índice
        // correspondiente. La imagen anterior en Cloudinary será eliminada
        // por el backend al guardar el producto (mismo mecanismo que ya
        // limpia imágenes removidas), evitando archivos huérfanos.
        const { index } = target;
        setFormData((prev) => {
          const imagenes = [...prev.imagenes];
          const imagenesPublicIds = [...prev.imagenesPublicIds];
          imagenes[index] = imageUrl;
          imagenesPublicIds[index] = publicId;
          return { ...prev, imagenes, imagenesPublicIds };
        });
      }
    } catch (error) {
      console.error('Error al subir imagen recortada:', error);
      alert('Error al subir imagen');
    } finally {
      setUploadingImage(false);
      if (target.src.startsWith('blob:')) {
        URL.revokeObjectURL(target.src);
      }
      setCropperTarget(null);
    }
  };

  const handleCropCancel = () => {
    if (cropperTarget?.src.startsWith('blob:')) {
      URL.revokeObjectURL(cropperTarget.src);
    }
    setCropperTarget(null);
  };

  // Abrir el editor de recorte sobre una imagen ya guardada del producto.
  const handleEditExistingImage = (index: number) => {
    const src = formData.imagenes[index];
    if (!src) return;
    setCropperTarget({ mode: 'edit', src, index });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
      imagenesPublicIds: prev.imagenesPublicIds.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = {
      ...formData,
      precio: parseFloat(formData.precio),
    };

    try {
      const url = isEditing ? `/api/productos/${params.id}` : '/api/productos';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
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
                Imágenes (máximo {MAX_IMAGENES})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
                {formData.imagenes.map((img, index) => (
                  <div key={index} className="relative aspect-square group">
                    <button
                      type="button"
                      onClick={() => handleEditExistingImage(index)}
                      className="absolute inset-0 w-full h-full"
                      title="Ajustar encuadre/zoom"
                    >
                      <Image
                        src={img}
                        alt={`Imagen ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <span className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition flex items-center justify-center">
                        <FiCrop className="text-white text-xl opacity-0 group-hover:opacity-100 transition" />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                      title="Eliminar imagen"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
              {formData.imagenes.length < MAX_IMAGENES && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Botón Cámara */}
                  <input
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    disabled={uploadingImage}
                    className="cursor-pointer"
                  >
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
                            {formData.imagenes.length}/{MAX_IMAGENES}
                          </span>
                        </>
                      )}
                    </div>
                  </button>

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
                            {formData.imagenes.length}/{MAX_IMAGENES}
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

            {/* Precio y Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (COP) *
                </label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || (Number(v) >= 0 && Number(v) <= 10000000)) {
                      setFormData({ ...formData, precio: v });
                    }
                  }}
                  onKeyDown={(e) => ['e', 'E', '-', '+'].includes(e.key) && e.preventDefault()}
                  required
                  min="1"
                  max="10000000"
                  step="1"
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => {
                    const nuevaCat = e.target.value;
                    setFormData({ ...formData, categoria: nuevaCat, subcategorias: [] });
                    fetchSubcategorias(nuevaCat);
                  }}
                  required
                  className="input-field"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcategorías */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategorías
                <span className="text-gray-400 font-normal ml-2">(opcional, selecciona una o más)</span>
              </label>
              {!formData.categoria ? (
                <p className="text-sm text-gray-400 italic">Selecciona una categoría primero</p>
              ) : subcategorias.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No hay subcategorías para esta categoría. Créalas en Subcategorías.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {subcategorias.map((sub) => (
                    <label
                      key={sub._id}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                        formData.subcategorias.includes(sub._id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.subcategorias.includes(sub._id)}
                        onChange={(e) => {
                          const subs = e.target.checked
                            ? [...formData.subcategorias, sub._id]
                            : formData.subcategorias.filter((id) => id !== sub._id);
                          setFormData({ ...formData, subcategorias: subs });
                        }}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm font-medium text-gray-700">{sub.nombre}</span>
                    </label>
                  ))}
                </div>
              )}
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

      {/* Modal Webcam */}
      {showWebcam && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Capturar Foto</h3>
              <button
                onClick={closeWebcam}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-2xl" />
              </button>
            </div>
            
            <div className="relative bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-[60vh] object-contain"
              />
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex space-x-3">
              <button
                onClick={closeWebcam}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={capturePhoto}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <FiCamera />
                <span>Tomar Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor de recorte/encuadre (imágenes nuevas o reencuadre de existentes) */}
      {cropperTarget && (
        <ImageCropperModal
          imageSrc={cropperTarget.src}
          aspect={1}
          title={cropperTarget.mode === 'edit' ? 'Ajustar encuadre de la imagen' : 'Ajustar imagen'}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
