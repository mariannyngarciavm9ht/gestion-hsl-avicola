import React, { useState, useMemo, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  X, 
  FileText, 
  FileUp, 
  Check, 
  Calendar, 
  User, 
  Tag, 
  FileSpreadsheet,
  FileCheck2,
  FolderOpen,
  Camera,
  Sparkles,
  Printer,
  Layers,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { InformeSST, TipoInforme, InspeccionSeguridad } from '../types/ehs';
import { PhotoReportGeneratorModal } from './PhotoReportGeneratorModal';

interface InformesSectionProps {
  informes: InformeSST[];
  onSave: (informe: InformeSST) => void;
  onDelete: (id: string) => void;
  onSaveInspeccion?: (inspeccion: InspeccionSeguridad) => void;
  selectedIdFromSearch?: string | null;
  onClearSelectedId?: () => void;
}

export const InformesSection: React.FC<InformesSectionProps> = ({
  informes,
  onSave,
  onDelete,
  onSaveInspeccion,
  selectedIdFromSearch,
  onClearSelectedId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'Todos' | TipoInforme>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoReportModalOpen, setIsPhotoReportModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<InformeSST | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  React.useEffect(() => {
    if (selectedIdFromSearch) {
      const match = informes.find((i) => i.ID_Informe === selectedIdFromSearch);
      if (match) {
        setViewingItem(match);
      }
      if (onClearSelectedId) onClearSelectedId();
    }
  }, [selectedIdFromSearch, informes, onClearSelectedId]);

  const [formData, setFormData] = useState<Omit<InformeSST, 'ID_Informe'>>({
    Titulo: '',
    Tipo_Informe: 'Auditoría Ambiental',
    Autor: '',
    Fecha: new Date().toISOString().slice(0, 10),
    Area_Sede: 'Planta Industrial',
    Resumen_Alcance: '',
    Nombre_Archivo: '',
    Tamano_Archivo: '',
    Archivo_Data: '',
    Estado: 'Vigente'
  });

  const generateNewId = () => {
    const year = new Date().getFullYear();
    const count = informes.length + 1;
    return `INF-${year}-${String(count).padStart(3, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMB} MB`;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        Nombre_Archivo: file.name,
        Tamano_Archivo: sizeStr,
        Archivo_Data: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Titulo.trim() || !formData.Autor.trim()) {
      alert('Por favor ingrese el título del informe y el autor/entidad que lo elaboró.');
      return;
    }

    if (!formData.Nombre_Archivo) {
      alert('Por favor adjunte el archivo del informe (PDF, DOCX, XLSX, etc.).');
      return;
    }

    const itemToSave: InformeSST = {
      ID_Informe: generateNewId(),
      ...formData
    };

    onSave(itemToSave);
    setIsModalOpen(false);
  };

  const filteredItems = useMemo(() => {
    return informes.filter((item) => {
      const matchTipo = tipoFilter === 'Todos' || item.Tipo_Informe === tipoFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        item.ID_Informe.toLowerCase().includes(term) ||
        item.Titulo.toLowerCase().includes(term) ||
        item.Autor.toLowerCase().includes(term) ||
        item.Area_Sede.toLowerCase().includes(term) ||
        item.Resumen_Alcance.toLowerCase().includes(term) ||
        item.Nombre_Archivo.toLowerCase().includes(term);

      return matchTipo && matchSearch;
    });
  }, [informes, searchTerm, tipoFilter]);

  const downloadFile = (item: InformeSST) => {
    if (item.Archivo_Data) {
      const link = document.createElement('a');
      link.href = item.Archivo_Data;
      link.download = item.Nombre_Archivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create a simulation report file download for demo items
      const blob = new Blob([
        `DOCUMENTO OFICIAL EHS\n====================\nID: ${item.ID_Informe}\nTítulo: ${item.Titulo}\nTipo: ${item.Tipo_Informe}\nAutor: ${item.Autor}\nFecha: ${item.Fecha}\nÁrea: ${item.Area_Sede}\nEstado: ${item.Estado}\n\nResumen y Alcance Técnico:\n${item.Resumen_Alcance}\n\n[Validado por el Departamento de Higiene, Seguridad y Ambiente]`
      ], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.Nombre_Archivo.replace('.pdf', '.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Módulo Documental EHS</span>
            <span aria-hidden="true">·</span>
            <span>Auditorías, Monitoreos y Planes</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{informes.length} informes archivados</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Repositorio y Subida de Informes Técnicos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión documental de auditorías ambientales, estudios de higiene ocupacional, mediciones y peritajes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPhotoReportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-950 bg-linear-to-r from-amber-500 via-orange-400 to-amber-400 hover:from-amber-400 hover:to-orange-400 rounded-xl transition-all whitespace-nowrap shadow-md hover:shadow-amber-500/20 active:scale-98 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>📸 Tomar Fotos y Generar Informe IA</span>
            <span className="bg-slate-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              Nuevo
            </span>
          </button>

          <button
            onClick={() => {
              setFormData({
                Titulo: '',
                Tipo_Informe: 'Auditoría Ambiental',
                Autor: '',
                Fecha: new Date().toISOString().slice(0, 10),
                Area_Sede: 'Planta Industrial',
                Resumen_Alcance: '',
                Nombre_Archivo: '',
                Tamano_Archivo: '',
                Archivo_Data: '',
                Estado: 'Vigente'
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors whitespace-nowrap shadow-2xs"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            Subir Documento
          </button>
        </div>
      </div>

      {/* Feature Banner: Photo-to-Report Assistant */}
      <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-400/5 border border-amber-300/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-linear-to-tr from-amber-600 to-orange-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-md shrink-0">
            📸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-950">
                Generador Automático de Informes con Evidencia Fotográfica
              </h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                Visión Artificial EHS
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Tome fotos en vivo desde su teléfono móvil o suba imágenes de áreas críticas (granjas, faenado, cámaras de frío). La aplicación analiza los peligros observados, aplica normativas y redacta el informe técnico formal al instante.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPhotoReportModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shrink-0 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Abrir Cámara & Generar
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, autor, tipo de informe o archivo..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
          />
        </div>

        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value as any)}
          className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none"
        >
          <option value="Todos">Todos los tipos de informes</option>
          <option value="Auditoría Ambiental">Auditoría Ambiental</option>
          <option value="Informe Técnico SST">Informe Técnico SST</option>
          <option value="Medición de Ruido e Iluminación">Medición de Ruido e Iluminación</option>
          <option value="Plan de Emergencia y Evacuación">Plan de Emergencia</option>
          <option value="Estudio de Impacto Ambiental">Estudio de Impacto Ambiental</option>
          <option value="Investigación de Accidente">Investigación de Accidente</option>
        </select>
      </div>

      {/* Reports Grid Cards & Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-lg">
            <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No hay informes que coincidan</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Suba un nuevo documento técnico o ajuste los términos de búsqueda.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.ID_Informe}
              className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-mono font-semibold text-slate-900">{item.ID_Informe}</span>
                  <span className={`font-semibold text-[11px] ${
                    item.Estado === 'Vigente' ? 'text-emerald-700' :
                    item.Estado === 'En Revisión' ? 'text-amber-700' :
                    'text-slate-500'
                  }`}>
                    {item.Estado}
                  </span>
                </div>

                {/* Photo thumbnail if report has evidence */}
                {item.Fotos_Evidencia && item.Fotos_Evidencia.length > 0 && (
                  <div className="relative mb-2.5 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={item.Fotos_Evidencia[0].url}
                      alt="Evidencia fotográfica"
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-2">
                      <span className="bg-black/70 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs font-bold">
                        <Camera className="w-3 h-3 text-amber-400" />
                        {item.Fotos_Evidencia.length} foto(s)
                      </span>
                      {item.Calificacion_Global && (
                        <span className="bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                          {item.Calificacion_Global}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs font-semibold text-sky-800 mb-1 flex items-center gap-1.5">
                  <span>{item.Tipo_Informe}</span>
                  {item.Generado_Automatico && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                      ✨ IA
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 leading-snug">
                  {item.Titulo}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                  {item.Resumen_Alcance}
                </p>

                <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.Autor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="font-mono tabular-nums">{item.Fecha}</span>
                    </span>
                    <span className="font-mono text-slate-400">{item.Tamano_Archivo}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => downloadFile(item)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  Descargar
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingItem(item)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                    title="Ver ficha técnica"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar el informe ${item.ID_Informe}?`)) {
                        onDelete(item.ID_Informe);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Subir Nuevo Informe */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Subir Informe Técnico o Auditoría Ambiental
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Carga digital para trazabilidad legal y auditorías de fiscalización.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Informe
                </label>
                <input
                  type="text"
                  required
                  value={formData.Titulo}
                  onChange={(e) => setFormData({ ...formData, Titulo: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  placeholder="Ej: Auditoría Anual de Cumplimiento Legal Ambiental 2026"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={formData.Tipo_Informe}
                    onChange={(e) => setFormData({ ...formData, Tipo_Informe: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="Auditoría Ambiental">Auditoría Ambiental</option>
                    <option value="Informe Técnico SST">Informe Técnico SST</option>
                    <option value="Medición de Ruido e Iluminación">Medición de Ruido e Iluminación</option>
                    <option value="Plan de Emergencia y Evacuación">Plan de Emergencia y Evacuación</option>
                    <option value="Estudio de Impacto Ambiental">Estudio de Impacto Ambiental</option>
                    <option value="Investigación de Accidente">Investigación de Accidente</option>
                    <option value="Monitoreo de Calidad de Aire">Monitoreo de Calidad de Aire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Autor / Entidad Evaluadora
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Autor}
                    onChange={(e) => setFormData({ ...formData, Autor: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    placeholder="Ej: Ing. Carlos Mendoza o Consultora Ambiental"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Emisión
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.Fecha}
                    onChange={(e) => setFormData({ ...formData, Fecha: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área o Sede Aplicable
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Area_Sede}
                    onChange={(e) => setFormData({ ...formData, Area_Sede: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    placeholder="Ej: Planta Industrial, Almacén General"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resumen Ejecutivo y Alcance
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.Resumen_Alcance}
                  onChange={(e) => setFormData({ ...formData, Resumen_Alcance: e.target.value })}
                  placeholder="Describa los principales hallazgos, conclusiones y recomendaciones del estudio..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Archivo del Informe (PDF, DOCX, XLSX, TXT)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/70 rounded-lg p-6 text-center cursor-pointer transition-colors"
                >
                  <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  {formData.Nombre_Archivo ? (
                    <div>
                      <p className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" />
                        {formData.Nombre_Archivo}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tamaño: {formData.Tamano_Archivo} · Clic para reemplazar
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Haga clic aquí para seleccionar el archivo desde su ordenador o dispositivo
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Formatos recomendados: PDF, Word, Excel, Planos o Imágenes
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado del Documento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Vigente', 'En Revisión', 'Archivado'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setFormData({ ...formData, Estado: st })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                        formData.Estado === st
                          ? st === 'Vigente'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-500'
                            : st === 'En Revisión'
                            ? 'bg-amber-50 text-amber-800 border-amber-500'
                            : 'bg-slate-100 text-slate-800 border-slate-400'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Guardar Informe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ver Ficha Detallada de Informe (Normal o Con Evidencia Fotográfica) */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full overflow-hidden my-4 max-h-[92vh] flex flex-col ${
            viewingItem.Fotos_Evidencia && viewingItem.Fotos_Evidencia.length > 0 ? 'max-w-4xl' : 'max-w-xl'
          }`}>
            
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {viewingItem.ID_Informe}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-sky-800">{viewingItem.Tipo_Informe}</span>
                  {viewingItem.Calificacion_Global && (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                      {viewingItem.Calificacion_Global}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {viewingItem.Titulo}
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Elaborado por:</span>
                  <span className="font-bold text-slate-900 truncate block mt-0.5">{viewingItem.Autor}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Fecha de Emisión:</span>
                  <span className="font-mono font-bold text-slate-900 block mt-0.5">{viewingItem.Fecha}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Área / Sede:</span>
                  <span className="font-bold text-slate-900 truncate block mt-0.5">{viewingItem.Area_Sede}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Estado:</span>
                  <span className={`font-bold block mt-0.5 ${
                    viewingItem.Estado === 'Vigente' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {viewingItem.Estado}
                  </span>
                </div>
              </div>

              {/* Resumen */}
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  Resumen y Alcance Técnico:
                </span>
                <p className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed text-justify">
                  {viewingItem.Resumen_Alcance}
                </p>
              </div>

              {/* Photographic Evidence Gallery (if available) */}
              {viewingItem.Fotos_Evidencia && viewingItem.Fotos_Evidencia.length > 0 && (
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    Evidencia Fotográfica ({viewingItem.Fotos_Evidencia.length} Fotos Registradas)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {viewingItem.Fotos_Evidencia.map((foto, fIdx) => (
                      <div key={foto.id || fIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <img
                          src={foto.url}
                          alt={foto.etiqueta || `Evidencia #${fIdx + 1}`}
                          className="w-full h-36 object-cover"
                        />
                        <div className="p-2.5 bg-white border-t border-slate-100">
                          <p className="text-[11px] font-bold text-slate-900 line-clamp-1">
                            {foto.etiqueta || `Foto #${fIdx + 1}`}
                          </p>
                          {foto.peligroDetectado && (
                            <p className="text-[10px] text-rose-700 mt-0.5 line-clamp-1">
                              ⚠️ {foto.peligroDetectado}
                            </p>
                          )}
                          {foto.accionCorrectiva && (
                            <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-2">
                              Acción: {foto.accionCorrectiva}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Normativa y Conclusiones if present */}
              {viewingItem.Conclusiones && (
                <div className="border-t border-slate-200 pt-3">
                  <span className="text-xs font-bold text-slate-900 block mb-1">
                    Conclusiones y Dictamen de Inspección:
                  </span>
                  <p className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200 leading-relaxed">
                    {viewingItem.Conclusiones}
                  </p>
                </div>
              )}

              {/* Document download bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{viewingItem.Nombre_Archivo}</div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">{viewingItem.Tamano_Archivo}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile(viewingItem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Modal Close */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Generador Automático de Informes con Fotos & Cámara */}
      <PhotoReportGeneratorModal
        isOpen={isPhotoReportModalOpen}
        onClose={() => setIsPhotoReportModalOpen(false)}
        onSaveInforme={onSave}
        onSaveInspeccion={onSaveInspeccion}
      />
    </div>
  );
};

