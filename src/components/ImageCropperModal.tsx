'use client';

import { useCallback, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { FiCheck, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { getCroppedImageBlob } from '@/lib/cropImage';

interface ImageCropperModalProps {
  imageSrc: string;
  aspect?: number;
  title?: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
}

/**
 * Editor de recorte/encuadre reutilizable para imágenes de productos.
 * Funciona tanto para imágenes nuevas (antes de subirlas) como para
 * reencuadrar imágenes ya existentes (a partir de su URL de Cloudinary).
 * No sube ni elimina nada de Cloudinary por sí mismo: sólo produce un
 * Blob recortado que el llamador decide cómo persistir.
 */
export default function ImageCropperModal({
  imageSrc,
  aspect = 1,
  title = 'Ajustar imagen',
  onCancel,
  onConfirm,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels || processing) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      await onConfirm(blob);
    } catch (error) {
      console.error('Error al recortar la imagen:', error);
      alert('Error al procesar la imagen. Intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={processing}
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="relative w-full h-72 sm:h-96 bg-gray-900 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            mediaProps={{ crossOrigin: 'anonymous' }}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="flex items-center space-x-3 mt-4">
          <FiZoomOut className="text-gray-500 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
            aria-label="Zoom"
          />
          <FiZoomIn className="text-gray-500 shrink-0" />
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn-secondary"
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing || !croppedAreaPixels}
            className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiCheck />
            <span>{processing ? 'Procesando...' : 'Confirmar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
