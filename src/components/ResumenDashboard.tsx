import React from 'react';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Flame, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  MapPin,
  Gauge,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  InspeccionSeguridad, 
  RegistroAccidente, 
  InspeccionExtintores, 
  DotacionEPI, 
  InformeSST,
  ActiveTab 
} from '../types/ehs';

interface ResumenDashboardProps {
  inspecciones: InspeccionSeguridad[];
  accidentes: RegistroAccidente[];
  extintores: InspeccionExtintores[];
  dotacionEPI: DotacionEPI[];
  informes: InformeSST[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenQuickSearch: () => void;
}

export const ResumenDashboard: React.FC<ResumenDashboardProps> = ({
  inspecciones,
  accidentes,
  extintores,
  dotacionEPI,
  informes,
  onNavigate,
  onOpenQuickSearch
}) => {
  // Calculations
  const totalInspecciones = inspecciones.length;
  const inspeccionesCumplen = inspecciones.filter((i) => i.Estado === 'Cumple').length;
  const porcentajeCumplimiento = totalInspecciones > 0
    ? Math.round((inspeccionesCumplen / totalInspecciones) * 100)
    : 100;

  const totalDiasPerdidos = accidentes.reduce((sum, a) => sum + (Number(a.Dias_Perdidos) || 0), 0);
  const accidentesGraves = accidentes.filter((a) => a.Gravedad === 'Grave' || a.Gravedad === 'Mortal').length;

  const extintoresMantenimiento = extintores.filter((e) => e.Estado_General === 'Requiere Mantenimiento').length;
  const today = new Date().toISOString().slice(0, 10);
  const extintoresVencidos = extintores.filter((e) => e.Proxima_Recarga < today).length;
  const extintoresPresionAnomala = extintores.filter((e) => (e.Presion_PSI || 0) < 100 || (e.Presion_PSI || 0) > 195).length;

  const inspeccionesNoConformes = inspecciones.filter((i) => i.Estado === 'No Cumple');

  return (
    <div className="space-y-8">
      {/* Dynamic & Colorful Hero Banner */}
      <div className="p-6 md:p-8 bg-linear-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 -bottom-10 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SISTEMA DE GESTIÓN DE HSL AVÍCOLA · GRANJAS & BENEFICIO</span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Gestión de HSL Avícola: Higiene, Seguridad & Ambiente
          </h1>

          <p className="text-xs md:text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
            Control de bioseguridad, frío y amoníaco en granjas y faena, fotos de inspección en terreno, <strong>ubicación específica en planta</strong>, manómetros de presión en PSI, <strong>códigos QR dinámicos autogenerados</strong> para extintores y <strong>gráficos estadísticos con análisis automático</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('informes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-98 cursor-pointer"
            >
              <span>📸 Tomar Fotos & Informe IA</span>
            </button>
            <button
              onClick={() => onNavigate('graficos')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-98"
            >
              <span>Ver Gráficos & Análisis</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
            </button>
            <button
              onClick={onOpenQuickSearch}
              className="inline-flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/10"
            >
              <span>Buscador Rápido</span>
              <kbd className="px-1.5 py-0.5 bg-amber-950/40 text-amber-100 text-[10px] rounded font-mono font-bold">Ctrl+K</kbd>
            </button>
            <button
              onClick={() => onNavigate('inspecciones')}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors backdrop-blur-xs border border-white/10"
            >
              <span>Inspecciones</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
            <button
              onClick={() => onNavigate('extintores')}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-600/30 hover:bg-red-600/40 text-red-200 font-bold text-xs rounded-xl transition-colors border border-red-500/30"
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Extintores & QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars KPI Cards with vibrant accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Inspecciones */}
        <div 
          onClick={() => onNavigate('inspecciones')}
          className="p-5 bg-white border-2 border-amber-200/80 rounded-2xl hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer shadow-xs group bg-linear-to-b from-amber-50/30 to-white"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-amber-900">1. Inspecciones de Seguridad</div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-2xs">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tabular-nums">
            {porcentajeCumplimiento}%
          </div>
          <div className="text-xs text-amber-800 font-bold mt-1">
            Conformidad en Campo
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between font-medium">
            <span>{totalInspecciones} evaluadas</span>
            <span className={inspeccionesNoConformes.length > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
              {inspeccionesNoConformes.length} con hallazgo
            </span>
          </div>
        </div>

        {/* Card 2: Accidentes */}
        <div 
          onClick={() => onNavigate('accidentes')}
          className="p-5 bg-white border-2 border-rose-200/80 rounded-2xl hover:border-rose-400 hover:shadow-lg transition-all cursor-pointer shadow-xs group bg-linear-to-b from-rose-50/30 to-white"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-rose-900">2. Registro de Accidentes</div>
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tabular-nums">
            {totalDiasPerdidos}
          </div>
          <div className="text-xs text-rose-800 font-bold mt-1">
            Días de Incapacidad Médica
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between font-medium">
            <span>{accidentes.length} eventos</span>
            <span className={accidentesGraves > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
              {accidentesGraves} graves/mortales
            </span>
          </div>
        </div>

        {/* Card 3: Extintores */}
        <div 
          onClick={() => onNavigate('extintores')}
          className="p-5 bg-white border-2 border-red-200/80 rounded-2xl hover:border-red-400 hover:shadow-lg transition-all cursor-pointer shadow-xs group bg-linear-to-b from-red-50/30 to-white"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-red-900">3. Control de Extintores & PSI</div>
            <div className="p-2.5 rounded-xl bg-red-100 text-red-700 group-hover:bg-red-600 group-hover:text-white transition-colors shadow-2xs">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tabular-nums">
            {extintores.filter((e) => e.Estado_General === 'Aprobado').length}/{extintores.length}
          </div>
          <div className="text-xs text-red-800 font-bold mt-1 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5" />
            <span>Presión & Operatividad</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between font-medium">
            <span className="text-red-700 font-bold">{extintoresMantenimiento} mantención</span>
            <span className={extintoresPresionAnomala > 0 ? 'text-amber-800 font-bold' : 'text-emerald-700 font-bold'}>
              {extintoresPresionAnomala} presión fuera
            </span>
          </div>
        </div>

        {/* Card 4: Dotación EPI & Informes */}
        <div 
          onClick={() => onNavigate('dotacion_epi')}
          className="p-5 bg-white border-2 border-emerald-200/80 rounded-2xl hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer shadow-xs group bg-linear-to-b from-emerald-50/30 to-white"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-emerald-900">4. Dotación EPI & Informes</div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono tabular-nums">
            {dotacionEPI.length}
          </div>
          <div className="text-xs text-emerald-800 font-bold mt-1">
            Actas con Firma Táctil
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between font-medium">
            <span className="text-emerald-700 font-bold">100% firmado</span>
            <span className="text-sky-700 font-bold">{informes.length} informes subidos</span>
          </div>
        </div>
      </div>

      {/* Attention & Action Blocks with Locations & Extinguisher Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hallazgos Pendientes de Inspección con UBICACIÓN DESTACADA */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Hallazgos No Conformes con Ubicación en Planta
              </h3>
              <p className="text-xs text-slate-500">
                Condiciones subestándar registradas con geolocalización de área.
              </p>
            </div>
            <button
              onClick={() => onNavigate('inspecciones')}
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {inspeccionesNoConformes.length === 0 ? (
              <div className="py-6 text-center text-xs text-emerald-700 flex items-center justify-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ¡Excelente! Todas las inspecciones actuales se encuentran conformes.
              </div>
            ) : (
              inspeccionesNoConformes.slice(0, 3).map((item) => (
                <div key={item.ID_Inspeccion} className="py-3 flex items-start gap-3">
                  {item.Foto_Evidencia ? (
                    <img
                      src={item.Foto_Evidencia}
                      alt="Evidencia"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-amber-300 shrink-0 mt-0.5 shadow-2xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-mono font-extrabold text-slate-900">{item.ID_Inspeccion}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700">{item.Area_Sede}</span>
                    </div>

                    {/* Dónde se encuentra ubicado */}
                    <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mt-0.5 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                      <MapPin className="w-3 h-3 text-amber-600 inline" />
                      <span>{item.Ubicacion_Detallada || item.Area_Sede}</span>
                    </div>

                    <div className="text-xs font-extrabold text-slate-900 truncate mt-1">
                      {item.Aspecto_Evaluado}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {item.Hallazgo_Descripcion}
                    </p>
                    <div className="text-[11px] text-rose-700 font-bold mt-1">
                      Acción: {item.Accion_Correctiva} (Resp: {item.Responsable})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alertas de Presión de Extintores */}
        <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-red-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" />
                Alertas de Presión Manométrica & Mantenimiento
              </h3>
              <p className="text-xs text-slate-500">
                Extintores con anomalía de presión (PSI) o manguera/precinto dañado.
              </p>
            </div>
            <button
              onClick={() => onNavigate('extintores')}
              className="text-xs font-bold text-red-800 hover:underline flex items-center gap-1"
            >
              <span>Ver extintores</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {extintores.filter((e) => e.Estado_General === 'Requiere Mantenimiento').map((ext) => {
              const psi = ext.Presion_PSI || 150;
              const isNormal = psi >= 100 && psi <= 195;
              return (
                <div key={ext.ID_Revision} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-black text-slate-900">{ext.Codigo_Extintor}</span>
                      <span className="font-bold text-red-900">{ext.Tipo_Agente} ({ext.Capacidad})</span>
                      <span className="font-mono font-bold text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        {psi} PSI
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{ext.Ubicacion}</span>
                    </div>

                    <div className="text-[11px] text-red-700 font-semibold mt-1">
                      Falla detectada: {[
                        !isNormal ? `Presión (${psi} PSI)` : null,
                        ext.Manometro_Ok === 'No' ? 'Manómetro' : null,
                        ext.Manguera_Ok === 'No' ? 'Manguera' : null,
                        ext.Seguro_Presinto_Ok === 'No' ? 'Precinto' : null
                      ].filter(Boolean).join(', ') || 'Recarga vencida'}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('extintores')}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg whitespace-nowrap shadow-xs"
                  >
                    Ver Manómetro
                  </button>
                </div>
              );
            })}

            {/* Documentos Recientes */}
            {informes.slice(0, 1).map((inf) => (
              <div key={inf.ID_Informe} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">{inf.ID_Informe}</span>
                    <span className="font-bold text-sky-800">{inf.Tipo_Informe}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 line-clamp-1 mt-0.5">
                    {inf.Titulo}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    {inf.Nombre_Archivo} · {inf.Fecha}
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('informes')}
                  className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-100 hover:bg-sky-200 rounded-lg whitespace-nowrap"
                >
                  Abrir Informe
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
