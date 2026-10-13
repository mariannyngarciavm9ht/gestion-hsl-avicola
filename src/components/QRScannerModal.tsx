import React, { useRef, useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  AlertTriangle, 
  QrCode, 
  Flame, 
  RefreshCw 
} from 'lucide-react';
import { InspeccionExtintores } from '../types/ehs';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  extintores: InspeccionExtintores[];
  onSelectExtintor: (extintor: InspeccionExtintores) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  extintores,
  onSelectExtintor
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const startCamera = async () => {
    setErrorMsg(null);
    setDetectedCode(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está soportada o permitida en este navegador.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      setScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setErrorMsg('No se pudo acceder a la cámara. Puede seleccionar una imagen con el código QR.');
      setScanning(false);
    }
  };

  const processQRCodeText = (text: string) => {
    setDetectedCode(text);

    // Try to find matching extinguisher
    // 1. Direct match with Codigo_Extintor
    let matched = extintores.find(
      (e) => e.Codigo_Extintor.toLowerCase() === text.trim().toLowerCase()
    );

    // 2. Query param search (e.g. ?extintor=EXT-TALL-01)
    if (!matched && text.includes('extintor=')) {
      try {
        const url = new URL(text);
        const codeParam = url.searchParams.get('extintor');
        if (codeParam) {
          matched = extintores.find(
            (e) => e.Codigo_Extintor.toLowerCase() === codeParam.toLowerCase()
          );
        }
      } catch {
        const matchRegex = text.match(/extintor=([^&]+)/i);
        if (matchRegex && matchRegex[1]) {
          const codeParam = decodeURIComponent(matchRegex[1]);
          matched = extintores.find(
            (e) => e.Codigo_Extintor.toLowerCase() === codeParam.toLowerCase()
          );
        }
      }
    }

    // 3. Fallback search inside text
    if (!matched) {
      matched = extintores.find(
        (e) => text.toLowerCase().includes(e.Codigo_Extintor.toLowerCase())
      );
    }

    if (matched) {
      stopCamera();
      onSelectExtintor(matched);
      onClose();
    } else {
      setErrorMsg(`Código escaneado: "${text}", pero no coincide con ningún extintor registrado.`);
    }
  };

  const tick = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          processQRCodeText(code.data);
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            processQRCodeText(code.data);
          } else {
            setErrorMsg('No se detectó ningún código QR válido en la imagen seleccionada.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-linear-to-r from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-yellow-300" />
            <h3 className="text-base font-bold">Escanear Código QR de Extintor</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 text-center">
            Apunte con la cámara al código QR ubicado en el extintor físico para abrir de inmediato su ficha técnica en vivo.
          </p>

          {/* Scanner Viewport */}
          <div className="relative border-2 border-red-500 rounded-xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-8 border-2 border-red-500/80 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
            </div>

            {!scanning && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-4 text-center">
                <Camera className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-xs text-slate-300">Cámara detenida o no disponible</span>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-3 px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Reintentar Cámara
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Alternative: Subir foto de QR */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Subir Foto del QR</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
