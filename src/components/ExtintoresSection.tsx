import React, { useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Gauge,
  MapPin,
  Sparkles,
  QrCode
} from 'lucide-react';
import { 
  InspeccionExtintores, 
  TipoAgenteExtintor, 
  EstadoGeneralExtintor, 
  CheckSiNo,
  EstadoPresionExtintor 
} from '../types/ehs';
import { PressureGauge } from './PressureGauge';
import { ExtintorQRModal } from './ExtintorQRModal';
import { QRScannerModal } from './QRScannerModal';

interface ExtintoresSectionProps {
  extintores: InspeccionExtintores[];
  onSave: (extintor: InspeccionExtintores) => void;
  onDelete: (id: string) => void;
  selectedIdFromSearch?: string | null;
  onClearSelectedId?: () => void;
}

export const ExtintoresSection: React.FC<ExtintoresSectionProps> = ({
  extintores,
  onSave,
  onDelete,
  selectedIdFromSearch,
  onClearSelectedId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'Todos' | EstadoGeneralExtintor>('Todos');
  const [agenteFilter, setAgenteFilter] = useState<'Todos' | TipoAgenteExtintor>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<InspeccionExtintores | null>(null);
  const [qrModalExtintor, setQrModalExtintor] = useState<InspeccionExtintores | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [formLiveQr, setFormLiveQr] = useState<string>('');

  React.useEffect(() => {
    if (selectedIdFromSearch) {
      const match = extintores.find((e) => e.ID_Revision === selectedIdFromSearch);
      if (match) {
        setViewingItem(match);
      }
      if (onClearSelectedId) onClearSelectedId();
    }
  }, [selectedIdFromSearch, extintores, onClearSelectedId]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<InspeccionExtintores, 'ID_Revision'>>({
    Codigo_Extintor: '',
    Ubicacion: '',
    Tipo_Agente: 'PQS',
    Capacidad: '20 Lbs',
    Fecha_Ultima_Recarga: new Date().toISOString().slice(0, 10),
    Proxima_Recarga: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    Manometro_Ok: 'Sí',
    Presion_PSI: 150,
    Estado_Presion: 'Normal (Zona Verde)',
    Manguera_Ok: 'Sí',
    Seguro_Presinto_Ok: 'Sí',
    Estado_General: 'Aprobado',
    Observaciones: ''
  });

  const generateNewId = () => {
    const count = extintores.length + 1;
    return `EXT-REV-${String(count).padStart(3, '0')}`;
  };

  // Generate real-time live QR code while entering or modifying extinguisher information
  React.useEffect(() => {
    if (!isModalOpen) return;

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const code = formData.Codigo_Extintor.trim() || 'EXT-PROVISIONAL';
    const deepLinkUrl = `${currentOrigin}?extintor=${encodeURIComponent(code)}`;

    const textToEncode = [
      `EXTINTOR: ${code} (ID: ${editingId || generateNewId()})`,
      `UBICACIÓN: ${formData.Ubicacion || 'En registro'}`,
      `AGENTE: ${formData.Tipo_Agente} | CAPACIDAD: ${formData.Capacidad}`,
      `PRESIÓN: ${formData.Presion_PSI || 150} PSI (${formData.Estado_Presion || 'Normal'})`,
      `MANÓMETRO: ${formData.Manometro_Ok} | MANGUERA: ${formData.Manguera_Ok} | PRECINTO: ${formData.Seguro_Presinto_Ok}`,
      `ESTADO: ${formData.Estado_General}`,
      `ÚLTIMA RECARGA: ${formData.Fecha_Ultima_Recarga}`,
      `PRÓXIMA RECARGA: ${formData.Proxima_Recarga}`,
      `ENLACE: ${deepLinkUrl}`
    ].join('\n');

    QRCode.toDataURL(textToEncode, {
      width: 200,
      margin: 1,
      color: {
        dark: '#991b1b',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setFormLiveQr(url))
      .catch((err) => console.error('Error generating live form QR:', err));
  }, [formData, isModalOpen, editingId]);

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      Codigo_Extintor: '',
      Ubicacion: '',
      Tipo_Agente: 'PQS',
      Capacidad: '20 Lbs',
      Fecha_Ultima_Recarga: new Date().toISOString().slice(0, 10),
      Proxima_Recarga: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      Manometro_Ok: 'Sí',
      Presion_PSI: 150,
      Estado_Presion: 'Normal (Zona Verde)',
      Manguera_Ok: 'Sí',
      Seguro_Presinto_Ok: 'Sí',
      Estado_General: 'Aprobado',
      Observaciones: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: InspeccionExtintores) => {
    setEditingId(item.ID_Revision);
    setFormData({
      Codigo_Extintor: item.Codigo_Extintor,
      Ubicacion: item.Ubicacion,
      Tipo_Agente: item.Tipo_Agente,
      Capacidad: item.Capacidad,
      Fecha_Ultima_Recarga: item.Fecha_Ultima_Recarga,
      Proxima_Recarga: item.Proxima_Recarga,
      Manometro_Ok: item.Manometro_Ok,
      Presion_PSI: item.Presion_PSI || 150,
      Estado_Presion: item.Estado_Presion || getPresionStatus(item.Presion_PSI || 150),
      Manguera_Ok: item.Manguera_Ok,
      Seguro_Presinto_Ok: item.Seguro_Presinto_Ok,
      Estado_General: item.Estado_General,
      Observaciones: item.Observaciones || ''
    });
    setIsModalOpen(true);
  };

  function getPresionStatus(psi: number): EstadoPresionExtintor {
    if (psi < 100) return 'Baja Presión (Descargado)';
    if (psi > 195) return 'Sobrepresión (Peligro)';
    return 'Normal (Zona Verde)';
  }

  const handlePressureChange = (newPsi: number) => {
    const status = getPresionStatus(newPsi);
    const manometroOk: CheckSiNo = status === 'Normal (Zona Verde)' ? 'Sí' : 'No';
    const allOk =
      manometroOk === 'Sí' &&
      formData.Manguera_Ok === 'Sí' &&
      formData.Seguro_Presinto_Ok === 'Sí';

    setFormData((prev) => ({
      ...prev,
      Presion_PSI: newPsi,
      Estado_Presion: status,
      Manometro_Ok: manometroOk,
      Estado_General: allOk ? 'Aprobado' : 'Requiere Mantenimiento'
    }));
  };

  const updateCheck = (key: 'Manometro_Ok' | 'Manguera_Ok' | 'Seguro_Presinto_Ok', val: CheckSiNo) => {
    const updated = { ...formData, [key]: val };
    const allOk =
      updated.Manometro_Ok === 'Sí' &&
      updated.Manguera_Ok === 'Sí' &&
      updated.Seguro_Presinto_Ok === 'Sí' &&
      updated.Presion_PSI >= 100 &&
      updated.Presion_PSI <= 195;

    setFormData({
      ...updated,
      Estado_General: allOk ? 'Aprobado' : 'Requiere Mantenimiento'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Codigo_Extintor.trim() || !formData.Ubicacion.trim()) {
      alert('Por favor ingrese el código del extintor y su ubicación física.');
      return;
    }

    const itemToSave: InspeccionExtintores = {
      ID_Revision: editingId || generateNewId(),
      ...formData
    };

    onSave(itemToSave);
    setIsModalOpen(false);
  };

  const filteredItems = useMemo(() => {
    return extintores.filter((item) => {
      const matchEstado = estadoFilter === 'Todos' || item.Estado_General === estadoFilter;
      const matchAgente = agenteFilter === 'Todos' || item.Tipo_Agente === agenteFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        item.ID_Revision.toLowerCase().includes(term) ||
        item.Codigo_Extintor.toLowerCase().includes(term) ||
        item.Ubicacion.toLowerCase().includes(term) ||
        item.Tipo_Agente.toLowerCase().includes(term) ||
        String(item.Presion_PSI).includes(term) ||
        (item.Observaciones && item.Observaciones.toLowerCase().includes(term));

      return matchEstado && matchAgente && matchSearch;
    });
  }, [extintores, searchTerm, estadoFilter, agenteFilter]);

  const stats = useMemo(() => {
    const total = extintores.length;
    const aprobados = extintores.filter((e) => e.Estado_General === 'Aprobado').length;
    const mantenimiento = extintores.filter((e) => e.Estado_General === 'Requiere Mantenimiento').length;
    const today = new Date().toISOString().slice(0, 10);
    const vencidos = extintores.filter((e) => e.Proxima_Recarga < today).length;
    const presionAnomala = extintores.filter((e) => (e.Presion_PSI || 0) < 100 || (e.Presion_PSI || 0) > 195).length;
    return { total, aprobados, mantenimiento, vencidos, presionAnomala };
  }, [extintores]);

  const exportCSV = () => {
    const headers = [
      'ID_Revision',
      'Codigo_Extintor',
      'Ubicacion',
      'Tipo_Agente',
      'Capacidad',
      'Fecha_Ultima_Recarga',
      'Proxima_Recarga',
      'Presion_PSI',
      'Estado_Presion',
      'Manometro_Ok',
      'Manguera_Ok',
      'Seguro_Presinto_Ok',
      'Estado_General',
      'Observaciones'
    ];
    const rows = filteredItems.map((e) => [
      `"${e.ID_Revision}"`,
      `"${e.Codigo_Extintor}"`,
      `"${e.Ubicacion}"`,
      `"${e.Tipo_Agente}"`,
      `"${e.Capacidad}"`,
      `"${e.Fecha_Ultima_Recarga}"`,
      `"${e.Proxima_Recarga}"`,
      `"${e.Presion_PSI || 150}"`,
      `"${e.Estado_Presion || 'Normal'}"`,
      `"${e.Manometro_Ok}"`,
      `"${e.Manguera_Ok}"`,
      `"${e.Seguro_Presinto_Ok}"`,
      `"${e.Estado_General}"`,
      `"${(e.Observaciones || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inspeccion_extintores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ubicacionesSugeridas = [
    'Taller Central · Columna A-4 · Junto a máquinas',
    'Almacén Principal · Pasillo 3 · Columna H-12',
    'Sala de Servidores TI · Nivel 1 · Frente a Racks',
    'Comedor y Cocina Industrial · Entrada de Servicios',
    'Patio de Maniobras · Caseta de Vigilancia Sur',
    'Laboratorio Químico · Puerta de Acceso Principal'
  ];

  return (
    <div className="space-y-6">
      {/* Header and Toolbar with vibrant color accents */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-red-200/80 bg-linear-to-r from-red-50/70 via-amber-50/40 to-transparent p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-700 font-semibold mb-1">
            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-bold">Tabla 3</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              Seguridad Contra Incendios y Presión Manométrica
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-red-900 font-bold">{extintores.length} extintores</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Inspección de Extintores & Manómetro de Presión
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Control de presión (PSI), ubicación específica en planta, recargas y verificación de mangueras y precintos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-900 bg-red-100/80 hover:bg-red-200/90 border border-red-300 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            title="Escanear código QR pegado en extintor con la cámara"
          >
            <QrCode className="w-3.5 h-3.5 text-red-600" />
            <span>Escanear QR</span>
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Exportar CSV
          </button>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-linear-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 rounded-lg transition-all shadow-md hover:shadow-lg whitespace-nowrap transform active:scale-98"
          >
            <Plus className="w-4 h-4 text-white" />
            Nueva Inspección
          </button>
        </div>
      </div>

      {/* Dynamic Colorful KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
        <div className="p-4 bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-slate-300">Total Extintores</div>
          <div className="text-2xl font-black text-white mt-1 font-mono tabular-nums">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            En sedes operativas
          </div>
        </div>

        <div className="p-4 bg-linear-to-br from-emerald-50 to-emerald-100/60 border border-emerald-300 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Aprobados 100%
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono tabular-nums">
            {stats.aprobados}
          </div>
          <div className="text-[10px] text-emerald-800 mt-1 font-medium">
            Listos para emergencia
          </div>
        </div>

        <div className="p-4 bg-linear-to-br from-red-50 to-rose-100/60 border border-red-300 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-red-800 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            Requieren Mantenimiento
          </div>
          <div className="text-2xl font-black text-red-700 mt-1 font-mono tabular-nums">
            {stats.mantenimiento}
          </div>
          <div className="text-[10px] text-red-800 mt-1 font-medium">
            Falla mecánica o precinto
          </div>
        </div>

        <div className="p-4 bg-linear-to-br from-amber-50 to-orange-100/60 border border-amber-300 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-amber-600" />
            Presión Anómala
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono tabular-nums">
            {stats.presionAnomala}
          </div>
          <div className="text-[10px] text-amber-900 mt-1 font-medium">
            Fuera de zona verde
          </div>
        </div>

        <div className="p-4 bg-linear-to-br from-purple-50 to-indigo-100/60 border border-purple-300 rounded-xl shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Recargas Vencidas
          </div>
          <div className="text-2xl font-black text-purple-800 mt-1 font-mono tabular-nums">
            {stats.vencidos}
          </div>
          <div className="text-[10px] text-purple-900 mt-1 font-medium">
            Superaron fecha límite
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
            placeholder="Buscar por código (EXT-01), ubicación física en planta, agente, presión (PSI)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Estado filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {(['Todos', 'Aprobado', 'Requiere Mantenimiento'] as const).map((est) => (
              <button
                key={est}
                onClick={() => setEstadoFilter(est)}
                className={`px-3 py-1 rounded-md font-semibold whitespace-nowrap transition-all ${
                  estadoFilter === est
                    ? est === 'Aprobado'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : est === 'Requiere Mantenimiento'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {est === 'Requiere Mantenimiento' ? 'Mantenimiento' : est}
              </button>
            ))}
          </div>

          {/* Agente filter */}
          <select
            value={agenteFilter}
            onChange={(e) => setAgenteFilter(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="Todos">Todos los agentes</option>
            <option value="CO2">CO2</option>
            <option value="PQS">PQS</option>
            <option value="Agua">Agua</option>
            <option value="Espuma AFFF">Espuma AFFF</option>
            <option value="Acetato de Potasio (K)">Acetato de Potasio (K)</option>
          </select>
        </div>
      </div>

      {/* Table with rich interactive elements */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-linear-to-r from-slate-100 via-red-50/40 to-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3.5 px-4">Código / ID</th>
                <th className="py-3.5 px-4">Ubicación Física en Planta</th>
                <th className="py-3.5 px-4">Agente & Capacidad</th>
                <th className="py-3.5 px-4">Presión Manométrica</th>
                <th className="py-3.5 px-4 text-center">Manómetro</th>
                <th className="py-3.5 px-4 text-center">Manguera</th>
                <th className="py-3.5 px-4 text-center">Precinto</th>
                <th className="py-3.5 px-4">Vencimiento Recarga</th>
                <th className="py-3.5 px-4">Estado General</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Flame className="w-8 h-8 text-red-300 mx-auto mb-2 animate-bounce" />
                    <p className="text-sm font-semibold text-slate-700">No se encontraron extintores</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pruebe cambiando los filtros o registre un nuevo extintor con el botón superior.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const psi = item.Presion_PSI || 150;
                  const isNormal = psi >= 100 && psi <= 195;
                  const isLow = psi < 100;
                  const isExpired = item.Proxima_Recarga < new Date().toISOString().slice(0, 10);

                  return (
                    <tr 
                      key={item.ID_Revision} 
                      className={`hover:bg-amber-50/40 transition-colors ${
                        item.Estado_General === 'Requiere Mantenimiento' ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-extrabold text-slate-900 font-mono text-xs flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                              {item.Codigo_Extintor}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono tabular-nums pl-3.5">
                              {item.ID_Revision}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setQrModalExtintor(item)}
                            title="Ver / Imprimir Código QR"
                            className="p-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{item.Ubicacion}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-red-950 bg-red-100/70 px-2 py-0.5 rounded text-[11px]">
                          {item.Tipo_Agente}
                        </span>
                        <span className="text-slate-500 ml-1.5 font-medium">{item.Capacidad}</span>
                      </td>

                      {/* Pressure PSI with visual meter */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs border flex items-center gap-1.5 shadow-2xs ${
                              isNormal
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : isLow
                                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                : 'bg-red-50 text-red-800 border-red-300 animate-pulse'
                            }`}
                          >
                            <Gauge className="w-3.5 h-3.5" />
                            <span>{psi} PSI</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 hidden md:inline">
                            {isNormal ? 'Zona Verde' : isLow ? 'Baja Presión' : 'Sobrepresión'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            const newCheck: CheckSiNo = item.Manometro_Ok === 'Sí' ? 'No' : 'Sí';
                            const allOk = newCheck === 'Sí' && item.Manguera_Ok === 'Sí' && item.Seguro_Presinto_Ok === 'Sí' && isNormal;
                            onSave({
                              ...item,
                              Manometro_Ok: newCheck,
                              Estado_General: allOk ? 'Aprobado' : 'Requiere Mantenimiento'
                            });
                          }}
                          title="Clic para cambiar estado de manómetro"
                          className={`font-bold px-2 py-0.5 rounded text-xs transition-colors ${
                            item.Manometro_Ok === 'Sí' 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {item.Manometro_Ok}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            const newCheck: CheckSiNo = item.Manguera_Ok === 'Sí' ? 'No' : 'Sí';
                            const allOk = item.Manometro_Ok === 'Sí' && newCheck === 'Sí' && item.Seguro_Presinto_Ok === 'Sí' && isNormal;
                            onSave({
                              ...item,
                              Manguera_Ok: newCheck,
                              Estado_General: allOk ? 'Aprobado' : 'Requiere Mantenimiento'
                            });
                          }}
                          title="Clic para cambiar estado de manguera"
                          className={`font-bold px-2 py-0.5 rounded text-xs transition-colors ${
                            item.Manguera_Ok === 'Sí' 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {item.Manguera_Ok}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            const newCheck: CheckSiNo = item.Seguro_Presinto_Ok === 'Sí' ? 'No' : 'Sí';
                            const allOk = item.Manometro_Ok === 'Sí' && item.Manguera_Ok === 'Sí' && newCheck === 'Sí' && isNormal;
                            onSave({
                              ...item,
                              Seguro_Presinto_Ok: newCheck,
                              Estado_General: allOk ? 'Aprobado' : 'Requiere Mantenimiento'
                            });
                          }}
                          title="Clic para cambiar estado de precinto"
                          className={`font-bold px-2 py-0.5 rounded text-xs transition-colors ${
                            item.Seguro_Presinto_Ok === 'Sí' 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {item.Seguro_Presinto_Ok}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap">
                        <span className={`font-semibold ${isExpired ? 'text-red-700 font-bold' : 'text-slate-800'}`}>
                          {item.Proxima_Recarga}
                        </span>
                        {isExpired && (
                          <span className="block text-[10px] text-red-600 font-sans font-bold animate-pulse">
                            ¡Vencido!
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border shadow-2xs inline-flex items-center gap-1 ${
                          item.Estado_General === 'Aprobado'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {item.Estado_General === 'Aprobado' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                          )}
                          <span>{item.Estado_General}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setQrModalExtintor(item)}
                            title="Generar e imprimir Código QR dinámico"
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewingItem(item)}
                            title="Ver manómetro grande y ficha"
                            className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                              if (confirm(`¿Eliminar la revisión ${item.ID_Revision} del extintor ${item.Codigo_Extintor}?`)) {
                                onDelete(item.ID_Revision);
                              }
                            }}
                            title="Eliminar"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* MODAL: Nueva / Editar Inspección Extintor con Manómetro y Presión */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto my-8">
            <div className="px-6 py-4 bg-linear-to-r from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-yellow-300" />
                  {editingId ? `Editar Revisión ${editingId}` : 'Registrar Inspección de Extintor'}
                </h3>
                <p className="text-xs text-red-100 mt-0.5">
                  Medición de presión manométrica (PSI) y localización en planta.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código Identificador del Extintor
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Codigo_Extintor}
                    onChange={(e) => setFormData({ ...formData, Codigo_Extintor: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono font-bold text-slate-900"
                    placeholder="Ej: EXT-TALL-01 o EXT-04"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    Dónde se encuentra ubicado (Ubicación física en planta)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Ubicacion}
                    onChange={(e) => setFormData({ ...formData, Ubicacion: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: Taller Mecánico · Columna A-4 · Junto al torno"
                  />
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                    <span className="text-slate-400">Sugeridos:</span>
                    {ubicacionesSugeridas.slice(0, 3).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setFormData({ ...formData, Ubicacion: sug })}
                        className="text-red-700 hover:underline"
                      >
                        {sug.split('·')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Agente Extintor
                  </label>
                  <select
                    value={formData.Tipo_Agente}
                    onChange={(e) => setFormData({ ...formData, Tipo_Agente: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white font-semibold text-slate-800"
                  >
                    <option value="PQS">PQS (Polvo Químico Seco ABC)</option>
                    <option value="CO2">CO2 (Dióxido de Carbono BC)</option>
                    <option value="Agua">Agua Presurizada (Clase A)</option>
                    <option value="Espuma AFFF">Espuma AFFF (Clase AB)</option>
                    <option value="Acetato de Potasio (K)">Acetato de Potasio (Clase K - Cocinas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Capacidad Nominal
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Capacidad}
                    onChange={(e) => setFormData({ ...formData, Capacidad: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: 20 Lbs, 10 Lbs, 6 Litros"
                  />
                </div>
              </div>

              {/* Pressure PSI Interactive Gauge Box */}
              <div className="p-4 bg-linear-to-b from-amber-50/50 to-red-50/40 rounded-xl border-2 border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-950">
                    <Gauge className="w-4 h-4 text-red-600" />
                    <span>Lectura y Medición de Presión en Manómetro (PSI)</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-700">
                    {formData.Presion_PSI || 150} PSI
                  </span>
                </div>

                <PressureGauge
                  psi={formData.Presion_PSI || 150}
                  interactive={true}
                  onChange={handlePressureChange}
                  size="md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de Última Recarga
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.Fecha_Ultima_Recarga}
                    onChange={(e) => setFormData({ ...formData, Fecha_Ultima_Recarga: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha Límite Próxima Recarga
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.Proxima_Recarga}
                    onChange={(e) => setFormData({ ...formData, Proxima_Recarga: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Elementos Críticos Checks */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="block text-xs font-bold text-slate-800">
                  Verificación de Elementos Físicos de Seguridad:
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Manómetro Operativo</span>
                    <div className="flex gap-1">
                      {(['Sí', 'No'] as const).map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => updateCheck('Manometro_Ok', v)}
                          className={`flex-1 py-1 text-xs font-bold rounded ${
                            formData.Manometro_Ok === v
                              ? v === 'Sí'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Manguera Sin Daño</span>
                    <div className="flex gap-1">
                      {(['Sí', 'No'] as const).map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => updateCheck('Manguera_Ok', v)}
                          className={`flex-1 py-1 text-xs font-bold rounded ${
                            formData.Manguera_Ok === v
                              ? v === 'Sí'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Seguro y Precinto</span>
                    <div className="flex gap-1">
                      {(['Sí', 'No'] as const).map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => updateCheck('Seguro_Presinto_Ok', v)}
                          className={`flex-1 py-1 text-xs font-bold rounded ${
                            formData.Seguro_Presinto_Ok === v
                              ? v === 'Sí'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-700 font-bold">Diagnóstico General del Extintor:</span>
                  <div className="flex items-center gap-2">
                    {(['Aprobado', 'Requiere Mantenimiento'] as const).map((est) => (
                      <button
                        type="button"
                        key={est}
                        onClick={() => setFormData({ ...formData, Estado_General: est })}
                        className={`px-3.5 py-1 text-xs font-extrabold rounded-lg transition-all ${
                          formData.Estado_General === est
                            ? est === 'Aprobado'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-red-600 text-white shadow-sm'
                            : 'bg-white border border-slate-300 text-slate-600'
                        }`}
                      >
                        {est}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones Técnicas Adicionales
                </label>
                <textarea
                  rows={2}
                  value={formData.Observaciones}
                  onChange={(e) => setFormData({ ...formData, Observaciones: e.target.value })}
                  placeholder="Señalética fotoluminiscente a 1.80m, tarjeta de inspección al día, soporte mural..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* DYNAMIC REAL-TIME QR CODE GENERATOR SECTION */}
              <div className="p-4 bg-linear-to-r from-red-50/80 via-orange-50/50 to-amber-50/70 rounded-2xl border-2 border-red-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>Código QR Dinámico del Extintor</span>
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          En Vivo
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Al ingresar o modificar los datos (presión, ubicación, recargas), la información se actualiza automáticamente en el mismo código QR.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-red-200">
                  <div className="shrink-0 bg-white p-2.5 rounded-xl border-2 border-red-200 shadow-sm flex flex-col items-center">
                    {formLiveQr ? (
                      <img
                        src={formLiveQr}
                        alt="QR Extintor en Vivo"
                        className="w-28 h-28 object-contain rounded"
                      />
                    ) : (
                      <div className="w-28 h-28 flex items-center justify-center text-[10px] text-slate-400">
                        Generando QR...
                      </div>
                    )}
                    <span className="text-[10px] font-mono font-bold text-red-900 mt-1">
                      {formData.Codigo_Extintor || 'EXT-PROVISIONAL'}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 text-xs min-w-0">
                    <div className="text-[11px] space-y-1 text-slate-700 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate"><strong>Ubicación:</strong> {formData.Ubicacion || 'Pendiente de asignar'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-red-500 shrink-0" />
                        <span><strong>Presión:</strong> {formData.Presion_PSI || 150} PSI ({formData.Estado_Presion || 'Normal'})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-500 shrink-0" />
                        <span><strong>Próx. Recarga:</strong> {formData.Proxima_Recarga}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-red-500 shrink-0" />
                        <span><strong>Estado:</strong> {formData.Estado_General}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const currentObj: InspeccionExtintores = {
                            ID_Revision: editingId || generateNewId(),
                            ...formData
                          };
                          setQrModalExtintor(currentObj);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-2xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Ver Ficha y Marbete con QR</span>
                      </button>

                      {formLiveQr && (
                        <a
                          href={formLiveQr}
                          download={`QR_${formData.Codigo_Extintor || 'Extintor'}.png`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Descargar PNG</span>
                        </a>
                      )}
                    </div>
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
                  className="px-5 py-2 text-xs font-extrabold text-white bg-linear-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 rounded-lg shadow-md transition-all"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Extintor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ficha Extintor Grande con Manómetro Visual */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-bold text-slate-900">{viewingItem.ID_Revision}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-red-700">{viewingItem.Tipo_Agente} ({viewingItem.Capacidad})</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  Extintor {viewingItem.Codigo_Extintor}
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ubicación destacada */}
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <span className="text-red-900 font-bold block">Ubicación en Planta:</span>
                <span className="text-slate-800 font-medium">{viewingItem.Ubicacion}</span>
              </div>
            </div>

            {/* Manómetro Dial */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-800 mb-1">
                Estado del Manómetro y Presión
              </span>
              <PressureGauge
                psi={viewingItem.Presion_PSI || 150}
                size="md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Última Recarga:</span>
                <span className="font-mono font-medium text-slate-900">{viewingItem.Fecha_Ultima_Recarga}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Próxima Recarga:</span>
                <span className="font-mono font-bold text-slate-900">{viewingItem.Proxima_Recarga}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-2">Checklist de Elementos:</span>
              <div className="grid grid-cols-3 gap-2 text-center font-bold">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Manómetro</span>
                  <span className={viewingItem.Manometro_Ok === 'Sí' ? 'text-emerald-700' : 'text-red-700'}>
                    {viewingItem.Manometro_Ok}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Manguera</span>
                  <span className={viewingItem.Manguera_Ok === 'Sí' ? 'text-emerald-700' : 'text-red-700'}>
                    {viewingItem.Manguera_Ok}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Precinto</span>
                  <span className={viewingItem.Seguro_Presinto_Ok === 'Sí' ? 'text-emerald-700' : 'text-red-700'}>
                    {viewingItem.Seguro_Presinto_Ok}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50">
              <span className="text-xs text-slate-600 font-bold">Estado General:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                viewingItem.Estado_General === 'Aprobado' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {viewingItem.Estado_General}
              </span>
            </div>

            {viewingItem.Observaciones && (
              <div>
                <span className="text-xs text-slate-400 block mb-1">Observaciones:</span>
                <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {viewingItem.Observaciones}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setQrModalExtintor(viewingItem)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-linear-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 rounded-xl transition-all shadow-xs"
              >
                <QrCode className="w-4 h-4 text-white" />
                <span>Generar / Ver Código QR</span>
              </button>

              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Código QR Dinámico del Extintor */}
      <ExtintorQRModal
        extintor={qrModalExtintor}
        isOpen={!!qrModalExtintor}
        onClose={() => setQrModalExtintor(null)}
        onEditExtintor={(ext) => {
          setQrModalExtintor(null);
          openEditModal(ext);
        }}
      />

      {/* MODAL: Escáner de Código QR de Extintor con Cámara */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        extintores={extintores}
        onSelectExtintor={(ext) => {
          setViewingItem(ext);
        }}
      />
    </div>
  );
};
