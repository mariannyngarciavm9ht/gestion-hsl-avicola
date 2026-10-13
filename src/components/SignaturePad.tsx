import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';

interface SignaturePadProps {
  initialValue?: string;
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  initialValue,
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(initialValue || '');

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI adjustment
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 480) * dpr;
    canvas.height = (rect.height || 180) * dpr;
    ctx.scale(dpr, dpr);

    // Default line style
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If initialValue exists, load it
    if (initialValue && initialValue.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width || 480, rect.height || 180);
        setHasDrawn(true);
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setPreviewUrl('');
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasDrawn && !previewUrl) {
      alert('Por favor dibuje su firma táctil antes de confirmar.');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    setPreviewUrl(dataUrl);
    onSave(dataUrl);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <PenTool className="w-3.5 h-3.5 text-slate-700" />
          Firma táctil digital del colaborador
        </span>
        <span>Dibuje con el dedo o lápiz en la pantalla</span>
      </div>

      <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="w-full h-44 cursor-crosshair signature-canvas select-none"
        />

        {/* Guideline line */}
        <div className="pointer-events-none absolute bottom-8 left-8 right-8 border-b border-slate-200 flex items-end justify-between pb-1 text-[11px] text-slate-600">
          <span>X Línea de firma</span>
          <span>Conformidad de entrega de EPI</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
        >
          <Eraser className="w-3.5 h-3.5" />
          Limpiar trazo
        </button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors whitespace-nowrap"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Confirmar Firma
          </button>
        </div>
      </div>
    </div>
  );
};
