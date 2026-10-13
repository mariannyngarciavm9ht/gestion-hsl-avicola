import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  ClipboardCheck, 
  AlertTriangle, 
  Flame, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  Gauge,
  MapPin
} from 'lucide-react';
import {
  InspeccionSeguridad,
  RegistroAccidente,
  InspeccionExtintores,
  DotacionEPI,
  InformeSST,
  ActiveTab
} from '../types/ehs';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspecciones: InspeccionSeguridad[];
  accidentes: RegistroAccidente[];
  extintores: InspeccionExtintores[];
  dotacionEPI: DotacionEPI[];
  informes: InformeSST[];
  onSelectResult: (tab: ActiveTab, recordId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  inspecciones,
  accidentes,
  extintores,
  dotacionEPI,
  informes,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | ActiveTab>('all');

  const cleanQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!cleanQuery) return [];

    const matches: Array<{
      tab: ActiveTab;
      id: string;
      title: string;
      subtitle: string;
      categoryName: string;
      badgeText: string;
      badgeType: 'emerald' | 'amber' | 'rose' | 'slate' | 'red';
      locationTag?: string;
      extraInfo?: string;
      rawItem: any;
    }> = [];

    // Search Inspecciones (including Ubicacion_Detallada)
    inspecciones.forEach((item) => {
      const text = `${item.ID_Inspeccion} ${item.Inspector} ${item.Area_Sede} ${item.Ubicacion_Detallada || ''} ${item.Aspecto_Evaluado} ${item.Estado} ${item.Hallazgo_Descripcion} ${item.Accion_Correctiva} ${item.Responsable}`.toLowerCase();
      if (text.includes(cleanQuery)) {
        matches.push({
          tab: 'inspecciones',
          id: item.ID_Inspeccion,
          title: `${item.ID_Inspeccion} · ${item.Aspecto_Evaluado}`,
          subtitle: `${item.Area_Sede} — Inspector: ${item.Inspector} (${item.Fecha_Hora})`,
          locationTag: item.Ubicacion_Detallada || item.Area_Sede,
          categoryName: 'Inspecciones de Seguridad',
          badgeText: item.Estado,
          badgeType: item.Estado === 'Cumple' ? 'emerald' : item.Estado === 'No Cumple' ? 'rose' : 'slate',
          rawItem: item
        });
      }
    });

    // Search Accidentes
    accidentes.forEach((item) => {
      const text = `${item.ID_Accidente} ${item.Fecha_Incidente} ${item.Nombre_Afectado} ${item.Area} ${item.Tipo_Evento} ${item.Gravedad} ${item.Descripcion_Hechos} ${item.Parte_Cuerpo || ''}`.toLowerCase();
      if (text.includes(cleanQuery)) {
        matches.push({
          tab: 'accidentes',
          id: item.ID_Accidente,
          title: `${item.ID_Accidente} · ${item.Nombre_Afectado}`,
          subtitle: `${item.Tipo_Evento} en ${item.Area} · ${item.Dias_Perdidos} días perdidos`,
          locationTag: item.Area,
          categoryName: 'Registro de Accidentes',
          badgeText: item.Gravedad,
          badgeType: item.Gravedad === 'Leve' ? 'amber' : 'rose',
          rawItem: item
        });
      }
    });

    // Search Extintores (including Presion_PSI and Ubicacion)
    extintores.forEach((item) => {
      const text = `${item.ID_Revision} ${item.Codigo_Extintor} ${item.Ubicacion} ${item.Tipo_Agente} ${item.Capacidad} ${item.Presion_PSI || ''} ${item.Estado_General} ${item.Observaciones || ''}`.toLowerCase();
      if (text.includes(cleanQuery)) {
        matches.push({
          tab: 'extintores',
          id: item.ID_Revision,
          title: `${item.Codigo_Extintor} · ${item.Tipo_Agente} (${item.Capacidad})`,
          subtitle: `Ubicación: ${item.Ubicacion} · Próxima Recarga: ${item.Proxima_Recarga}`,
          locationTag: item.Ubicacion,
          extraInfo: `${item.Presion_PSI || 150} PSI`,
          categoryName: 'Inspección de Extintores',
          badgeText: item.Estado_General,
          badgeType: item.Estado_General === 'Aprobado' ? 'emerald' : 'red',
          rawItem: item
        });
      }
    });

    // Search Dotacion EPI
    dotacionEPI.forEach((item) => {
      const text = `${item.ID_Entrega} ${item.Fecha_Entrega} ${item.Nombre_Colaborador} ${item.Cargo} ${item.Tipo_EPI} ${item.Observaciones || ''}`.toLowerCase();
      if (text.includes(cleanQuery)) {
        matches.push({
          tab: 'dotacion_epi',
          id: item.ID_Entrega,
          title: `${item.ID_Entrega} · ${item.Nombre_Colaborador} (${item.Cargo})`,
          subtitle: `EPI: ${item.Tipo_EPI} · Cantidad: ${item.Cantidad} · Fecha: ${item.Fecha_Entrega}`,
          categoryName: 'Dotación de EPI',
          badgeText: 'Firma Táctil Conforme',
          badgeType: 'emerald',
          rawItem: item
        });
      }
    });

    // Search Informes
    informes.forEach((item) => {
      const text = `${item.ID_Informe} ${item.Titulo} ${item.Tipo_Informe} ${item.Autor} ${item.Area_Sede} ${item.Resumen_Alcance} ${item.Nombre_Archivo}`.toLowerCase();
      if (text.includes(cleanQuery)) {
        matches.push({
          tab: 'informes',
          id: item.ID_Informe,
          title: `${item.ID_Informe} · ${item.Titulo}`,
          subtitle: `${item.Tipo_Informe} · ${item.Autor} (${item.Fecha}) · ${item.Nombre_Archivo}`,
          locationTag: item.Area_Sede,
          categoryName: 'Informes Técnicos',
          badgeText: item.Estado,
          badgeType: item.Estado === 'Vigente' ? 'emerald' : item.Estado === 'En Revisión' ? 'amber' : 'slate',
          rawItem: item
        });
      }
    });

    return matches;
  }, [cleanQuery, inspecciones, accidentes, extintores, dotacionEPI, informes]);

  const filteredResults = useMemo(() => {
    if (filterCategory === 'all') return results;
    return results.filter((r) => r.tab === filterCategory);
  }, [results, filterCategory]);

  if (!isOpen) return null;

  const countByTab = {
    all: results.length,
    inspecciones: results.filter((r) => r.tab === 'inspecciones').length,
    accidentes: results.filter((r) => r.tab === 'accidentes').length,
    extintores: results.filter((r) => r.tab === 'extintores').length,
    dotacion_epi: results.filter((r) => r.tab === 'dotacion_epi').length,
    informes: results.filter((r) => r.tab === 'informes').length,
  };

  const getCategoryIcon = (tab: ActiveTab) => {
    switch (tab) {
      case 'inspecciones':
        return <ClipboardCheck className="w-4 h-4 text-amber-600" />;
      case 'accidentes':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'extintores':
        return <Flame className="w-4 h-4 text-red-600" />;
      case 'dotacion_epi':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'informes':
        return <FileText className="w-4 h-4 text-sky-600" />;
      default:
        return <Search className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 md:pt-16 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Bar with vibrant styling */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-linear-to-r from-amber-50/50 via-white to-red-50/50">
          <Search className="w-5 h-5 text-amber-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setFilterCategory('all');
              setQuery(e.target.value);
            }}
            placeholder="Buscar por código, inspector, trabajador, extintor, presión (PSI), ubicación o informe..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              title="Borrar texto"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Category Filter Tabs */}
        {cleanQuery && (
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                filterCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Todos ({countByTab.all})
            </button>
            <button
              onClick={() => setFilterCategory('inspecciones')}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                filterCategory === 'inspecciones'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Inspecciones ({countByTab.inspecciones})
            </button>
            <button
              onClick={() => setFilterCategory('extintores')}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                filterCategory === 'extintores'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Extintores ({countByTab.extintores})
            </button>
            <button
              onClick={() => setFilterCategory('accidentes')}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                filterCategory === 'accidentes'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Accidentes ({countByTab.accidentes})
            </button>
            <button
              onClick={() => setFilterCategory('dotacion_epi')}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                filterCategory === 'dotacion_epi'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Dotación EPI ({countByTab.dotacion_epi})
            </button>
            <button
              onClick={() => setFilterCategory('informes')}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                filterCategory === 'informes'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Informes ({countByTab.informes})
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
          {!cleanQuery ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-9 h-9 text-amber-400 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-bold text-slate-800">Buscador Fácil y Rápido de Higiene y Seguridad</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Escriba cualquier término para encontrar inspecciones por ubicación, extintores por presión en PSI, reportes o colaboradores.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold">
                <span className="text-slate-400 font-normal">Pruebe buscar:</span>
                <button
                  type="button"
                  onClick={() => setQuery('150 PSI')}
                  className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 border border-red-200"
                >
                  150 PSI
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('Pasillo 4')}
                  className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 border border-amber-200"
                >
                  Pasillo 4
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('EXT-TALL')}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 border border-slate-200"
                >
                  EXT-TALL
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('No Cumple')}
                  className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md hover:bg-rose-100 border border-rose-200"
                >
                  No Cumple
                </button>
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-bold text-slate-700">No se encontraron resultados para "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Verifique la ortografía o intente con términos más generales.</p>
            </div>
          ) : (
            filteredResults.map((result) => (
              <div
                key={`${result.tab}-${result.id}`}
                onClick={() => {
                  onSelectResult(result.tab, result.id);
                  onClose();
                }}
                className="py-3 px-3 hover:bg-amber-50/40 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-800 shrink-0 mt-0.5 transition-colors">
                    {getCategoryIcon(result.tab)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                      <span className="font-bold text-slate-800">{result.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">{result.id}</span>
                      {result.extraInfo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded text-[10px]">
                            {result.extraInfo}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className={`font-black ${
                        result.badgeType === 'emerald' ? 'text-emerald-700' :
                        result.badgeType === 'rose' || result.badgeType === 'red' ? 'text-rose-700' :
                        result.badgeType === 'amber' ? 'text-amber-700' :
                        'text-slate-700'
                      }`}>
                        {result.badgeText}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-900 transition-colors truncate">
                      {result.title}
                    </h4>

                    {result.locationTag && (
                      <div className="text-[11px] text-amber-900 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{result.locationTag}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {result.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 opacity-80 group-hover:opacity-100 shrink-0">
                  <span className="hidden sm:inline">Ver ficha</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span className="font-semibold text-slate-700">{filteredResults.length} resultados encontrados</span>
          <span className="text-[11px] text-slate-400">Presione ESC para cerrar</span>
        </div>
      </div>
    </div>
  );
};
