import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Calendar, 
  User, 
  MapPin, 
  FileCheck,
  AlertCircle,
  Navigation,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  Wand2,
  ListChecks,
  Camera
} from 'lucide-react';
import { InspeccionSeguridad, EstadoInspeccion, ChecklistItem, InformeSST } from '../types/ehs';
import { CameraUpload } from './CameraUpload';
import { InteractiveChecklist } from './InteractiveChecklist';
import { generateChecklistForTopic } from '../utils/checklistGenerator';
import { PhotoReportGeneratorModal } from './PhotoReportGeneratorModal';

interface InspeccionesSectionProps {
  inspecciones: InspeccionSeguridad[];
  onSave: (inspeccion: InspeccionSeguridad) => void;
  onDelete: (id: string) => void;
  onSaveInforme?: (informe: InformeSST) => void;
  selectedIdFromSearch?: string | null;
  onClearSelectedId?: () => void;
}

export const InspeccionesSection: React.FC<InspeccionesSectionProps> = ({
  inspecciones,
  onSave,
  onDelete,
  onSaveInforme,
  selectedIdFromSearch,
  onClearSelectedId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'Todos' | EstadoInspeccion>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoReportOpen, setIsPhotoReportOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<InspeccionSeguridad | null>(null);
  const [quickTopicPrompt, setQuickTopicPrompt] = useState('');
  const [showChecklistInsideModal, setShowChecklistInsideModal] = useState(true);

  React.useEffect(() => {
    if (selectedIdFromSearch) {
      const match = inspecciones.find((i) => i.ID_Inspeccion === selectedIdFromSearch);
      if (match) {
        setViewingItem(match);
      }
      if (onClearSelectedId) onClearSelectedId();
    }
  }, [selectedIdFromSearch, inspecciones, onClearSelectedId]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<InspeccionSeguridad, 'ID_Inspeccion'>>({
    Fecha_Hora: new Date().toISOString().slice(0, 16).replace('T', ' '),
    Inspector: '',
    Area_Sede: '',
    Ubicacion_Detallada: '',
    Aspecto_Evaluado: 'Orden y limpieza',
    Tema_Inspeccion: 'Orden y limpieza',
    Checklist_Items: generateChecklistForTopic('Orden y limpieza'),
    Estado: 'Cumple',
    Hallazgo_Descripcion: '',
    Foto_Evidencia: '',
    Accion_Correctiva: '',
    Responsable: '',
    Fecha_Limite: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    Estado_Accion: 'Pendiente'
  });

  const generateNewId = () => {
    const year = new Date().getFullYear();
    const count = inspecciones.length + 1;
    return `INS-${year}-${String(count).padStart(3, '0')}`;
  };

  const openNewModal = (customTopic?: string) => {
    setEditingId(null);
    const topic = customTopic || 'Orden y limpieza';
    const initialItems = generateChecklistForTopic(topic);

    setFormData({
      Fecha_Hora: new Date().toISOString().slice(0, 16).replace('T', ' '),
      Inspector: '',
      Area_Sede: '',
      Ubicacion_Detallada: '',
      Aspecto_Evaluado: topic,
      Tema_Inspeccion: topic,
      Checklist_Items: initialItems,
      Estado: 'Cumple',
      Hallazgo_Descripcion: '',
      Foto_Evidencia: '',
      Accion_Correctiva: '',
      Responsable: '',
      Fecha_Limite: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      Estado_Accion: 'Pendiente'
    });
    setShowChecklistInsideModal(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InspeccionSeguridad) => {
    setEditingId(item.ID_Inspeccion);
    setFormData({
      Fecha_Hora: item.Fecha_Hora,
      Inspector: item.Inspector,
      Area_Sede: item.Area_Sede,
      Ubicacion_Detallada: item.Ubicacion_Detallada || '',
      Aspecto_Evaluado: item.Aspecto_Evaluado,
      Tema_Inspeccion: item.Tema_Inspeccion || item.Aspecto_Evaluado,
      Checklist_Items: item.Checklist_Items && item.Checklist_Items.length > 0
        ? item.Checklist_Items
        : generateChecklistForTopic(item.Tema_Inspeccion || item.Aspecto_Evaluado),
      Estado: item.Estado,
      Hallazgo_Descripcion: item.Hallazgo_Descripcion,
      Foto_Evidencia: item.Foto_Evidencia,
      Accion_Correctiva: item.Accion_Correctiva,
      Responsable: item.Responsable,
      Fecha_Limite: item.Fecha_Limite,
      Estado_Accion: item.Estado_Accion || 'Pendiente'
    });
    setShowChecklistInsideModal(true);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Inspector.trim() || !formData.Area_Sede.trim()) {
      alert('Por favor complete el nombre del inspector y el área.');
      return;
    }

    const itemToSave: InspeccionSeguridad = {
      ID_Inspeccion: editingId || generateNewId(),
      ...formData,
      Ubicacion_Detallada: formData.Ubicacion_Detallada || `${formData.Area_Sede} - Punto Principal`
    };

    onSave(itemToSave);
    setIsModalOpen(false);
  };

  const filteredItems = useMemo(() => {
    return inspecciones.filter((item) => {
      const matchEstado = estadoFilter === 'Todos' || item.Estado === estadoFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        item.ID_Inspeccion.toLowerCase().includes(term) ||
        item.Inspector.toLowerCase().includes(term) ||
        item.Area_Sede.toLowerCase().includes(term) ||
        (item.Ubicacion_Detallada && item.Ubicacion_Detallada.toLowerCase().includes(term)) ||
        item.Aspecto_Evaluado.toLowerCase().includes(term) ||
        (item.Tema_Inspeccion && item.Tema_Inspeccion.toLowerCase().includes(term)) ||
        item.Hallazgo_Descripcion.toLowerCase().includes(term) ||
        item.Responsable.toLowerCase().includes(term);

      return matchEstado && matchSearch;
    });
  }, [inspecciones, searchTerm, estadoFilter]);

  const exportCSV = () => {
    const headers = [
      'ID_Inspeccion',
      'Fecha_Hora',
      'Inspector',
      'Area_Sede',
      'Donde_Se_Encuentra_Ubicado',
      'Aspecto_Evaluado',
      'Estado',
      'Puntos_Checklist_Total',
      'Puntos_Cumple',
      'Puntos_No_Cumple',
      'Hallazgo_Descripcion',
      'Accion_Correctiva',
      'Responsable',
      'Fecha_Limite'
    ];
    const rows = filteredItems.map((i) => {
      const chk = i.Checklist_Items || [];
      const cCumple = chk.filter((c) => c.estado === 'Cumple').length;
      const cFalla = chk.filter((c) => c.estado === 'No Cumple').length;

      return [
        `"${i.ID_Inspeccion}"`,
        `"${i.Fecha_Hora}"`,
        `"${i.Inspector}"`,
        `"${i.Area_Sede}"`,
        `"${(i.Ubicacion_Detallada || '').replace(/"/g, '""')}"`,
        `"${i.Aspecto_Evaluado}"`,
        `"${i.Estado}"`,
        `"${chk.length}"`,
        `"${cCumple}"`,
        `"${cFalla}"`,
        `"${i.Hallazgo_Descripcion.replace(/"/g, '""')}"`,
        `"${i.Accion_Correctiva.replace(/"/g, '""')}"`,
        `"${i.Responsable}"`,
        `"${i.Fecha_Limite}"`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inspecciones_seguridad_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const aspectosPredefinidos = [
    'Orden y limpieza',
    'Maquinarias y resguardos',
    'Instalaciones eléctricas',
    'Ergonomía y posturas',
    'Trabajo en altura',
    'Sustancias y productos químicos',
    'Vías de evacuación y señalización',
    'Equipos de elevación / Montacargas',
    'Ventilación y ruido ambiental',
    'Calderas y recipientes a presión',
    'Espacios confinados',
    'Soldadura y trabajos en caliente'
  ];

  const ubicacionesSugeridas = [
    'Nave B · Pasillo 4 · Junto a Tablero TD-03',
    'Almacén Químicos · Bahía 12 · Muro Exterior',
    'Línea de Envasado · Cinta 2 · Módulo de Sellado',
    'Edificio Central · Piso 2 · Puerta Oeste',
    'Taller de Soldadura · Mesa 3 de Amolado',
    'Zona de Carga · Rampa 3B · Muelle Exterior'
  ];

  return (
    <div className="space-y-6">
      {/* Header and Toolbar with energetic Amber/Safety Yellow accents */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200/80 bg-linear-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold mb-1">
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">Tabla 1</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-amber-600" />
              Módulo de Campo & Ubicación en Planta
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-amber-900 font-bold">{inspecciones.length} inspecciones</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Inspecciones de Seguridad Laboral
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Checklist dinámica inteligente para cualquier equipo o área, fotos de evidencia, ubicación exacta y plan correctivo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Exportar CSV
          </button>
          <button
            onClick={() => setIsPhotoReportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 rounded-lg transition-all shadow-xs cursor-pointer active:scale-98"
            title="Tomar fotografías y generar informe técnico automático con IA"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>📸 Foto-Informe IA</span>
          </button>
          <button
            onClick={() => openNewModal()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 rounded-lg transition-all shadow-md hover:shadow-lg whitespace-nowrap transform active:scale-98"
          >
            <Plus className="w-4 h-4 text-white" />
            Nueva Inspección
          </button>
        </div>
      </div>

      {/* QUICK ASSISTANT BANNER: Generador Inmediato para Cualquier Inspección */}
      <div className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-200" />
            </div>
            <h3 className="text-sm font-black tracking-wide uppercase text-yellow-100">
              Asistente Inmediato de Lista de Chequeo (Checklist Inteligente)
            </h3>
          </div>
          <p className="text-xs text-white/90 max-w-2xl mb-3">
            Escriba <strong>cualquier inspección que desee realizar</strong> (ej: <em>Trabajo en caliente en tanque 3</em>, <em>Calderas de vapor</em>, <em>Montacargas</em>, <em>Químicos</em>, <em>Comedor</em>) y la app le preparará la lista de chequeo al instante con opción a modificar todo lo que desee:
          </p>

          <div className="flex flex-col sm:flex-row gap-2 max-w-3xl">
            <input
              type="text"
              value={quickTopicPrompt}
              onChange={(e) => setQuickTopicPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && quickTopicPrompt.trim()) {
                  openNewModal(quickTopicPrompt.trim());
                  setQuickTopicPrompt('');
                }
              }}
              placeholder="¿Qué inspección desea hacer hoy? Escriba aquí cualquier equipo o actividad..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white shadow-inner"
            />
            <button
              onClick={() => {
                openNewModal(quickTopicPrompt.trim() || 'Inspección General de Seguridad');
                setQuickTopicPrompt('');
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-lg transition-all active:scale-98 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Generar Checklist y Comenzar
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-white/80">
            <span className="font-semibold text-yellow-200">Sugerencias rápidas:</span>
            {[
              'Andamios en Fachada',
              'Montacargas Eléctricos',
              'Soldadura y Oxicorte',
              'Tableros Eléctricos',
              'Almacén de Químicos',
              'Calderas y Presión',
              'Espacios Confinados'
            ].map((sug) => (
              <button
                key={sug}
                onClick={() => openNewModal(sug)}
                className="bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded-md text-white transition-colors border border-white/20"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, inspector, área, ubicación exacta, tema de checklist..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>

        {/* State filter buttons with colorful indicators */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          {(['Todos', 'Cumple', 'No Cumple', 'No Aplica'] as const).map((est) => (
            <button
              key={est}
              onClick={() => setEstadoFilter(est)}
              className={`px-3 py-1 rounded-md transition-all ${
                estadoFilter === est
                  ? est === 'Cumple'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : est === 'No Cumple'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {est}
            </button>
          ))}
        </div>
      </div>

      {/* Table with prominent Ubicación Específica and Checklist Status */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-linear-to-r from-slate-100 via-amber-50/40 to-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3.5 px-4">ID Inspección</th>
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Inspector</th>
                <th className="py-3.5 px-4">Área / Sede</th>
                <th className="py-3.5 px-4 text-amber-900">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    Ubicación Específica
                  </span>
                </th>
                <th className="py-3.5 px-4">Aspecto Evaluado</th>
                <th className="py-3.5 px-4">Checklist de Control</th>
                <th className="py-3.5 px-4">Estado General</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron inspecciones con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const checkItems = item.Checklist_Items || [];
                  const cumplen = checkItems.filter((c) => c.estado === 'Cumple').length;
                  const fallan = checkItems.filter((c) => c.estado === 'No Cumple').length;
                  const total = checkItems.length;

                  return (
                    <tr
                      key={item.ID_Inspeccion}
                      className="hover:bg-amber-50/40 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-900 whitespace-nowrap">
                        {item.ID_Inspeccion}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono tabular-nums whitespace-nowrap">
                        {item.Fecha_Hora}
                      </td>

                      <td className="py-3 px-4 text-slate-800 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.Inspector}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                        {item.Area_Sede}
                      </td>

                      {/* Ubicación Específica */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate max-w-[200px]" title={item.Ubicacion_Detallada}>
                            {item.Ubicacion_Detallada || 'Punto central'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-800 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>{item.Aspecto_Evaluado}</span>
                        </div>
                      </td>

                      {/* Checklist Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {total > 0 ? (
                          <button
                            onClick={() => setViewingItem(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                              fallan > 0
                                ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title="Clic para ver detalle de la lista de chequeo"
                          >
                            <ListChecks className="w-3 h-3" />
                            <span>
                              {fallan > 0 ? `${fallan} no conformidades` : `${total} de ${total} OK`}
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Sin checklist</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 shadow-2xs ${
                            item.Estado === 'Cumple'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : item.Estado === 'No Cumple'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          {item.Estado === 'Cumple' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : item.Estado === 'No Cumple' ? (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{item.Estado}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setViewingItem(item)}
                            title="Ver detalles e informe completo"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            title="Editar inspección"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la inspección ${item.ID_Inspeccion}?`)) {
                                onDelete(item.ID_Inspeccion);
                              }
                            }}
                            title="Eliminar"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Nueva / Editar Inspección con Checklist Integrada */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-300 max-w-3xl w-full max-h-[92vh] overflow-y-auto my-8">
            <div className="px-6 py-4 bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between sticky top-0 z-20 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-yellow-200" />
                  {editingId ? `Editar Inspección ${editingId}` : 'Registrar Nueva Inspección de Seguridad'}
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Checklist dinámica personalizada para cualquier inspección, evidencia fotográfica y ubicación.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Basic metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha y Hora de la Inspección
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Fecha_Hora}
                    onChange={(e) => setFormData({ ...formData, Fecha_Hora: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-semibold"
                    placeholder="YYYY-MM-DD HH:mm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inspector Responsable
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Inspector}
                    onChange={(e) => setFormData({ ...formData, Inspector: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Ej: Ing. Carlos Mendoza"
                  />
                </div>
              </div>

              {/* Área General + DÓNDE SE ENCUENTRA UBICADO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Área o Sede General
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Area_Sede}
                    onChange={(e) => setFormData({ ...formData, Area_Sede: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Ej: Taller Central, Almacén de Químicos, Silos..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1 text-amber-900">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    Dónde se encuentra ubicado específicamente
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Ubicacion_Detallada}
                    onChange={(e) => setFormData({ ...formData, Ubicacion_Detallada: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-amber-300 bg-amber-50/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    placeholder="Ej: Nave B · Pasillo 4 · Junto a Tablero TD-03"
                  />
                </div>
              </div>

              {/* Suggestions chips for quick location insertion */}
              <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-xs">
                <span className="text-[11px] font-bold text-amber-900 block mb-1">
                  Sugerencias rápidas de ubicación:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ubicacionesSugeridas.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setFormData({ ...formData, Ubicacion_Detallada: sug })}
                      className="text-[11px] bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded hover:bg-amber-100 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHECKLIST SECTION - THE STAR OF THE INSPECTION */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Lista de Chequeo Asistida (Checklist de Inspección)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowChecklistInsideModal(!showChecklistInsideModal)}
                    className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                  >
                    <span>{showChecklistInsideModal ? 'Ocultar Checklist' : 'Mostrar Checklist'}</span>
                    {showChecklistInsideModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showChecklistInsideModal && (
                  <InteractiveChecklist
                    initialTopic={formData.Tema_Inspeccion || formData.Aspecto_Evaluado}
                    items={formData.Checklist_Items || []}
                    onChangeItems={(newItems) => {
                      setFormData({
                        ...formData,
                        Checklist_Items: newItems
                      });
                    }}
                    onApplyFindings={({ estadoGeneral, hallazgo, accionRecomendada, aspectoEvaluado }) => {
                      setFormData({
                        ...formData,
                        Estado: estadoGeneral,
                        Hallazgo_Descripcion: hallazgo,
                        Accion_Correctiva: accionRecomendada,
                        Aspecto_Evaluado: aspectoEvaluado,
                        Tema_Inspeccion: aspectoEvaluado
                      });
                    }}
                  />
                )}
              </div>

              {/* Aspecto Evaluado Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Aspecto Evaluado / Categoría Principal
                  </label>
                  <input
                    type="text"
                    value={formData.Aspecto_Evaluado}
                    onChange={(e) => setFormData({ ...formData, Aspecto_Evaluado: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                    placeholder="Ej: Orden y limpieza, Andamios, Calderas..."
                  />
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                    <span className="text-slate-400">Rápidos:</span>
                    {aspectosPredefinidos.slice(0, 4).map((asp) => (
                      <button
                        key={asp}
                        type="button"
                        onClick={() => setFormData({ ...formData, Aspecto_Evaluado: asp, Tema_Inspeccion: asp })}
                        className="text-amber-700 hover:underline"
                      >
                        {asp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Estado General de Conformidad
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Cumple', 'No Cumple', 'No Aplica'] as const).map((est) => (
                      <button
                        type="button"
                        key={est}
                        onClick={() => setFormData({ ...formData, Estado: est })}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                          formData.Estado === est
                            ? est === 'Cumple'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : est === 'No Cumple'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {est}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hallazgo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción del Hallazgo / Observación de Campo
                </label>
                <textarea
                  rows={3}
                  value={formData.Hallazgo_Descripcion}
                  onChange={(e) => setFormData({ ...formData, Hallazgo_Descripcion: e.target.value })}
                  placeholder="Detalle la condición subestándar identificada en esta ubicación (o presione 'Aplicar Checklist' para auto-completar)..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Foto Evidencia */}
              <div>
                <CameraUpload
                  value={formData.Foto_Evidencia}
                  onChange={(val) => setFormData({ ...formData, Foto_Evidencia: val })}
                  label="Foto de Evidencia (Cámara Móvil / Galería en Terreno)"
                />
              </div>

              {/* Accion Correctiva Section */}
              <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-200 space-y-3">
                <div className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Plan de Acción Correctiva y Responsable
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Acción Correctiva Propuesta
                  </label>
                  <input
                    type="text"
                    value={formData.Accion_Correctiva}
                    onChange={(e) => setFormData({ ...formData, Accion_Correctiva: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    placeholder="Ej: Instalar protecciones y delimitar zona de seguridad de inmediato"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Responsable de Implementación
                    </label>
                    <input
                      type="text"
                      value={formData.Responsable}
                      onChange={(e) => setFormData({ ...formData, Responsable: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: Ing. Roberto Silva (Jefe de Mantenimiento)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha Límite de Cumplimiento
                    </label>
                    <input
                      type="date"
                      value={formData.Fecha_Limite}
                      onChange={(e) => setFormData({ ...formData, Fecha_Limite: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-md transition-all active:scale-98"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Inspección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Visualización de Detalle Completo con Checklist y Fotos */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-300 max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    {viewingItem.ID_Inspeccion}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{viewingItem.Fecha_Hora}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {viewingItem.Aspecto_Evaluado}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Imprimir informe de inspección"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewingItem(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* General state banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">Estado de la Inspección:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border inline-flex items-center gap-1.5 ${
                  viewingItem.Estado === 'Cumple'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : viewingItem.Estado === 'No Cumple'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                {viewingItem.Estado === 'Cumple' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : viewingItem.Estado === 'No Cumple' ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-500" />
                )}
                <span>{viewingItem.Estado}</span>
              </span>
            </div>

            {/* Location & Inspector info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Inspector:</span>
                <span className="font-bold text-slate-900">{viewingItem.Inspector}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Área o Sede:</span>
                <span className="font-bold text-slate-900">{viewingItem.Area_Sede}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-amber-200/80">
                <span className="text-amber-900 font-bold block mb-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  Dónde se encuentra ubicado específicamente:
                </span>
                <span className="font-semibold text-slate-800">
                  {viewingItem.Ubicacion_Detallada || 'No especificada'}
                </span>
              </div>
            </div>

            {/* Checklist evaluation details if available */}
            {viewingItem.Checklist_Items && viewingItem.Checklist_Items.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-amber-600" />
                    <span>Puntos de Control Evaluados ({viewingItem.Checklist_Items.length})</span>
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-slate-600">
                    {viewingItem.Checklist_Items.filter((c) => c.estado === 'Cumple').length} Cumple / {viewingItem.Checklist_Items.filter((c) => c.estado === 'No Cumple').length} Fallas
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {viewingItem.Checklist_Items.map((chk, idx) => (
                    <div
                      key={chk.id || idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                        chk.estado === 'No Cumple'
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : chk.estado === 'Cumple'
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex-1">
                        <span className="font-medium">{idx + 1}. {chk.criterio}</span>
                        {chk.observacion && (
                          <span className="block text-[11px] text-slate-500 italic mt-0.5">
                            Nota: {chk.observacion}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md whitespace-nowrap ${
                          chk.estado === 'Cumple'
                            ? 'bg-emerald-100 text-emerald-800'
                            : chk.estado === 'No Cumple'
                            ? 'bg-rose-200 text-rose-900 font-extrabold'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {chk.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Findings description */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Descripción del Hallazgo / Evidencia:
              </span>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line font-medium">
                {viewingItem.Hallazgo_Descripcion || 'Sin observaciones registradas.'}
              </p>
            </div>

            {/* Evidence Photo */}
            {viewingItem.Foto_Evidencia && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  Foto de Evidencia en Terreno:
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-64 flex items-center justify-center bg-slate-900">
                  <img
                    src={viewingItem.Foto_Evidencia}
                    alt="Evidencia de inspección"
                    className="max-h-64 object-contain w-full"
                  />
                </div>
              </div>
            )}

            {/* Corrective Action */}
            <div className="bg-orange-50/80 p-4 rounded-xl border border-orange-200 text-xs space-y-2">
              <span className="font-bold text-orange-950 block">Acción Correctiva Comprometida:</span>
              <p className="text-slate-800 font-medium">
                {viewingItem.Accion_Correctiva || 'No se requirió acción correctiva inmediata.'}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-orange-200/60 text-slate-600">
                <span>Responsable: <strong className="text-slate-900">{viewingItem.Responsable || 'No asignado'}</strong></span>
                <span>Límite: <strong className="font-mono text-slate-900">{viewingItem.Fecha_Limite}</strong></span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  const it = viewingItem;
                  setViewingItem(null);
                  openEditModal(it);
                }}
                className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Modificar Inspección
              </button>
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Generador Automático de Informes con Fotos & Cámara */}
      <PhotoReportGeneratorModal
        isOpen={isPhotoReportOpen}
        onClose={() => setIsPhotoReportOpen(false)}
        onSaveInforme={(inf) => {
          if (onSaveInforme) onSaveInforme(inf);
        }}
        onSaveInspeccion={onSave}
      />
    </div>
  );
};
