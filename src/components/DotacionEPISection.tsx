import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  ShieldCheck, 
  User, 
  Calendar, 
  PenTool, 
  Printer, 
  FileCheck
} from 'lucide-react';
import { DotacionEPI } from '../types/ehs';
import { SignaturePad } from './SignaturePad';

interface DotacionEPISectionProps {
  dotacionEPI: DotacionEPI[];
  onSave: (entrega: DotacionEPI) => void;
  onDelete: (id: string) => void;
  selectedIdFromSearch?: string | null;
  onClearSelectedId?: () => void;
}

export const DotacionEPISection: React.FC<DotacionEPISectionProps> = ({
  dotacionEPI,
  onSave,
  onDelete,
  selectedIdFromSearch,
  onClearSelectedId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<DotacionEPI | null>(null);

  React.useEffect(() => {
    if (selectedIdFromSearch) {
      const match = dotacionEPI.find((e) => e.ID_Entrega === selectedIdFromSearch);
      if (match) {
        setViewingItem(match);
      }
      if (onClearSelectedId) onClearSelectedId();
    }
  }, [selectedIdFromSearch, dotacionEPI, onClearSelectedId]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<DotacionEPI, 'ID_Entrega'>>({
    Fecha_Entrega: new Date().toISOString().slice(0, 10),
    Nombre_Colaborador: '',
    Cargo: '',
    Tipo_EPI: 'Casco de seguridad clase E',
    Cantidad: 1,
    Firma_Recibido: '',
    Observaciones: ''
  });

  const generateNewId = () => {
    const year = new Date().getFullYear();
    const count = dotacionEPI.length + 1;
    return `EPI-${year}-${String(count).padStart(3, '0')}`;
  };

  const tiposEPIComunes = [
    'Casco de seguridad clase E',
    'Guantes de nitrilo / vaqueta',
    'Botas de seguridad con puntera de acero/composite',
    'Lentes de seguridad con filtro UV y antiempañante',
    'Respirador para material particulado N95',
    'Respirador de doble vía con cartuchos para vapores químicos',
    'Protector auditivo tipo copa (orejeras)',
    'Tapones auditivos de espuma autoexpandibles',
    'Arnés de seguridad de cuerpo entero para altura (4 anillos)',
    'Chaleco de alta visibilidad con bandas reflectivas 3M',
    'Careta facial para esmerilar / salpicaduras'
  ];

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      Fecha_Entrega: new Date().toISOString().slice(0, 10),
      Nombre_Colaborador: '',
      Cargo: '',
      Tipo_EPI: 'Casco de seguridad clase E',
      Cantidad: 1,
      Firma_Recibido: '',
      Observaciones: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: DotacionEPI) => {
    setEditingId(item.ID_Entrega);
    setFormData({
      Fecha_Entrega: item.Fecha_Entrega,
      Nombre_Colaborador: item.Nombre_Colaborador,
      Cargo: item.Cargo,
      Tipo_EPI: item.Tipo_EPI,
      Cantidad: item.Cantidad,
      Firma_Recibido: item.Firma_Recibido,
      Observaciones: item.Observaciones || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre_Colaborador.trim() || !formData.Cargo.trim()) {
      alert('Por favor ingrese el nombre y cargo del colaborador.');
      return;
    }

    if (!formData.Firma_Recibido) {
      alert('Se requiere la firma táctil digital del colaborador para validar el cargo de entrega.');
      return;
    }

    const itemToSave: DotacionEPI = {
      ID_Entrega: editingId || generateNewId(),
      ...formData,
      Cantidad: Number(formData.Cantidad) || 1
    };

    onSave(itemToSave);
    setIsModalOpen(false);
  };

  const filteredItems = useMemo(() => {
    return dotacionEPI.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        !term ||
        item.ID_Entrega.toLowerCase().includes(term) ||
        item.Nombre_Colaborador.toLowerCase().includes(term) ||
        item.Cargo.toLowerCase().includes(term) ||
        item.Tipo_EPI.toLowerCase().includes(term) ||
        (item.Observaciones && item.Observaciones.toLowerCase().includes(term))
      );
    });
  }, [dotacionEPI, searchTerm]);

  const exportCSV = () => {
    const headers = [
      'ID_Entrega',
      'Fecha_Entrega',
      'Nombre_Colaborador',
      'Cargo',
      'Tipo_EPI',
      'Cantidad',
      'Firma_Registrada',
      'Observaciones'
    ];
    const rows = filteredItems.map((e) => [
      `"${e.ID_Entrega}"`,
      `"${e.Fecha_Entrega}"`,
      `"${e.Nombre_Colaborador}"`,
      `"${e.Cargo}"`,
      `"${e.Tipo_EPI}"`,
      `"${e.Cantidad}"`,
      `"${e.Firma_Recibido ? 'SÍ (DIGITAL)' : 'NO'}"`,
      `"${(e.Observaciones || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dotacion_epi_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span>Tabla 4</span>
            <span aria-hidden="true">·</span>
            <span>Equipos de Protección Individual (EPI / EEPP)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{dotacionEPI.length} actas de entrega</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dotación de EPI y Conformidad Táctil
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro legal de entrega de equipos de protección con firma digital en pantalla táctil o stylus.
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
            <Plus className="w-4 h-4 text-emerald-400" />
            Nueva Entrega con Firma
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por colaborador, cargo, tipo de EPI o código..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">ID Entrega</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Nombre del Colaborador</th>
                <th className="py-3 px-4">Cargo / Puesto</th>
                <th className="py-3 px-4">Tipo de EPI Suministrado</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4">Firma Recibido (Táctil)</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">No se encontraron registros de entrega</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Registre una nueva entrega con firma táctil desde el botón superior.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.ID_Entrega} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {item.ID_Entrega}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      {item.Fecha_Entrega}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {item.Nombre_Colaborador}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {item.Cargo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{item.Tipo_EPI}</div>
                      {item.Observaciones && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {item.Observaciones}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {item.Cantidad} unid.
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.Firma_Recibido ? (
                        <button
                          onClick={() => setViewingItem(item)}
                          className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
                        >
                          <div className="bg-white border border-slate-200 rounded p-1 shadow-2xs">
                            <img
                              src={item.Firma_Recibido}
                              alt="Firma"
                              className="h-6 w-16 object-contain"
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <PenTool className="w-3 h-3 text-emerald-600" />
                            Firmado
                          </span>
                        </button>
                      ) : (
                        <span className="text-rose-600 text-[11px] font-semibold">Pendiente</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setViewingItem(item)}
                          title="Ver cargo oficial y firma"
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
                            if (confirm(`¿Eliminar la entrega de EPI ${item.ID_Entrega}?`)) {
                              onDelete(item.ID_Entrega);
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

      {/* MODAL: Nueva / Editar Entrega de EPI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? `Editar Entrega ${editingId}` : 'Registrar Dotación de EPI con Firma Táctil'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  El colaborador debe estampar su firma digital en la pantalla como conformidad de recepción.
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
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.Fecha_Entrega}
                    onChange={(e) => setFormData({ ...formData, Fecha_Entrega: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Colaborador
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Nombre_Colaborador}
                    onChange={(e) => setFormData({ ...formData, Nombre_Colaborador: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    placeholder="Ej: Raúl Medina Paredes"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo / Puesto de Trabajo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Cargo}
                    onChange={(e) => setFormData({ ...formData, Cargo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    placeholder="Ej: Técnico Soldador, Mecánico, Operario"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cantidad Entregada
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.Cantidad}
                    onChange={(e) => setFormData({ ...formData, Cantidad: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de EPI (Equipo de Protección Individual)
                </label>
                <div className="space-y-2">
                  <select
                    value={tiposEPIComunes.includes(formData.Tipo_EPI) ? formData.Tipo_EPI : 'Otro'}
                    onChange={(e) => {
                      if (e.target.value !== 'Otro') {
                        setFormData({ ...formData, Tipo_EPI: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    {tiposEPIComunes.map((epi) => (
                      <option key={epi} value={epi}>
                        {epi}
                      </option>
                    ))}
                    <option value="Otro">Otro equipo especializado...</option>
                  </select>

                  <input
                    type="text"
                    value={formData.Tipo_EPI}
                    onChange={(e) => setFormData({ ...formData, Tipo_EPI: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                    placeholder="Especifique marca, modelo o especificación si es diferente..."
                  />
                </div>
              </div>

              {/* Pad de firma digital táctil */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <SignaturePad
                  initialValue={formData.Firma_Recibido}
                  onSave={(signatureDataUrl) => {
                    setFormData({ ...formData, Firma_Recibido: signatureDataUrl });
                  }}
                />
                {formData.Firma_Recibido && (
                  <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Firma registrada en memoria con éxito.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones / Motivo de Entrega
                </label>
                <input
                  type="text"
                  value={formData.Observaciones}
                  onChange={(e) => setFormData({ ...formData, Observaciones: e.target.value })}
                  placeholder="Ej: Dotación inicial, reposición por desgaste natural..."
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
                  {editingId ? 'Guardar Cambios' : 'Registrar Entrega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Visualización de Acta de Entrega con Firma Oficial */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-bold text-slate-900">{viewingItem.ID_Entrega}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{viewingItem.Fecha_Entrega}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Cargo de Entrega de EPI
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Colaborador:</span>
                <span className="font-bold text-slate-900">{viewingItem.Nombre_Colaborador}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Cargo / Área:</span>
                <span className="font-medium text-slate-800">{viewingItem.Cargo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Equipo Suministrado:</span>
                <span className="font-semibold text-slate-900">{viewingItem.Tipo_EPI}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Cantidad:</span>
                <span className="font-mono font-bold text-slate-900">{viewingItem.Cantidad} unidades</span>
              </div>
              {viewingItem.Observaciones && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Observaciones:</span>
                  <span className="text-slate-700">{viewingItem.Observaciones}</span>
                </div>
              )}
            </div>

            {/* Firma Stamp */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white text-center">
              <span className="text-[11px] text-slate-400 block mb-1">
                Firma Digital de Conformidad (Capturada en pantalla táctil)
              </span>
              {viewingItem.Firma_Recibido ? (
                <div className="bg-slate-50/50 rounded p-2 flex justify-center">
                  <img
                    src={viewingItem.Firma_Recibido}
                    alt="Firma del colaborador"
                    className="max-h-24 object-contain"
                  />
                </div>
              ) : (
                <span className="text-rose-600 text-xs font-semibold">Sin firma registrada</span>
              )}
              <div className="border-t border-slate-200 mt-2 pt-1 text-[11px] text-slate-600 font-medium">
                {viewingItem.Nombre_Colaborador} · D.N.I. / R.U.T. Conforme
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                Imprimir Cargo
              </button>
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
