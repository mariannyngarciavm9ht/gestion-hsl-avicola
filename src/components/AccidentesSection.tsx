import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  AlertTriangle, 
  User, 
  MapPin, 
  Clock, 
  Calendar,
  Activity
} from 'lucide-react';
import { 
  RegistroAccidente, 
  TipoEventoAccidente, 
  GravedadAccidente 
} from '../types/ehs';

interface AccidentesSectionProps {
  accidentes: RegistroAccidente[];
  onSave: (accidente: RegistroAccidente) => void;
  onDelete: (id: string) => void;
  selectedIdFromSearch?: string | null;
  onClearSelectedId?: () => void;
}

export const AccidentesSection: React.FC<AccidentesSectionProps> = ({
  accidentes,
  onSave,
  onDelete,
  selectedIdFromSearch,
  onClearSelectedId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gravedadFilter, setGravedadFilter] = useState<'Todos' | GravedadAccidente>('Todos');
  const [tipoFilter, setTipoFilter] = useState<'Todos' | TipoEventoAccidente>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<RegistroAccidente | null>(null);

  React.useEffect(() => {
    if (selectedIdFromSearch) {
      const match = accidentes.find((a) => a.ID_Accidente === selectedIdFromSearch);
      if (match) {
        setViewingItem(match);
      }
      if (onClearSelectedId) onClearSelectedId();
    }
  }, [selectedIdFromSearch, accidentes, onClearSelectedId]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<RegistroAccidente, 'ID_Accidente'>>({
    Fecha_Incidente: new Date().toISOString().slice(0, 10),
    Nombre_Afectado: '',
    Area: '',
    Tipo_Evento: 'Accidente Laboral',
    Gravedad: 'Leve',
    Descripcion_Hechos: '',
    Dias_Perdidos: 0,
    Parte_Cuerpo: '',
    Accion_Inmediata: ''
  });

  const generateNewId = () => {
    const year = new Date().getFullYear();
    const count = accidentes.length + 1;
    return `ACC-${year}-${String(count).padStart(3, '0')}`;
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      Fecha_Incidente: new Date().toISOString().slice(0, 10),
      Nombre_Afectado: '',
      Area: '',
      Tipo_Evento: 'Accidente Laboral',
      Gravedad: 'Leve',
      Descripcion_Hechos: '',
      Dias_Perdidos: 0,
      Parte_Cuerpo: '',
      Accion_Inmediata: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: RegistroAccidente) => {
    setEditingId(item.ID_Accidente);
    setFormData({
      Fecha_Incidente: item.Fecha_Incidente,
      Nombre_Afectado: item.Nombre_Afectado,
      Area: item.Area,
      Tipo_Evento: item.Tipo_Evento,
      Gravedad: item.Gravedad,
      Descripcion_Hechos: item.Descripcion_Hechos,
      Dias_Perdidos: item.Dias_Perdidos,
      Parte_Cuerpo: item.Parte_Cuerpo || '',
      Accion_Inmediata: item.Accion_Inmediata || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre_Afectado.trim() || !formData.Area.trim() || !formData.Descripcion_Hechos.trim()) {
      alert('Por favor complete el nombre del afectado, área y descripción de los hechos.');
      return;
    }

    const itemToSave: RegistroAccidente = {
      ID_Accidente: editingId || generateNewId(),
      ...formData,
      Dias_Perdidos: Number(formData.Dias_Perdidos) || 0
    };

    onSave(itemToSave);
    setIsModalOpen(false);
  };

  const filteredItems = useMemo(() => {
    return accidentes.filter((item) => {
      const matchGravedad = gravedadFilter === 'Todos' || item.Gravedad === gravedadFilter;
      const matchTipo = tipoFilter === 'Todos' || item.Tipo_Evento === tipoFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        item.ID_Accidente.toLowerCase().includes(term) ||
        item.Nombre_Afectado.toLowerCase().includes(term) ||
        item.Area.toLowerCase().includes(term) ||
        item.Tipo_Evento.toLowerCase().includes(term) ||
        item.Descripcion_Hechos.toLowerCase().includes(term);

      return matchGravedad && matchTipo && matchSearch;
    });
  }, [accidentes, searchTerm, gravedadFilter, tipoFilter]);

  const totalDiasPerdidos = useMemo(() => {
    return accidentes.reduce((sum, item) => sum + (Number(item.Dias_Perdidos) || 0), 0);
  }, [accidentes]);

  const exportCSV = () => {
    const headers = [
      'ID_Accidente',
      'Fecha_Incidente',
      'Nombre_Afectado',
      'Area',
      'Tipo_Evento',
      'Gravedad',
      'Descripcion_Hechos',
      'Dias_Perdidos',
      'Parte_Cuerpo',
      'Accion_Inmediata'
    ];
    const rows = filteredItems.map((a) => [
      `"${a.ID_Accidente}"`,
      `"${a.Fecha_Incidente}"`,
      `"${a.Nombre_Afectado}"`,
      `"${a.Area}"`,
      `"${a.Tipo_Evento}"`,
      `"${a.Gravedad}"`,
      `"${a.Descripcion_Hechos.replace(/"/g, '""')}"`,
      `"${a.Dias_Perdidos}"`,
      `"${a.Parte_Cuerpo || ''}"`,
      `"${(a.Accion_Inmediata || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registro_accidentes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Tabla 2</span>
            <span aria-hidden="true">·</span>
            <span>Libro de Accidentes, Incidentes y Enfermedades</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{accidentes.length} registros</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Registro de Accidentes e Incidentes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de eventos no deseados, días de incapacidad laboral temporal y severidad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Exportar CSV
          </button>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4 text-rose-400" />
            Registrar Evento
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Total Eventos Registrados</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {accidentes.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
            <span>Accidentes: {accidentes.filter((a) => a.Tipo_Evento === 'Accidente Laboral').length}</span>
            <span aria-hidden="true">·</span>
            <span>Incidentes: {accidentes.filter((a) => a.Tipo_Evento === 'Incidente').length}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Días Perdidos Acumulados</div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-mono tabular-nums">
            {totalDiasPerdidos} días
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Jornadas de trabajo no laboradas por incapacidad médica
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Eventos Graves / Mortales</div>
          <div className="text-2xl font-bold text-rose-700 mt-1 font-mono tabular-nums">
            {accidentes.filter((a) => a.Gravedad === 'Grave' || a.Gravedad === 'Mortal').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requieren investigación obligatoria de comité SST
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por afectado, ID, área o descripción..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Gravedad filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
            {(['Todos', 'Leve', 'Grave', 'Mortal'] as const).map((grav) => (
              <button
                key={grav}
                onClick={() => setGravedadFilter(grav)}
                className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                  gravedadFilter === grav
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {grav}
              </button>
            ))}
          </div>

          {/* Tipo Evento filter */}
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="Todos">Todos los tipos</option>
            <option value="Accidente Laboral">Accidente Laboral</option>
            <option value="Incidente">Incidente</option>
            <option value="Enfermedad Ocupacional">Enfermedad Ocupacional</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">ID Accidente</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Colaborador Afectado</th>
                <th className="py-3 px-4">Área</th>
                <th className="py-3 px-4">Tipo de Evento</th>
                <th className="py-3 px-4">Gravedad</th>
                <th className="py-3 px-4">Días Perdidos</th>
                <th className="py-3 px-4">Descripción de los Hechos</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">No se encontraron registros de accidentes</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No hay eventos con los criterios seleccionados.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.ID_Accidente} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {item.ID_Accidente}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      {item.Fecha_Incidente}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.Nombre_Afectado}</div>
                      {item.Parte_Cuerpo && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Lesión: {item.Parte_Cuerpo}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {item.Area}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-800 font-medium">
                        {item.Tipo_Evento}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-semibold ${
                        item.Gravedad === 'Leve'
                          ? 'text-amber-700'
                          : item.Gravedad === 'Grave'
                          ? 'text-rose-700'
                          : 'text-purple-800'
                      }`}>
                        {item.Gravedad}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      <span className={`font-semibold ${item.Dias_Perdidos > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
                        {item.Dias_Perdidos} días
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-700 truncate max-w-xs text-xs">
                        {item.Descripcion_Hechos}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setViewingItem(item)}
                          title="Ver detalle de investigación"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          title="Editar"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar el registro ${item.ID_Accidente}?`)) {
                              onDelete(item.ID_Accidente);
                            }
                          }}
                          title="Eliminar"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Nuevo / Editar Registro de Accidente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? `Editar Evento ${editingId}` : 'Registrar Accidente / Incidente Laboral'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Notificación obligatoria para control de estadísticas y comité de seguridad.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha del Incidente
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.Fecha_Incidente}
                    onChange={(e) => setFormData({ ...formData, Fecha_Incidente: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Afectado / Colaborador
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Nombre_Afectado}
                    onChange={(e) => setFormData({ ...formData, Nombre_Afectado: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    placeholder="Ej: Jorge Ramírez Morales"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área o Sección
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Area}
                    onChange={(e) => setFormData({ ...formData, Area: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    placeholder="Ej: Taller de Soldadura, Despacho"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parte del Cuerpo Afectada
                  </label>
                  <input
                    type="text"
                    value={formData.Parte_Cuerpo}
                    onChange={(e) => setFormData({ ...formData, Parte_Cuerpo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    placeholder="Ej: Mano izquierda, Ojos, Espalda"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={formData.Tipo_Evento}
                    onChange={(e) => setFormData({ ...formData, Tipo_Evento: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="Accidente Laboral">Accidente Laboral</option>
                    <option value="Incidente">Incidente (Casi accidente)</option>
                    <option value="Enfermedad Ocupacional">Enfermedad Ocupacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gravedad del Evento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Leve', 'Grave', 'Mortal'] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setFormData({ ...formData, Gravedad: g })}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                          formData.Gravedad === g
                            ? g === 'Leve'
                              ? 'bg-amber-50 text-amber-900 border-amber-400'
                              : g === 'Grave'
                              ? 'bg-rose-50 text-rose-900 border-rose-500'
                              : 'bg-purple-50 text-purple-900 border-purple-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Días Perdidos (Jornadas no laboradas)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.Dias_Perdidos}
                  onChange={(e) => setFormData({ ...formData, Dias_Perdidos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  placeholder="0 si fue incidente o sin baja médica"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción Detallada de los Hechos
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.Descripcion_Hechos}
                  onChange={(e) => setFormData({ ...formData, Descripcion_Hechos: e.target.value })}
                  placeholder="Explique cómo ocurrió el evento, qué tarea se ejecutaba, herramientas involucradas y circunstancias del entorno..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Acción Inmediata Adoptada
                </label>
                <input
                  type="text"
                  value={formData.Accion_Inmediata}
                  onChange={(e) => setFormData({ ...formData, Accion_Inmediata: e.target.value })}
                  placeholder="Ej: Primeros auxilios en tópico, traslado a clínica, detención preventiva de máquina..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
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
                  {editingId ? 'Guardar Cambios' : 'Registrar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ver Ficha de Accidente */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-bold text-slate-900">{viewingItem.ID_Accidente}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{viewingItem.Fecha_Incidente}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {viewingItem.Nombre_Afectado}
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Tipo de Evento:</span>
                <span className="font-semibold text-slate-900">{viewingItem.Tipo_Evento}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Gravedad Calificada:</span>
                <span className={`font-bold ${
                  viewingItem.Gravedad === 'Leve' ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {viewingItem.Gravedad}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Área / Lugar:</span>
                <span className="font-semibold text-slate-900">{viewingItem.Area}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Días Perdidos:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {viewingItem.Dias_Perdidos} días
                </span>
              </div>
            </div>

            {viewingItem.Parte_Cuerpo && (
              <div>
                <span className="text-xs text-slate-400 block mb-1">Parte del Cuerpo Afectada:</span>
                <p className="text-xs font-medium text-slate-800">{viewingItem.Parte_Cuerpo}</p>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-400 block mb-1">Descripción de los Hechos:</span>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {viewingItem.Descripcion_Hechos}
              </p>
            </div>

            {viewingItem.Accion_Inmediata && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
                <span className="font-bold text-emerald-900 block mb-1">Acción Inmediata Adoptada:</span>
                <p className="text-emerald-800">{viewingItem.Accion_Inmediata}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
