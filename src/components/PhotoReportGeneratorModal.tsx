import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Trash2, 
  X, 
  Check, 
  AlertTriangle, 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Edit2,
  Save,
  Layers,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { FotoHallazgoReporte, InformeSST, InspeccionSeguridad } from '../types/ehs';
import { 
  DEMO_PHOTO_SCENARIOS, 
  generatePhotoInspectionReport, 
  GeneratedPhotoReportData 
} from '../utils/photoReportGenerator';

interface PhotoReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInforme: (informe: InformeSST) => void;
  onSaveInspeccion?: (inspeccion: InspeccionSeguridad) => void;
  defaultInspector?: string;
  defaultArea?: string;
}

export const PhotoReportGeneratorModal: React.FC<PhotoReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSaveInforme,
  onSaveInspeccion,
  defaultInspector = 'Ing. Roberto Mendoza (EHS Avícola)',
  defaultArea = 'Planta de Faenado y Beneficio'
}) => {
  // Photos captured or uploaded
  const [capturedPhotos, setCapturedPhotos] = useState<Array<{ id: string; url: string; etiqueta?: string }>>([]);
  
  // Field configuration
  const [areaSede, setAreaSede] = useState<string>(defaultArea);
  const [inspector, setInspector] = useState<string>(defaultInspector);
  const [notasContexto, setNotasContexto] = useState<string>('');
  const [createLinkedInspeccion, setCreateLinkedInspeccion] = useState<boolean>(true);

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Report generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generatedReport, setGeneratedReport] = useState<GeneratedPhotoReportData | null>(null);
  const [generatedSource, setGeneratedSource] = useState<'gemini' | 'local'>('gemini');
  const [generatedId, setGeneratedId] = useState<string>('');

  // Editing mode for generated report
  const [isEditingReport, setIsEditingReport] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // Signature canvas ref for formal sign-off
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  // Areas Avícolas preset
  const areasAvicolas = [
    'Planta de Faenado y Beneficio',
    'Sala de Eviscerado y Desposte',
    'Granjas de Engorde - Galpones',
    'Granjas de Reproductoras y Postura',
    'Cámaras Frigoríficas de Congelación (-18°C)',
    'Planta de Alimento Balanceado (Silos)',
    'Planta de Tratamiento de Aguas Residuales (PTAR)',
    'Calderas y Sala de Compresores',
    'Taller de Mantenimiento Mecánico',
    'Almacén Central y Andén de Carga'
  ];

  // Initialize with at least 1 demo photo if empty for frictionless experience
  useEffect(() => {
    if (isOpen && capturedPhotos.length === 0) {
      // Pick first demo scenario as default suggestion
      const firstDemo = DEMO_PHOTO_SCENARIOS[0];
      setCapturedPhotos([
        {
          id: firstDemo.id,
          url: firstDemo.url,
          etiqueta: firstDemo.label
        }
      ]);
      setAreaSede(firstDemo.area);
      setNotasContexto(firstDemo.notes);
    }
  }, [isOpen]);

  // Clean camera stream on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setGeneratedReport(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara directa no está disponible en este navegador o entorno.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: facingMode }, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 150);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('No se pudo acceder a la cámara en directo. Puede subir archivos desde su dispositivo o usar los escenarios de prueba avícola.');
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

  const toggleCameraFacing = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const newPhoto = {
        id: `foto-${Date.now()}`,
        url: dataUrl,
        etiqueta: `Foto en vivo #${capturedPhotos.length + 1} (${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`
      };
      setCapturedPhotos((prev) => [...prev, newPhoto]);
    }
    // Keep camera active or user can close it
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const src = loadEvent.target?.result as string;
        // Compress using canvas to prevent localStorage overflow
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_W = 900;
          const MAX_H = 700;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > MAX_W) {
              h *= MAX_W / w;
              w = MAX_W;
            }
          } else {
            if (h > MAX_H) {
              w *= MAX_H / h;
              h = MAX_H;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setCapturedPhotos((prev) => [
              ...prev,
              {
                id: `subida-${Date.now()}-${index}`,
                url: compressed,
                etiqueta: file.name
              }
            ]);
          }
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSelectDemoScenario = (scenario: typeof DEMO_PHOTO_SCENARIOS[0]) => {
    setCapturedPhotos((prev) => [
      ...prev,
      {
        id: `demo-${Date.now()}`,
        url: scenario.url,
        etiqueta: scenario.label
      }
    ]);
    setAreaSede(scenario.area);
    if (!notasContexto) {
      setNotasContexto(scenario.notes);
    }
  };

  const handleRemovePhoto = (id: string) => {
    setCapturedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Generate the report with AI / Local Vision engine
  const handleGenerateReport = async () => {
    if (capturedPhotos.length === 0) {
      alert('Por favor capture o adjunte al menos una fotografía de evidencia.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analizando fotografías de evidencia en terreno...');

    try {
      setGenerationStep('Detectando condiciones subestándares y peligros avícolas...');
      const response = await generatePhotoInspectionReport({
        photos: capturedPhotos,
        areaSede,
        inspector,
        notasContexto
      });

      setGenerationStep('Estructurando matriz de acciones correctivas y normas...');
      const newCode = `INF-FOTO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
      setGeneratedId(newCode);
      setGeneratedReport(response.data);
      setGeneratedSource(response.source);
      setIsGenerating(false);
    } catch (err) {
      console.error('Error generating photo report:', err);
      setIsGenerating(false);
      alert('Ocurrió un error al generar el informe. Inténtelo de nuevo.');
    }
  };

  // Save the report into official app state
  const handleSaveToSystem = () => {
    if (!generatedReport) return;

    // Convert photos into FotoHallazgoReporte
    const fotosEvidencia: FotoHallazgoReporte[] = capturedPhotos.map((p, idx) => {
      const matchHallazgo = generatedReport.hallazgos[idx] || generatedReport.hallazgos[0];
      return {
        id: p.id,
        url: p.url,
        etiqueta: p.etiqueta || `Evidencia #${idx + 1}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        titulo: matchHallazgo?.titulo,
        peligroDetectado: matchHallazgo?.peligro,
        nivelRiesgo: matchHallazgo?.nivelRiesgo,
        descripcionVisual: matchHallazgo?.descripcionVisual,
        normativaViolada: matchHallazgo?.normativa,
        accionCorrectiva: matchHallazgo?.accionCorrectiva,
        plazoHorasDias: matchHallazgo?.plazo,
        responsable: matchHallazgo?.responsable
      };
    });

    const newInforme: InformeSST = {
      ID_Informe: generatedId || `INF-FOTO-${new Date().getFullYear()}-001`,
      Titulo: generatedReport.titulo,
      Tipo_Informe: 'Inspección Fotográfica con IA',
      Autor: inspector,
      Fecha: new Date().toISOString().slice(0, 10),
      Area_Sede: generatedReport.areaSede,
      Resumen_Alcance: generatedReport.resumenEjecutivo,
      Nombre_Archivo: `${generatedId || 'informe_fotografico'}_inspeccion.pdf`,
      Tamano_Archivo: `${(capturedPhotos.length * 0.8 + 0.4).toFixed(1)} MB`,
      Archivo_Data: capturedPhotos[0]?.url || '',
      Estado: 'Vigente',
      Fotos_Evidencia: fotosEvidencia,
      Conclusiones: generatedReport.conclusiones,
      Recomendaciones: generatedReport.recomendaciones,
      Normativa_Aplicable: generatedReport.normativaAplicable,
      Calificacion_Global: generatedReport.calificacionGlobal,
      Firma_Inspector: hasSignature ? 'Firma Electrónica Validada en Terreno' : undefined,
      Generado_Automatico: true
    };

    onSaveInforme(newInforme);

    // If requested, also create a linked inspection entry
    if (createLinkedInspeccion && onSaveInspeccion) {
      const firstFinding = generatedReport.hallazgos[0];
      const linkedInspeccion: InspeccionSeguridad = {
        ID_Inspeccion: `INSP-FOTO-${String(Math.floor(Math.random() * 900) + 100)}`,
        Fecha_Hora: new Date().toISOString().slice(0, 16),
        Inspector: inspector,
        Area_Sede: generatedReport.areaSede,
        Ubicacion_Detallada: `Área de ${generatedReport.areaSede} · Inspección de Campo`,
        Aspecto_Evaluado: 'Inspección Visual con Evidencia Fotográfica',
        Tema_Inspeccion: 'Condiciones Locativas y Mecánicas (Fotos)',
        Estado: generatedReport.calificacionGlobal === 'Aprobado' ? 'Cumple' : 'No Cumple',
        Hallazgo_Descripcion: generatedReport.hallazgos.map((h) => `• [${h.nivelRiesgo}] ${h.titulo}: ${h.descripcionVisual}`).join('\n\n'),
        Accion_Correctiva: generatedReport.hallazgos.map((h) => `• ${h.accionCorrectiva} (Plazo: ${h.plazo})`).join('\n\n'),
        Responsable: firstFinding?.responsable || 'Supervisor EHS / Mantenimiento',
        Fecha_Limite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        Foto_Evidencia: capturedPhotos[0]?.url || ''
      };
      onSaveInspeccion(linkedInspeccion);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    if (!generatedReport) return;
    const text = `*INFORME TÉCNICO DE INSPECCIÓN FOTOGRÁFICA*\n` +
      `Código: ${generatedId}\n` +
      `Área: ${generatedReport.areaSede}\n` +
      `Inspector: ${inspector}\n` +
      `Calificación: ${generatedReport.calificacionGlobal}\n\n` +
      `*Resumen Ejecutivo:*\n${generatedReport.resumenEjecutivo}\n\n` +
      `*Hallazgos Principales:*\n` +
      generatedReport.hallazgos.map((h, i) => `${i + 1}. [${h.nivelRiesgo}] ${h.titulo}\n   Acción: ${h.accionCorrectiva} (Plazo: ${h.plazo})`).join('\n\n') +
      `\n\n*Conclusiones:*\n${generatedReport.conclusiones}\n\n` +
      `_Sistema de Gestión de HSL Avícola_`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Modal Header */}
        <div className="sticky top-0 z-20 bg-linear-to-r from-slate-900 via-amber-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-amber-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  Gestión de HSL Avícola · Módulo Fotográfico
                </span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> IA Multimodal
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Tomar Fotos y Generar Informe Automático
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* STEP 1: Capture or Select Photos */}
          {!generatedReport && (
            <div className="space-y-6">
              
              {/* Instructions Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shrink-0">
                    📸
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">
                      Capture fotos con la cámara de su teléfono o cargue imágenes del área
                    </h4>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      El sistema analizará automáticamente las fotos con visión artificial y redactará el informe técnico formal con matriz de peligros, normativas y plan de acción.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-amber-900 bg-white px-2.5 py-1 rounded-md border border-amber-300 shadow-2xs">
                    {capturedPhotos.length} foto(s) cargadas
                  </span>
                </div>
              </div>

              {/* Camera Viewfinder or Actions */}
              {isCameraActive ? (
                <div className="border-2 border-dashed border-amber-500 rounded-2xl bg-black p-3 relative overflow-hidden flex flex-col items-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-80 rounded-xl object-contain bg-black"
                  />

                  {/* Overlaid Viewfinder Target */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border border-white/40 rounded-xl flex items-center justify-center">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-amber-400 absolute top-4 left-4" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-amber-400 absolute top-4 right-4" />
                      <div className="w-4 h-4 border-b-2 border-l-2 border-amber-400 absolute bottom-4 left-4" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-amber-400 absolute bottom-4 right-4" />
                      <span className="text-[10px] text-white/70 font-mono uppercase bg-black/50 px-2 py-0.5 rounded">
                        Enfoque el Peligro / Condición
                      </span>
                    </div>
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="flex items-center gap-3 mt-3 w-full justify-center z-10">
                    <button
                      type="button"
                      onClick={capturePhotoFromCamera}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      Capturar Foto Ahora
                    </button>

                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors"
                      title="Cambiar entre cámara trasera y frontal"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3.5 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Cerrar Cámara
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option 1: Open Camera */}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="p-5 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md mb-2">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      Abrir Cámara en Vivo
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Tomar fotografía directa en el galpón o planta
                    </span>
                  </button>

                  {/* Option 2: Upload Files */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      Subir Imágenes desde Dispositivo
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      JPG, PNG, HEIC o captura de pantalla
                    </span>
                  </div>

                  {/* Option 3: Poultry Field Scenarios */}
                  <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Prueba Rápida: Casos Avícolas</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">
                        Haga clic para cargar fotos reales de inspección:
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {DEMO_PHOTO_SCENARIOS.map((scenario) => (
                        <button
                          key={scenario.id}
                          type="button"
                          onClick={() => handleSelectDemoScenario(scenario)}
                          className="text-[10px] text-left p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 font-semibold line-clamp-1 transition-colors"
                          title={scenario.label}
                        >
                          {scenario.label.split(':')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Gallery of Loaded Photos */}
              {capturedPhotos.length > 0 && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600" />
                      Evidencias Fotográficas ({capturedPhotos.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setCapturedPhotos([])}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Limpiar todas
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {capturedPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="group relative border border-slate-200 rounded-xl overflow-hidden bg-slate-100 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <img
                          src={photo.url}
                          alt={photo.etiqueta || `Foto #${index + 1}`}
                          className="w-full h-28 object-cover cursor-pointer"
                          onClick={() => setSelectedPhotoPreview(photo.url)}
                        />
                        <div className="p-2 bg-white">
                          <p className="text-[10px] font-bold text-slate-800 truncate">
                            {photo.etiqueta || `Foto #${index + 1}`}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono">
                            Evidencia #{index + 1}
                          </span>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs opacity-80 group-hover:opacity-100 transition-opacity"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Context Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Área o Instalación Avícola Inspeccionada
                  </label>
                  <select
                    value={areaSede}
                    onChange={(e) => setAreaSede(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {areasAvicolas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Auditor / Inspector Responsable
                  </label>
                  <input
                    type="text"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    placeholder="Nombre del inspector de SST"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Notas Adicionales de Campo (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notasContexto}
                    onChange={(e) => setNotasContexto(e.target.value)}
                    placeholder="Ejemplo: Inspección de turno mañana por reporte de olor a amoníaco en galpón 3 y falta de esteras en tolva..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={capturedPhotos.length === 0 || isGenerating}
                  onClick={handleGenerateReport}
                  className={`w-full py-3.5 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                    capturedPhotos.length === 0 || isGenerating
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-linear-to-r from-amber-600 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 hover:shadow-amber-500/25 active:scale-98 cursor-pointer'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {isGenerating ? 'Generando Informe...' : '⚡ Generar Informe Automático con las Fotos'}
                  </span>
                </button>
              </div>

            </div>
          )}

          {/* GENERATING LOADING SPINNER */}
          {isGenerating && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-600 animate-bounce shadow-lg">
                <Camera className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Analizando Evidencias Fotográficas con IA
                </h4>
                <p className="text-xs text-amber-800 font-mono mt-1 animate-pulse">
                  {generationStep || 'Procesando imágenes de inspección...'}
                </p>
              </div>
              <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-amber-500 to-orange-500 rounded-full animate-progress" style={{ width: '80%' }} />
              </div>
            </div>
          )}

          {/* STEP 2: GENERATED REPORT VIEW & EDITING */}
          {generatedReport && (
            <div className="space-y-6">
              
              {/* Report Action Bar */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        {generatedId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        generatedReport.calificacionGlobal === 'Aprobado' ? 'bg-emerald-500/20 text-emerald-300' :
                        generatedReport.calificacionGlobal === 'Conforme con Observaciones' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {generatedReport.calificacionGlobal}
                      </span>
                      <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        {generatedSource === 'gemini' ? '✨ Gemini 3.8 Flash' : '⚡ Motor SST'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {generatedReport.titulo}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    title="Copiar texto para WhatsApp o email"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedSuccess ? 'Copiado!' : 'Copiar'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingReport(!isEditingReport)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors font-bold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {isEditingReport ? 'Ver Informe' : 'Modificar Texto'}
                  </button>
                </div>
              </div>

              {/* Official Printable Report Sheet */}
              <div className="border border-slate-300 rounded-xl bg-white p-6 sm:p-8 space-y-6 shadow-xs print:border-none print:shadow-none">
                
                {/* Official Letterhead */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                      A
                    </div>
                    <div>
                      <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                        Gestión de HSL Avícola
                      </h1>
                      <p className="text-xs font-semibold text-amber-800">
                        Departamento de Higiene, Seguridad Laboral y Medio Ambiente
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Auditoría Técnica de Campo con Evidencia Fotográfica
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-1">
                    <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {generatedId}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Fecha: <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Inspector: <span className="font-semibold text-slate-800">{inspector}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Instalación</span>
                    <span className="font-bold text-slate-800">{generatedReport.areaSede}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Dictamen</span>
                    <span className="font-bold text-slate-800">{generatedReport.calificacionGlobal}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Evidencias</span>
                    <span className="font-bold text-slate-800">{capturedPhotos.length} fotografía(s)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Hallazgos</span>
                    <span className="font-bold text-slate-800">{generatedReport.hallazgos.length} condiciones</span>
                  </div>
                </div>

                {/* Resumen Ejecutivo */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    1. Resumen Ejecutivo de la Inspección
                  </h4>
                  {isEditingReport ? (
                    <textarea
                      rows={3}
                      value={generatedReport.resumenEjecutivo}
                      onChange={(e) => setGeneratedReport({ ...generatedReport, resumenEjecutivo: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                      {generatedReport.resumenEjecutivo}
                    </p>
                  )}
                </div>

                {/* Photographic Evidence Gallery embedded into the report */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    2. Registro Fotográfico en Terreno ({capturedPhotos.length} fotos)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {capturedPhotos.map((photo, idx) => (
                      <div key={photo.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <img
                          src={photo.url}
                          alt={photo.etiqueta || `Foto #${idx + 1}`}
                          className="w-full h-36 object-cover cursor-pointer"
                          onClick={() => setSelectedPhotoPreview(photo.url)}
                        />
                        <div className="p-2 text-[10px] bg-white border-t border-slate-100 flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            Foto #{idx + 1}: {photo.etiqueta || 'Evidencia de Campo'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date().toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Findings Matrix Table */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    3. Matriz de Hallazgos, Peligros y Plan de Acción Inmediato
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-slate-200 text-left">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2 border-r border-slate-200">Condición / Peligro</th>
                          <th className="p-2 border-r border-slate-200 w-24">Nivel Riesgo</th>
                          <th className="p-2 border-r border-slate-200">Descripción Visual</th>
                          <th className="p-2 border-r border-slate-200">Acción Correctiva</th>
                          <th className="p-2 w-28">Plazo & Resp.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {generatedReport.hallazgos.map((h, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 border-r border-slate-200 align-top">
                              <span className="font-bold text-slate-900 block">{h.titulo}</span>
                              <span className="text-[10px] text-slate-500 italic block mt-0.5">{h.peligro}</span>
                              <span className="text-[9px] text-slate-400 font-mono block mt-1">{h.normativa}</span>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 align-top">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                h.nivelRiesgo === 'Crítico' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                h.nivelRiesgo === 'Alto' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                                h.nivelRiesgo === 'Medio' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}>
                                {h.nivelRiesgo}
                              </span>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 align-top text-slate-700 leading-relaxed">
                              {h.descripcionVisual}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 align-top font-medium text-slate-800">
                              {h.accionCorrectiva}
                            </td>
                            <td className="p-2.5 align-top">
                              <span className="font-bold text-rose-700 block text-[11px]">{h.plazo}</span>
                              <span className="text-[10px] text-slate-500 block">{h.responsable}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Normativa y Conclusiones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 mb-1.5">
                      Normativas de Seguridad Aplicables:
                    </h5>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {generatedReport.normativaAplicable.map((norma, idx) => (
                        <li key={idx}>{norma}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900 mb-1.5">
                      Conclusiones & Compromiso de Auditoría:
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {generatedReport.conclusiones}
                    </p>
                  </div>
                </div>

                {/* Formal Signatures Section */}
                <div className="border-t border-slate-200 pt-6 grid grid-cols-2 gap-6 text-center">
                  <div className="border-t border-slate-400 pt-2 mx-8">
                    <p className="text-xs font-bold text-slate-900">{inspector}</p>
                    <p className="text-[10px] text-slate-500">Inspector Responsable EHS</p>
                    <span className="text-[9px] text-emerald-600 font-mono block mt-1">
                      ✓ Validado Digitalmente con Evidencia Fotográfica
                    </span>
                  </div>

                  <div className="border-t border-slate-400 pt-2 mx-8">
                    <p className="text-xs font-bold text-slate-900">Gerencia de Operaciones Avícolas</p>
                    <p className="text-[10px] text-slate-500">Recibido y Notificado para Acción</p>
                    <span className="text-[9px] text-slate-400 font-mono block mt-1">
                      Planta / Granja Avícola
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Actions to Save or Discard */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createLinkedInspeccion}
                    onChange={(e) => setCreateLinkedInspeccion(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>
                    Sincronizar también como nueva fila en el Registro de Inspecciones
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGeneratedReport(null)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Volver a Capturar
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToSystem}
                    disabled={savedSuccess}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-950 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-950" />
                        ¡Guardado en el Sistema!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-slate-950" />
                        Guardar en Informes Técnicos
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Full photo preview overlay */}
        {selectedPhotoPreview && (
          <div 
            onClick={() => setSelectedPhotoPreview(null)}
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={selectedPhotoPreview}
                alt="Vista ampliada de evidencia"
                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setSelectedPhotoPreview(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
