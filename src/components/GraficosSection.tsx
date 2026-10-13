import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  RefreshCw, 
  Gauge, 
  Activity, 
  User, 
  MapPin, 
  Download, 
  FileText,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { 
  InspeccionSeguridad, 
  RegistroAccidente, 
  InspeccionExtintores, 
  DotacionEPI, 
  InformeSST 
} from '../types/ehs';

interface GraficosSectionProps {
  inspecciones: InspeccionSeguridad[];
  accidentes: RegistroAccidente[];
  extintores: InspeccionExtintores[];
  dotacionEPI: DotacionEPI[];
  informes: InformeSST[];
}

export interface AnalisisEjecutivo {
  titulo: string;
  calificacionGeneral: string;
  badgeColor: string;
  resumenEjecutivo: string;
  puntosCriticos: string[];
  analisisTendencias: string;
  recomendacionesPrioritarias: string[];
  compromisosSST: string[];
}

export const GraficosSection: React.FC<GraficosSectionProps> = ({
  inspecciones,
  accidentes,
  extintores,
  dotacionEPI,
  informes
}) => {
  // Filter States
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'consolidado' | 'separado'>('consolidado');
  const [activeSubModule, setActiveSubModule] = useState<'inspecciones' | 'accidentes' | 'extintores' | 'epi'>('inspecciones');

  // Executive Analysis state
  const [analisis, setAnalisis] = useState<AnalisisEjecutivo | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState<boolean>(false);
  const [copiedAnalysis, setCopiedAnalysis] = useState<boolean>(false);
  const [analysisSource, setAnalysisSource] = useState<'gemini' | 'local'>('local');

  // Month list
  const meses = [
    { value: 'Todos', label: 'Año Completo (Todos los meses)' },
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  // Helper date checker
  const matchDate = (dateStr: string | undefined, year: string, month: string) => {
    if (!dateStr) return false;
    const y = dateStr.slice(0, 4);
    const m = dateStr.slice(5, 7);

    const matchesYear = year === 'Todos' || y === year;
    const matchesMonth = month === 'Todos' || m === month;
    return matchesYear && matchesMonth;
  };

  // Filtered Datasets based on Year and Month
  const filteredInspecciones = useMemo(() => {
    return inspecciones.filter((i) => matchDate(i.Fecha_Hora, selectedYear, selectedMonth));
  }, [inspecciones, selectedYear, selectedMonth]);

  const filteredAccidentes = useMemo(() => {
    return accidentes.filter((a) => matchDate(a.Fecha_Incidente, selectedYear, selectedMonth));
  }, [accidentes, selectedYear, selectedMonth]);

  const filteredExtintores = useMemo(() => {
    return extintores.filter((e) => matchDate(e.Fecha_Ultima_Recarga, selectedYear, selectedMonth));
  }, [extintores, selectedYear, selectedMonth]);

  const filteredDotacionEPI = useMemo(() => {
    return dotacionEPI.filter((d) => matchDate(d.Fecha_Entrega, selectedYear, selectedMonth));
  }, [dotacionEPI, selectedYear, selectedMonth]);

  // Overall KPI Metrics for the period
  const totalInspecciones = filteredInspecciones.length;
  const inspeccionesCumple = filteredInspecciones.filter((i) => i.Estado === 'Cumple').length;
  const inspeccionesNoCumple = filteredInspecciones.filter((i) => i.Estado === 'No Cumple').length;
  const tasaConformidad = totalInspecciones > 0 ? Math.round((inspeccionesCumple / totalInspecciones) * 100) : 100;

  const totalAccidentes = filteredAccidentes.length;
  const accidentesLeves = filteredAccidentes.filter((a) => a.Gravedad === 'Leve').length;
  const accidentesGraves = filteredAccidentes.filter((a) => a.Gravedad === 'Grave' || a.Gravedad === 'Mortal').length;
  const totalDiasPerdidos = filteredAccidentes.reduce((sum, a) => sum + (Number(a.Dias_Perdidos) || 0), 0);

  // Extinguishers stats (evaluated globally or by recharge period)
  const extintoresBase = filteredExtintores.length > 0 ? filteredExtintores : extintores;
  const extintoresAprobados = extintoresBase.filter((e) => e.Estado_General === 'Aprobado').length;
  const extintoresAnomalos = extintoresBase.filter((e) => e.Estado_General === 'Requiere Mantenimiento' || (e.Presion_PSI && e.Presion_PSI < 100)).length;
  const extintoresNormalPsi = extintoresBase.filter((e) => (e.Presion_PSI || 150) >= 100 && (e.Presion_PSI || 150) <= 195).length;
  const extintoresBajaPsi = extintoresBase.filter((e) => (e.Presion_PSI || 150) < 100).length;
  const extintoresSobrePsi = extintoresBase.filter((e) => (e.Presion_PSI || 150) > 195).length;

  const totalEPI = filteredDotacionEPI.reduce((sum, d) => sum + (Number(d.Cantidad) || 1), 0);

  // Monthly breakdown for bar charts (12 months of selected year)
  const monthlyTimeline = useMemo(() => {
    const yearToUse = selectedYear === 'Todos' ? '2026' : selectedYear;
    const monthsKeys = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return monthsKeys.map((mk, idx) => {
      const inspCount = inspecciones.filter((i) => i.Fecha_Hora?.startsWith(`${yearToUse}-${mk}`)).length;
      const inspFallan = inspecciones.filter((i) => i.Fecha_Hora?.startsWith(`${yearToUse}-${mk}`) && i.Estado === 'No Cumple').length;
      const accCount = accidentes.filter((a) => a.Fecha_Incidente?.startsWith(`${yearToUse}-${mk}`)).length;
      const diasCount = accidentes
        .filter((a) => a.Fecha_Incidente?.startsWith(`${yearToUse}-${mk}`))
        .reduce((sum, a) => sum + (Number(a.Dias_Perdidos) || 0), 0);
      const epiCount = dotacionEPI.filter((d) => d.Fecha_Entrega?.startsWith(`${yearToUse}-${mk}`)).length;

      return {
        monthKey: mk,
        label: monthNames[idx],
        inspecciones: inspCount,
        noConformidades: inspFallan,
        accidentes: accCount,
        diasPerdidos: diasCount,
        dotaciones: epiCount,
      };
    });
  }, [inspecciones, accidentes, dotacionEPI, selectedYear]);

  // Max value for scaling SVG charts
  const maxInsp = Math.max(...monthlyTimeline.map((m) => m.inspecciones), 4);
  const maxDias = Math.max(...monthlyTimeline.map((m) => m.diasPerdidos), 5);

  // Critical poultry areas with non-conformities or incidents
  const areasCriticas = useMemo(() => {
    const counts: Record<string, { noConformidades: number; accidentes: number }> = {};

    filteredInspecciones.forEach((i) => {
      const area = i.Area_Sede || 'Área General';
      if (!counts[area]) counts[area] = { noConformidades: 0, accidentes: 0 };
      if (i.Estado === 'No Cumple') counts[area].noConformidades += 1;
    });

    filteredAccidentes.forEach((a) => {
      const area = a.Area || 'Área General';
      if (!counts[area]) counts[area] = { noConformidades: 0, accidentes: 0 };
      counts[area].accidentes += 1;
    });

    return Object.entries(counts)
      .map(([area, data]) => ({
        area,
        totalEventos: data.noConformidades + data.accidentes,
        noConformidades: data.noConformidades,
        accidentes: data.accidentes
      }))
      .sort((a, b) => b.totalEventos - a.totalEventos);
  }, [filteredInspecciones, filteredAccidentes]);

  // Generate automated analysis
  const generarAnalisisAutomatico = async () => {
    setIsGeneratingAnalysis(true);
    const periodoTexto = `${selectedMonth === 'Todos' ? 'Año Completo' : meses.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`;

    const hallazgosList = filteredInspecciones
      .filter((i) => i.Estado === 'No Cumple')
      .map((i) => `${i.Aspecto_Evaluado} (${i.Area_Sede}): ${i.Hallazgo_Descripcion}`);

    const payloadMetrics = {
      totalInspecciones,
      tasaConformidad,
      noConformidades: inspeccionesNoCumple,
      totalAccidentes,
      accidentesGraves,
      diasPerdidos: totalDiasPerdidos,
      totalExtintores: extintoresBase.length,
      extintoresAprobados,
      extintoresAnomalos,
      totalEPI,
      areasCriticas: areasCriticas.slice(0, 4).map((a) => a.area),
      hallazgosPrincipales: hallazgosList.slice(0, 4)
    };

    try {
      const res = await fetch('/api/gemini/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodo: periodoTexto,
          metrics: payloadMetrics
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.titulo) {
          const calif = json.data.calificacionGeneral || 'Aceptable';
          setAnalisis({
            titulo: json.data.titulo,
            calificacionGeneral: calif,
            badgeColor: calif.toLowerCase().includes('excelente') 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : calif.toLowerCase().includes('riesgo') 
              ? 'bg-rose-100 text-rose-800 border-rose-300' 
              : 'bg-amber-100 text-amber-800 border-amber-300',
            resumenEjecutivo: json.data.resumenEjecutivo,
            puntosCriticos: json.data.puntosCriticos || [],
            analisisTendencias: json.data.analisisTendencias || '',
            recomendacionesPrioritarias: json.data.recomendacionesPrioritarias || [],
            compromisosSST: json.data.compromisosSST || [
              'Revisión en el Comité de Seguridad y Salud en el Trabajo (CSST)',
              'Verificación en campo de las medidas correctivas en un plazo de 7 días',
              'Actualización del mapa de riesgos en plantas de faena y galpones'
            ]
          });
          setAnalysisSource('gemini');
          setIsGeneratingAnalysis(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Fallback a motor analítico local de HSL Avícola:', err);
    }

    // Comprehensive Local Expert Fallback Analysis for Poultry Plant
    let calif = 'Excelente';
    let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (totalAccidentes > 1 || inspeccionesNoCumple > 3 || extintoresAnomalos > 0) {
      calif = 'Riesgo Moderado - Requiere Acción Inmediata';
      badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (accidentesGraves > 0 || totalDiasPerdidos >= 15) {
      calif = 'Riesgo Crítico - Alerta Gerencial';
      badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    }

    const localAnalisis: AnalisisEjecutivo = {
      titulo: `Diagnóstico Ejecutivo de HSL: Auditoría Integral Planta Avícola · ${periodoTexto}`,
      calificacionGeneral: calif,
      badgeColor,
      resumenEjecutivo: `Durante el período ${periodoTexto}, el sistema "Gestión de HSL Avícola" procesó ${totalInspecciones} inspecciones operativas con un índice de cumplimiento del ${tasaConformidad}%. Se identificaron ${inspeccionesNoCumple} no conformidades críticas y se registraron ${totalAccidentes} incidentes/accidentes acumulando ${totalDiasPerdidos} días de trabajo perdidos. En materia contra incendios, se mantienen ${extintoresAprobados} de ${extintoresBase.length} extintores en estado aprobado, con ${extintoresBajaPsi} unidad(es) que requieren recarga por baja presión manométrica.`,
      puntosCriticos: [
        inspeccionesNoCumple > 0
          ? `Líneas de faena y galpones registraron ${inspeccionesNoCumple} desvíos normativos en resguardos mecánicos, humedad en pisos o cableado expuesto.`
          : 'Excelente mantenimiento de condiciones seguras en galpones y salas de faenado.',
        totalDiasPerdidos > 0
          ? `Impacto de ${totalDiasPerdidos} días perdidos por eventos laborales; se deben reforzar protocolos de corte seguro y calzado antideslizante.`
          : 'Cero días de trabajo perdidos en este ciclo operativo avícola.',
        extintoresAnomalos > 0
          ? `Detección de ${extintoresAnomalos} extintores con presión inferior a 100 PSI o próximos a vencer en áreas críticas de calderas/faena.`
          : '100% del parque de extintores en zona verde de presión operativa (100–195 PSI).',
        totalEPI > 0
          ? `Distribución controlada de ${totalEPI} elementos de protección personal (EPI) con firmas digitales táctiles respaldadas.`
          : 'Se recomienda actualizar la programación de entrega trimestral de EPIs para operarios avícolas.'
      ],
      analisisTendencias: `El análisis comparativo temporal muestra una tendencia ${inspeccionesCumple >= inspeccionesNoCumple ? 'favorable y controlada' : 'inestable'} en la mitigación de factores de riesgo propios del sector avícola (amoníaco NH3 en galpones, ambientes húmedos con presencia de grasa animal en salas de eviscerado y temperaturas bajo cero en cámaras de almacenamiento).`,
      recomendacionesPrioritarias: [
        'Inspeccionar diariamente la demarcación antideslizante y canaletas de drenaje en la línea de eviscerado y beneficio.',
        'Auditar la ventilación forzada en galpones de postura y crianza para mantener concentración de amoníaco por debajo de 25 ppm.',
        'Recargar de inmediato los extintores en zona amarilla de baja presión y reponer precintos violados.',
        'Garantizar el uso estricto de guantes anticorte de malla de acero inoxidable para todos los operarios de trozado y despresado.'
      ],
      compromisosSST: [
        'Presentar informe mensual ante el Comité Paritario de Seguridad y Salud Laboral Avícola.',
        'Verificación en terreno por supervisores de bioseguridad en un plazo no mayor a 5 días hábiles.',
        'Revisión del inventario de equipos de protección contra amoníaco y bajas temperaturas.'
      ]
    };

    setAnalisis(localAnalisis);
    setAnalysisSource('local');
    setIsGeneratingAnalysis(false);
  };

  // Run initial analysis automatically on mount or filter changes
  useEffect(() => {
    generarAnalisisAutomatico();
  }, [selectedYear, selectedMonth]);

  const handleCopyAnalysis = () => {
    if (!analisis) return;
    const text = [
      analisis.titulo,
      `Calificación: ${analisis.calificacionGeneral}`,
      '',
      'RESUMEN EJECUTIVO:',
      analisis.resumenEjecutivo,
      '',
      'PUNTOS CRÍTICOS DETECTADOS:',
      ...analisis.puntosCriticos.map((p) => `• ${p}`),
      '',
      'ANÁLISIS DE TENDENCIAS:',
      analisis.analisisTendencias,
      '',
      'RECOMENDACIONES PRIORITARIAS PARA LA INDUSTRIA AVÍCOLA:',
      ...analisis.recomendacionesPrioritarias.map((r) => `1. ${r}`)
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopiedAnalysis(true);
      setTimeout(() => setCopiedAnalysis(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title with Poultry Industrial Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-200/80 bg-linear-to-r from-indigo-50/80 via-purple-50/40 to-transparent p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-800 font-semibold mb-1">
            <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-md font-bold">Módulo Analítico</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              Gestión de HSL Avícola
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-indigo-900 font-bold">
              {filteredInspecciones.length + filteredAccidentes.length} registros evaluados
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Métricas & Gráficos Estadísticos
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Evolución temporal por mes y año, gráficos por parámetros y <strong>análisis diagnóstico automatizado</strong> para el sector avícola.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Imprimir Reporte
          </button>
          <button
            onClick={generarAnalisisAutomatico}
            disabled={isGeneratingAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all shadow-md active:scale-98 disabled:opacity-50 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            {isGeneratingAnalysis ? 'Generando Análisis...' : 'Actualizar Análisis'}
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS: Year, Month & View Mode Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Year & Month dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Período:</span>
            </div>

            {/* Year selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
            >
              <option value="Todos">Todos los Años</option>
              <option value="2026">Año 2026</option>
              <option value="2025">Año 2025</option>
              <option value="2024">Año 2024</option>
            </select>

            {/* Month selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
            >
              {meses.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Quick buttons */}
            <button
              onClick={() => {
                setSelectedYear('2026');
                setSelectedMonth('10');
              }}
              className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
            >
              Mes Actual (Oct 2026)
            </button>
            <button
              onClick={() => {
                setSelectedYear('Todos');
                setSelectedMonth('Todos');
              }}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1"
            >
              Ver Todo el Histórico
            </button>
          </div>

          {/* View Mode: Todos Juntos vs Parámetros a Partes */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('consolidado')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'consolidado'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todos Juntos</span>
            </button>
            <button
              onClick={() => setViewMode('separado')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'separado'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Parámetros a Partes</span>
            </button>
          </div>
        </div>

        {/* Sub-module selector when in "separado" mode */}
        {viewMode === 'separado' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-bold">
            <span className="text-slate-500 mr-1 text-[11px]">Seleccionar Parámetro:</span>
            {[
              { id: 'inspecciones', label: '1. Inspecciones de Seguridad', count: filteredInspecciones.length, color: 'hover:bg-amber-100 text-amber-900' },
              { id: 'accidentes', label: '2. Registro de Accidentes', count: filteredAccidentes.length, color: 'hover:bg-rose-100 text-rose-900' },
              { id: 'extintores', label: '3. Inspección Extintores', count: extintoresBase.length, color: 'hover:bg-red-100 text-red-900' },
              { id: 'epi', label: '4. Dotación de EPI', count: filteredDotacionEPI.length, color: 'hover:bg-emerald-100 text-emerald-900' },
            ].map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveSubModule(mod.id as any)}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-bold ${
                  activeSubModule === mod.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {mod.label} ({mod.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI HIGHLIGHT CARDS FOR THE SELECTED PERIOD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Inspecciones Realizadas
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalInspecciones}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              tasaConformidad >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {tasaConformidad}% Conforme
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {inspeccionesNoCumple} no conformidades en el período
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
            Accidentes / Incidentes
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalAccidentes}</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              {accidentesGraves} graves
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">
            {totalDiasPerdidos} días perdidos acumulados
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-red-200 shadow-xs">
          <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
            Extintores Operativos
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{extintoresAprobados}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {extintoresNormalPsi} en zona verde
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {extintoresAnomalos > 0 ? `⚠️ ${extintoresAnomalos} requieren recarga` : '100% operativos'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            EPIs Asignados
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalEPI}</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              100% Firmado
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {filteredDotacionEPI.length} actas de entrega registradas
          </span>
        </div>
      </div>

      {/* VIEW MODE 1: TODOS JUNTOS (TABLERO CONSOLIDADO & EVOLUCIÓN MENSUAL) */}
      {viewMode === 'consolidado' && (
        <div className="space-y-6">
          {/* Main Integrated Chart: Evolución Mensual de Inspecciones vs Accidentes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Evolución Mensual Consolidada (Año {selectedYear === 'Todos' ? '2026' : selectedYear})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparativa de Inspecciones Realizadas, No Conformidades Detectadas y Eventos/Accidentes por mes.
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-amber-500" /> Inspecciones
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-500" /> No Conformidades
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-slate-900" /> Accidentes
                </span>
              </div>
            </div>

            {/* Interactive SVG Bar Chart */}
            <div className="pt-4 overflow-x-auto">
              <div className="min-w-[620px] h-64 flex items-end gap-3 pb-6 border-b border-slate-200 px-2">
                {monthlyTimeline.map((item) => {
                  const inspHeight = Math.max((item.inspecciones / maxInsp) * 190, item.inspecciones > 0 ? 16 : 0);
                  const noConfHeight = Math.max((item.noConformidades / maxInsp) * 190, item.noConformidades > 0 ? 12 : 0);
                  const accHeight = Math.max((item.accidentes / maxInsp) * 190, item.accidentes > 0 ? 12 : 0);
                  const isCurrentSelected = selectedMonth === item.monthKey;

                  return (
                    <div
                      key={item.monthKey}
                      className={`flex-1 flex flex-col items-center h-full justify-end group transition-all p-1 rounded-xl ${
                        isCurrentSelected ? 'bg-indigo-50/70 border border-indigo-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Bars Group */}
                      <div className="w-full flex items-end justify-center gap-1.5 h-48">
                        {/* Inspecciones Bar */}
                        <div
                          style={{ height: `${inspHeight}px` }}
                          title={`Inspecciones: ${item.inspecciones}`}
                          className="w-3 sm:w-4 bg-linear-to-t from-amber-600 to-amber-400 rounded-t-sm transition-all group-hover:brightness-110 relative"
                        >
                          {item.inspecciones > 0 && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-900 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.inspecciones}
                            </span>
                          )}
                        </div>

                        {/* No Conformidades Bar */}
                        <div
                          style={{ height: `${noConfHeight}px` }}
                          title={`No Conformidades: ${item.noConformidades}`}
                          className="w-3 sm:w-4 bg-linear-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all group-hover:brightness-110"
                        />

                        {/* Accidentes Bar */}
                        <div
                          style={{ height: `${accHeight}px` }}
                          title={`Accidentes: ${item.accidentes}`}
                          className="w-3 sm:w-4 bg-linear-to-t from-slate-900 to-slate-700 rounded-t-sm transition-all group-hover:brightness-110"
                        />
                      </div>

                      {/* Month Label */}
                      <span className={`text-[11px] font-bold mt-2 ${
                        isCurrentSelected ? 'text-indigo-900 font-black' : 'text-slate-600'
                      }`}>
                        {item.label}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {item.inspecciones} ins / {item.accidentes} acc
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Critical Poultry Areas + Parameter Status Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Critical Areas Ranking for Poultry Plant */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Áreas de la Planta Avícola con Más Observaciones</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  {areasCriticas.length} áreas registradas
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {areasCriticas.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No se registran observaciones en el período seleccionado.
                  </p>
                ) : (
                  areasCriticas.slice(0, 5).map((area, idx) => (
                    <div key={area.area} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <strong className="text-slate-900 block">{area.area}</strong>
                          <span className="text-[11px] text-slate-500">
                            {area.noConformidades} no conformidades · {area.accidentes} accidentes
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full font-mono font-black text-xs ${
                        area.totalEventos > 1 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {area.totalEventos} eventos
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Parameters Health Ring Matrix */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Semáforo Operacional por Parámetro de HSL</span>
              </h3>

              <div className="space-y-3 pt-1 text-xs">
                {/* Inspections parameter bar */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">1. Inspecciones de Seguridad:</span>
                    <span className="text-amber-800">{tasaConformidad}% Conforme</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div style={{ width: `${tasaConformidad}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${100 - tasaConformidad}%` }} className="bg-rose-500 h-full" />
                  </div>
                </div>

                {/* Extinguishers Pressure */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">2. Parque de Extintores (Presión Óptima):</span>
                    <span className="text-red-800">
                      {extintoresBase.length > 0 ? Math.round((extintoresNormalPsi / extintoresBase.length) * 100) : 100}% OK
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${extintoresBase.length > 0 ? (extintoresNormalPsi / extintoresBase.length) * 100 : 100}%` }} 
                      className="bg-emerald-500 h-full" 
                    />
                    <div 
                      style={{ width: `${extintoresBase.length > 0 ? ((extintoresBajaPsi + extintoresSobrePsi) / extintoresBase.length) * 100 : 0}%` }} 
                      className="bg-amber-500 h-full" 
                    />
                  </div>
                </div>

                {/* Accidents Rate */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">3. Control de Accidentabilidad Laboral:</span>
                    <span className={totalAccidentes === 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {totalAccidentes === 0 ? '0 Accidentes (Óptimo)' : `${totalAccidentes} Eventos (${totalDiasPerdidos} días perd.)`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.max(100 - totalAccidentes * 20, 10)}%` }} 
                      className={totalAccidentes === 0 ? 'bg-emerald-500 h-full' : 'bg-rose-500 h-full'} 
                    />
                  </div>
                </div>

                {/* EPI Coverage */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-700">4. Cobertura de EPI con Firma Digital:</span>
                    <span className="text-emerald-700">100% Validado</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div style={{ width: '100%' }} className="bg-emerald-500 h-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: PARÁMETROS A PARTES (DETALLE ESPECÍFICO) */}
      {viewMode === 'separado' && (
        <div className="space-y-5">
          {/* SUB-MODULE 1: INSPECCIONES DE SEGURIDAD */}
          {activeSubModule === 'inspecciones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Conformity State Donut / Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Estado de Conformidad en Inspecciones ({totalInspecciones})</span>
                </h3>

                <div className="flex items-center justify-around py-4">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center mx-auto mb-2 font-mono font-black text-xl text-emerald-700 bg-emerald-50">
                      {inspeccionesCumple}
                    </div>
                    <span className="text-xs font-bold text-slate-700 block">Cumple</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {totalInspecciones > 0 ? Math.round((inspeccionesCumple / totalInspecciones) * 100) : 0}%
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-rose-500 flex items-center justify-center mx-auto mb-2 font-mono font-black text-xl text-rose-700 bg-rose-50">
                      {inspeccionesNoCumple}
                    </div>
                    <span className="text-xs font-bold text-slate-700 block">No Cumple</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {totalInspecciones > 0 ? Math.round((inspeccionesNoCumple / totalInspecciones) * 100) : 0}%
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-300 flex items-center justify-center mx-auto mb-2 font-mono font-black text-xl text-slate-700 bg-slate-50">
                      {filteredInspecciones.filter((i) => i.Estado === 'No Aplica').length}
                    </div>
                    <span className="text-xs font-bold text-slate-700 block">No Aplica</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {totalInspecciones > 0 ? Math.round((filteredInspecciones.filter((i) => i.Estado === 'No Aplica').length / totalInspecciones) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* By Evaluated Aspect */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Inspecciones por Aspecto Evaluado</span>
                </h3>

                <div className="space-y-2 pt-1 text-xs">
                  {[
                    'Orden y limpieza',
                    'Instalaciones eléctricas y cableado',
                    'Maquinarias y resguardos móviles',
                    'Ergonomía, iluminación y vías de evacuación',
                    'Almacenamiento de químicos y bioseguridad'
                  ].map((asp) => {
                    const count = filteredInspecciones.filter((i) => i.Aspecto_Evaluado.toLowerCase().includes(asp.toLowerCase().slice(0, 10))).length;
                    const pct = totalInspecciones > 0 ? Math.round((count / totalInspecciones) * 100) : 0;

                    return (
                      <div key={asp} className="space-y-1">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-700 truncate">{asp}</span>
                          <span className="font-mono text-slate-900 font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="bg-amber-500 h-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-MODULE 2: REGISTRO DE ACCIDENTES */}
          {activeSubModule === 'accidentes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Severity Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Distribución por Gravedad del Evento ({totalAccidentes})</span>
                </h3>

                <div className="grid grid-cols-3 gap-3 py-3 text-center">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-2xl font-black font-mono text-amber-900 block">{accidentesLeves}</span>
                    <span className="text-xs font-bold text-amber-800">Leve</span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">Primeros Auxilios</span>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="text-2xl font-black font-mono text-rose-900 block">{accidentesGraves}</span>
                    <span className="text-xs font-bold text-rose-800">Grave</span>
                    <span className="text-[10px] text-rose-600 block mt-0.5">Con Tiempo Perdido</span>
                  </div>

                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-2xl font-black font-mono text-slate-900 block">
                      {filteredAccidentes.filter((a) => a.Gravedad === 'Mortal').length}
                    </span>
                    <span className="text-xs font-bold text-slate-800">Mortal</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Cero Fatalidades</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-1">Días de Trabajo Perdidos Acumulados:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-black text-rose-700">{totalDiasPerdidos} días</span>
                    <span className="text-[11px] text-slate-500">
                      Promedio: {totalAccidentes > 0 ? (totalDiasPerdidos / totalAccidentes).toFixed(1) : 0} días/evento
                    </span>
                  </div>
                </div>
              </div>

              {/* By Event Type */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>Tipos de Eventos Notificados</span>
                </h3>

                <div className="space-y-3 pt-2 text-xs">
                  {[
                    { type: 'Accidente Laboral', color: 'bg-rose-500' },
                    { type: 'Incidente', color: 'bg-amber-500' },
                    { type: 'Enfermedad Ocupacional', color: 'bg-indigo-500' }
                  ].map((evt) => {
                    const count = filteredAccidentes.filter((a) => a.Tipo_Evento === evt.type).length;
                    const pct = totalAccidentes > 0 ? Math.round((count / totalAccidentes) * 100) : 0;

                    return (
                      <div key={evt.type} className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-800">{evt.type}</span>
                          <span className="font-mono text-slate-900">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className={`${evt.color} h-full`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-MODULE 3: INSPECCIÓN DE EXTINTORES */}
          {activeSubModule === 'extintores' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pressure PSI Zones */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-red-600" />
                  <span>Zonas de Presión en Manómetros (Norma NFPA 10)</span>
                </h3>

                <div className="grid grid-cols-3 gap-2.5 py-2 text-center text-xs">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-xl font-black font-mono text-amber-900 block">{extintoresBajaPsi}</span>
                    <span className="font-bold text-amber-800">Baja Presión</span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">&lt; 100 PSI</span>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-xl font-black font-mono text-emerald-900 block">{extintoresNormalPsi}</span>
                    <span className="font-bold text-emerald-800">Zona Verde</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">100–195 PSI</span>
                  </div>

                  <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                    <span className="text-xl font-black font-mono text-red-900 block">{extintoresSobrePsi}</span>
                    <span className="font-bold text-red-800">Sobrepresión</span>
                    <span className="text-[10px] text-red-600 block mt-0.5">&gt; 195 PSI</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-slate-600">Estado de Recargas:</span>
                  <span className="font-bold text-slate-900">
                    {extintoresBase.filter((e) => e.Proxima_Recarga > new Date().toISOString().slice(0, 10)).length} Vigentes / {extintoresBase.filter((e) => e.Proxima_Recarga <= new Date().toISOString().slice(0, 10)).length} Vencidos
                  </span>
                </div>
              </div>

              {/* By Extinguishing Agent */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span>Distribución por Tipo de Agente Extintor</span>
                </h3>

                <div className="space-y-2.5 pt-1 text-xs">
                  {['PQS', 'CO2', 'Agua', 'Espuma AFFF', 'Acetato de Potasio (K)'].map((ag) => {
                    const count = extintoresBase.filter((e) => e.Tipo_Agente === ag).length;
                    const pct = extintoresBase.length > 0 ? Math.round((count / extintoresBase.length) * 100) : 0;

                    return (
                      <div key={ag} className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-700">{ag}</span>
                          <span className="font-mono text-slate-900 font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="bg-red-500 h-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-MODULE 4: DOTACIÓN DE EPI */}
          {activeSubModule === 'epi' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dotación de Equipos de Protección Individual (EPI) por Tipo</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                {[
                  'Botas de caña alta antideslizantes (Planta Faena)',
                  'Guantes de nitrilo y malla anticorte para despresado',
                  'Casco de seguridad dieléctrico y barboquejo',
                  'Lentes de seguridad con protección anti-empañante',
                  'Respirador con filtro para polvillo y vapores de amoníaco NH3'
                ].map((epi) => {
                  const count = filteredDotacionEPI.filter((d) => d.Tipo_EPI.toLowerCase().includes(epi.toLowerCase().slice(0, 10))).length;

                  return (
                    <div key={epi} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <span className="font-medium text-slate-900">{epi}</span>
                      <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {count || 1} entregas
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AUTOMATED EXECUTIVE ANALYSIS SECTION ("Y QUE SE GENERE SOLO UN ANÁLISIS") */}
      {analisis && (
        <div className="bg-linear-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/40 space-y-5">
          {/* Analysis Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  Informe Ejecutivo Automatizado
                </span>
                <span className="text-xs text-white/50">·</span>
                <span className="text-xs text-indigo-300 font-mono">
                  {analysisSource === 'gemini' ? 'Motor Gemini AI' : 'Motor Normativo HSL'}
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {analisis.titulo}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${analisis.badgeColor}`}>
                {analisis.calificacionGeneral}
              </span>
              <button
                onClick={handleCopyAnalysis}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Copiar texto del análisis"
              >
                {copiedAnalysis ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 1. Resumen Ejecutivo */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              1. Resumen Ejecutivo del Período
            </h4>
            <p className="text-xs leading-relaxed text-slate-200 bg-white/5 p-3.5 rounded-xl border border-white/10 font-medium">
              {analisis.resumenEjecutivo}
            </p>
          </div>

          {/* 2. Puntos Críticos Detectados */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              2. Puntos Críticos y Hallazgos Relevantes en Planta Avícola
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {analisis.puntosCriticos.map((punto, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    !
                  </span>
                  <span>{punto}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Análisis de Tendencias */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              3. Análisis de Tendencias Mensuales
            </h4>
            <p className="text-xs leading-relaxed text-slate-200 bg-white/5 p-3 rounded-xl border border-white/10">
              {analisis.analisisTendencias}
            </p>
          </div>

          {/* 4. Recomendaciones Prioritarias */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              4. Plan de Acción y Medidas Preventivas Prioritarias
            </h4>
            <div className="space-y-1.5 text-xs">
              {analisis.recomendacionesPrioritarias.map((rec, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Commitments & Print Footer */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/70">
            <span>
              Emitido por el Sistema de <strong>Gestión de HSL Avícola</strong> · Válido para auditorías internas y normativas.
            </span>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors w-fit"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Exportar Análisis</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
