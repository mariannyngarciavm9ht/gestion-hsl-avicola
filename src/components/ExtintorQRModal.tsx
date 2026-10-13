import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Printer, 
  X, 
  Check, 
  Copy, 
  Flame, 
  MapPin, 
  Gauge, 
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { InspeccionExtintores } from '../types/ehs';

interface ExtintorQRModalProps {
  extintor: InspeccionExtintores | null;
  isOpen: boolean;
  onClose: () => void;
  onEditExtintor?: (extintor: InspeccionExtintores) => void;
}

export const ExtintorQRModal: React.FC<ExtintorQRModalProps> = ({
  extintor,
  isOpen,
  onClose,
  onEditExtintor
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrType, setQrType] = useState<'url' | 'summary'>('url');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  // Generate QR Code dynamically whenever extintor or qrType changes
  useEffect(() => {
    if (!extintor) return;

    let textToEncode = '';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const deepLinkUrl = `${currentOrigin}?extintor=${encodeURIComponent(extintor.Codigo_Extintor)}`;

    if (qrType === 'url') {
      textToEncode = deepLinkUrl;
    } else {
      // Full technical payload summary
      textToEncode = [
        `EXTINTOR: ${extintor.Codigo_Extintor} (ID: ${extintor.ID_Revision})`,
        `UBICACIÓN: ${extintor.Ubicacion}`,
        `AGENTE: ${extintor.Tipo_Agente} | CAPACIDAD: ${extintor.Capacidad}`,
        `PRESIÓN: ${extintor.Presion_PSI || 150} PSI (${extintor.Estado_Presion || 'Normal'})`,
        `ESTADO: ${extintor.Estado_General}`,
        `ÚLTIMA RECARGA: ${extintor.Fecha_Ultima_Recarga}`,
        `PRÓXIMA RECARGA: ${extintor.Proxima_Recarga}`,
        `ENLACE: ${deepLinkUrl}`
      ].join('\n');
    }

    QRCode.toDataURL(textToEncode, {
      width: 320,
      margin: 2,
      color: {
        dark: '#991b1b', // Red industrial tone for fire safety
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [extintor, qrType]);

  if (!isOpen || !extintor) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const deepLinkUrl = `${currentOrigin}?extintor=${encodeURIComponent(extintor.Codigo_Extintor)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deepLinkUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${extintor.Codigo_Extintor}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const isExpired = extintor.Proxima_Recarga < new Date().toISOString().slice(0, 10);
  const psi = extintor.Presion_PSI || 150;
  const isNormalPressure = psi >= 100 && psi <= 195;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-xl w-full max-h-[92vh] overflow-y-auto my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>Código QR del Extintor {extintor.Codigo_Extintor}</span>
              </h3>
              <p className="text-xs text-red-100">
                Al escanear este código se abre la ficha viva con la información modificada.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* QR Type Selector */}
          <div className="flex items-center justify-between p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setQrType('url')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                qrType === 'url'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enlace Web a Ficha en Vivo
            </button>
            <button
              onClick={() => setQrType('summary')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                qrType === 'summary'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ficha Técnica Completa (Texto/Datos)
            </button>
          </div>

          {/* Printable Sticker / Card */}
          <div 
            ref={printRef}
            className="border-2 border-dashed border-red-300 rounded-2xl p-5 bg-linear-to-b from-red-50/40 via-white to-amber-50/30 flex flex-col sm:flex-row items-center gap-6 shadow-sm"
          >
            {/* QR Image Container */}
            <div className="flex flex-col items-center shrink-0">
              <div className="bg-white p-3 rounded-xl border border-red-200 shadow-md">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Código QR ${extintor.Codigo_Extintor}`}
                    className="w-40 h-40 object-contain rounded"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                    Generando QR...
                  </div>
                )}
              </div>
              <span className="text-[10px] text-red-900 font-bold mt-2 font-mono">
                {extintor.Codigo_Extintor} · ESCANEAR
              </span>
            </div>

            {/* Live Data Summary on Sticker */}
            <div className="flex-1 min-w-0 space-y-2 text-xs">
              <div className="border-b border-red-200/80 pb-2">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                  Etiqueta Oficial de Inspección
                </span>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-600" />
                  Extintor {extintor.Codigo_Extintor}
                </h4>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-bold text-slate-900 line-clamp-2">
                    {extintor.Ubicacion}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span>Agente: <strong className="text-slate-900">{extintor.Tipo_Agente}</strong></span>
                  <span>Capacidad: <strong className="text-slate-900">{extintor.Capacidad}</strong></span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-red-600" />
                    Presión: <strong className={isNormalPressure ? 'text-emerald-700' : 'text-red-700'}>{psi} PSI</strong>
                  </span>
                  <span>
                    Manómetro: <strong className={extintor.Manometro_Ok === 'Sí' ? 'text-emerald-700' : 'text-red-700'}>{extintor.Manometro_Ok}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/80">
                  <span>Próx. Recarga:</span>
                  <span className={`font-mono font-bold ${isExpired ? 'text-red-700' : 'text-slate-900'}`}>
                    {extintor.Proxima_Recarga}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Estado General:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    extintor.Estado_General === 'Aprobado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {extintor.Estado_General}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Update Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Sincronización Dinámica:</span>
              <span>
                Cualquier cambio que guarde en la presión ({psi} PSI), fecha de recarga, ubicación o inspección de este extintor se refleja de forma inmediata y automática al escanear este mismo código QR.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Descargar PNG</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-800" />
                <span>Imprimir Etiqueta</span>
              </button>

              {onEditExtintor && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditExtintor(extintor);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-linear-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 rounded-xl transition-all shadow-md"
                >
                  Modificar Extintor
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
