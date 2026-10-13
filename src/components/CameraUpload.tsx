import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Check, RefreshCw, Eye } from 'lucide-react';

interface CameraUploadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
}

export const CameraUpload: React.FC<CameraUploadProps> = ({
  value,
  onChange,
  label = 'Foto de Evidencia'
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showLargePreview, setShowLargePreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Quick preset templates for rapid testing without external files
  const samplePresets = [
    {
      label: 'Falta de Resguardo',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23fef2f2"/><rect x="40" y="40" width="320" height="220" rx="8" fill="%23fee2e2" stroke="%23f87171" stroke-width="2"/><circle cx="200" cy="130" r="45" fill="%23dc2626"/><path d="M 190 105 L 210 105 L 205 140 L 195 140 Z M 190 155 L 210 155 L 210 165 L 190 165 Z" fill="white"/><text x="200" y="225" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23991b1b" text-anchor="middle">PELIGRO: Resguardo Mecánico Retirado</text></svg>'
    },
    {
      label: 'Desorden / Obstrucción',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23fffbeb"/><rect x="40" y="40" width="320" height="220" rx="8" fill="%23fef3c7" stroke="%23f59e0b" stroke-width="2"/><polygon points="200,80 260,180 140,180" fill="%23d97706"/><circle cx="200" cy="165" r="4" fill="white"/><rect x="197" y="115" width="6" height="35" rx="3" fill="white"/><text x="200" y="225" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2392400e" text-anchor="middle">ATENCIÓN: Pasillo y Vía Evacuación Obstruida</text></svg>'
    },
    {
      label: 'Conforme / Ordenado',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0fdf4"/><rect x="40" y="40" width="320" height="220" rx="8" fill="%23dcfce7" stroke="%2316a34a" stroke-width="2"/><circle cx="200" cy="130" r="45" fill="%2316a34a"/><path d="M 180 130 L 195 145 L 225 115" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"/><text x="200" y="225" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23166534" text-anchor="middle">CONFORME: Área Inspeccionada Despejada</text></svg>'
    }
  ];

  // Helper to resize image using canvas before storing to keep localStorage under limit
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 700;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onChange(compressedDataUrl);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está disponible en este navegador o entorno.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('No se pudo acceder a la cámara directa. Puede subir una foto desde sus archivos o galería.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onChange(dataUrl);
    }
    stopCamera();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <label className="font-medium text-slate-700 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-slate-500" />
          {label}
        </label>
        <span className="text-[11px] text-slate-500">Móvil / Cámara / Archivo</span>
      </div>

      {/* Main Image Container */}
      {isCameraActive ? (
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-black p-2 flex flex-col items-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-60 rounded object-cover"
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={captureCameraSnapshot}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Tomar Foto Ahora
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors"
            >
              Cancelar Cámara
            </button>
          </div>
        </div>
      ) : value ? (
        <div className="relative border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center gap-4">
          <img
            src={value}
            alt="Evidencia fotográfica"
            className="w-24 h-20 object-cover rounded border border-slate-200 bg-white"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-800 truncate">
              Evidencia Registrada
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Imagen adjunta a la inspección de campo
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowLargePreview(true)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white px-2 py-1 rounded border border-slate-200"
              >
                <Eye className="w-3 h-3 text-slate-500" />
                Ampliar
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 bg-white px-2 py-1 rounded border border-slate-200"
              >
                <Trash2 className="w-3 h-3" />
                Quitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md shadow-sm transition-colors whitespace-nowrap"
            >
              <Camera className="w-3.5 h-3.5" />
              Abrir Cámara
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              Subir desde Galería
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span>Plantillas rápidas:</span>
            {samplePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.url)}
                className="hover:text-slate-800 underline transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {cameraError && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
              {cameraError}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* Large Image Modal */}
      {showLargePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900">Evidencia Fotográfica de Inspección</h4>
              <button
                type="button"
                onClick={() => setShowLargePreview(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cerrar ✕
              </button>
            </div>
            <div className="bg-slate-100 rounded flex items-center justify-center p-2">
              <img
                src={value}
                alt="Vista grande evidencia"
                className="max-h-96 w-auto object-contain rounded shadow-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowLargePreview(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
