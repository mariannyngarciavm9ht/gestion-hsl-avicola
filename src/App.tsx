import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ClipboardCheck, 
  AlertTriangle, 
  Flame, 
  FileText, 
  LayoutDashboard, 
  Search, 
  RotateCcw,
  Menu,
  X,
  Plus,
  QrCode,
  BarChart3,
  Camera
} from 'lucide-react';
import { 
  ActiveTab, 
  InspeccionSeguridad, 
  RegistroAccidente, 
  InspeccionExtintores, 
  DotacionEPI, 
  InformeSST 
} from './types/ehs';
import { 
  getInitialState, 
  saveData, 
  STORAGE_KEYS, 
  resetToDemoData 
} from './data/initialData';
import { ResumenDashboard } from './components/ResumenDashboard';
import { InspeccionesSection } from './components/InspeccionesSection';
import { AccidentesSection } from './components/AccidentesSection';
import { ExtintoresSection } from './components/ExtintoresSection';
import { DotacionEPISection } from './components/DotacionEPISection';
import { InformesSection } from './components/InformesSection';
import { GraficosSection } from './components/GraficosSection';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QRScannerModal } from './components/QRScannerModal';
import { PhotoReportGeneratorModal } from './components/PhotoReportGeneratorModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('resumen');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
  const [isGlobalPhotoReportOpen, setIsGlobalPhotoReportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // App data state loaded from localStorage
  const [data, setData] = useState(getInitialState);

  // Save changes to localStorage
  const handleSaveInspeccion = (item: InspeccionSeguridad) => {
    setData((prev) => {
      const exists = prev.inspecciones.some((i) => i.ID_Inspeccion === item.ID_Inspeccion);
      const nextList = exists
        ? prev.inspecciones.map((i) => (i.ID_Inspeccion === item.ID_Inspeccion ? item : i))
        : [item, ...prev.inspecciones];
      saveData(STORAGE_KEYS.INSPECCIONES, nextList);
      return { ...prev, inspecciones: nextList };
    });
  };

  const handleDeleteInspeccion = (id: string) => {
    setData((prev) => {
      const nextList = prev.inspecciones.filter((i) => i.ID_Inspeccion !== id);
      saveData(STORAGE_KEYS.INSPECCIONES, nextList);
      return { ...prev, inspecciones: nextList };
    });
  };

  const handleSaveAccidente = (item: RegistroAccidente) => {
    setData((prev) => {
      const exists = prev.accidentes.some((a) => a.ID_Accidente === item.ID_Accidente);
      const nextList = exists
        ? prev.accidentes.map((a) => (a.ID_Accidente === item.ID_Accidente ? item : a))
        : [item, ...prev.accidentes];
      saveData(STORAGE_KEYS.ACCIDENTES, nextList);
      return { ...prev, accidentes: nextList };
    });
  };

  const handleDeleteAccidente = (id: string) => {
    setData((prev) => {
      const nextList = prev.accidentes.filter((a) => a.ID_Accidente !== id);
      saveData(STORAGE_KEYS.ACCIDENTES, nextList);
      return { ...prev, accidentes: nextList };
    });
  };

  const handleSaveExtintor = (item: InspeccionExtintores) => {
    setData((prev) => {
      const exists = prev.extintores.some((e) => e.ID_Revision === item.ID_Revision);
      const nextList = exists
        ? prev.extintores.map((e) => (e.ID_Revision === item.ID_Revision ? item : e))
        : [item, ...prev.extintores];
      saveData(STORAGE_KEYS.EXTINTORES, nextList);
      return { ...prev, extintores: nextList };
    });
  };

  const handleDeleteExtintor = (id: string) => {
    setData((prev) => {
      const nextList = prev.extintores.filter((e) => e.ID_Revision !== id);
      saveData(STORAGE_KEYS.EXTINTORES, nextList);
      return { ...prev, extintores: nextList };
    });
  };

  const handleSaveDotacionEPI = (item: DotacionEPI) => {
    setData((prev) => {
      const exists = prev.dotacionEPI.some((e) => e.ID_Entrega === item.ID_Entrega);
      const nextList = exists
        ? prev.dotacionEPI.map((e) => (e.ID_Entrega === item.ID_Entrega ? item : e))
        : [item, ...prev.dotacionEPI];
      saveData(STORAGE_KEYS.DOTACION_EPI, nextList);
      return { ...prev, dotacionEPI: nextList };
    });
  };

  const handleDeleteDotacionEPI = (id: string) => {
    setData((prev) => {
      const nextList = prev.dotacionEPI.filter((e) => e.ID_Entrega !== id);
      saveData(STORAGE_KEYS.DOTACION_EPI, nextList);
      return { ...prev, dotacionEPI: nextList };
    });
  };

  const handleSaveInforme = (item: InformeSST) => {
    setData((prev) => {
      const exists = prev.informes.some((i) => i.ID_Informe === item.ID_Informe);
      const nextList = exists
        ? prev.informes.map((i) => (i.ID_Informe === item.ID_Informe ? item : i))
        : [item, ...prev.informes];
      saveData(STORAGE_KEYS.INFORMES, nextList);
      return { ...prev, informes: nextList };
    });
  };

  const handleDeleteInforme = (id: string) => {
    setData((prev) => {
      const nextList = prev.informes.filter((i) => i.ID_Informe !== id);
      saveData(STORAGE_KEYS.INFORMES, nextList);
      return { ...prev, informes: nextList };
    });
  };

  // Global search keyboard shortcut (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check URL parameters for scanned extinguisher deep link (?extintor=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const extintorParam = urlParams.get('extintor');
      if (extintorParam) {
        const found = data.extintores.find(
          (e) =>
            e.Codigo_Extintor.toLowerCase() === extintorParam.toLowerCase() ||
            e.ID_Revision.toLowerCase() === extintorParam.toLowerCase()
        );
        if (found) {
          setActiveTab('extintores');
          setSelectedRecordId(found.ID_Revision);
        }
      }
    }
  }, [data.extintores]);

  const handleSelectSearchResult = (tab: ActiveTab, recordId: string) => {
    setActiveTab(tab);
    setSelectedRecordId(recordId);
  };

  const handleResetDemo = () => {
    if (confirm('¿Restablecer los datos de demostración a su estado inicial? Se conservarán los ejemplos de inspecciones, fotos y firmas.')) {
      const fresh = resetToDemoData();
      setData(fresh);
    }
  };

  const navItems = [
    { id: 'resumen' as ActiveTab, label: 'Resumen EHS', icon: LayoutDashboard, activeColor: 'text-amber-700 border-amber-500', badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'graficos' as ActiveTab, label: 'Métricas & Gráficos', icon: BarChart3, activeColor: 'text-indigo-800 border-indigo-500', badgeColor: 'bg-indigo-100 text-indigo-900' },
    { id: 'inspecciones' as ActiveTab, label: 'Inspecciones', icon: ClipboardCheck, count: data.inspecciones.length, activeColor: 'text-amber-800 border-amber-500', badgeColor: 'bg-amber-100 text-amber-900' },
    { id: 'accidentes' as ActiveTab, label: 'Accidentes', icon: AlertTriangle, count: data.accidentes.length, activeColor: 'text-rose-800 border-rose-500', badgeColor: 'bg-rose-100 text-rose-900' },
    { id: 'extintores' as ActiveTab, label: 'Extintores & Presión', icon: Flame, count: data.extintores.length, activeColor: 'text-red-700 border-red-500', badgeColor: 'bg-red-100 text-red-900' },
    { id: 'dotacion_epi' as ActiveTab, label: 'Dotación EPI', icon: ShieldCheck, count: data.dotacionEPI.length, activeColor: 'text-emerald-800 border-emerald-500', badgeColor: 'bg-emerald-100 text-emerald-900' },
    { id: 'informes' as ActiveTab, label: 'Informes Técnicos', icon: FileText, count: data.informes.length, activeColor: 'text-sky-800 border-sky-500', badgeColor: 'bg-sky-100 text-sky-900' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* 1-ROW TOP BAR CONTRACT (Brand zone - Nav links - 1 Primary Action) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setActiveTab('resumen')}
              className="text-left flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
            >
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md group-hover:scale-105 transition-transform">
                A
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 group-hover:text-amber-800 transition-colors">
                  Gestión de HSL Avícola
                </span>
                <span className="hidden sm:inline-block text-[11px] text-amber-800 font-bold ml-2 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Higiene, Seguridad & Ambiente
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-600">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-1 border-b-2 flex items-center gap-1.5 ${
                    isActive
                      ? `${item.activeColor} font-black`
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? '' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                      isActive ? item.badgeColor : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions - Foto-Informe IA, QR Scanner & Fast Search */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGlobalPhotoReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 rounded-xl transition-all whitespace-nowrap shadow-2xs active:scale-98 cursor-pointer"
              title="Tomar fotos y generar informe técnico automático con IA"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Foto-Informe IA</span>
            </button>

            <button
              onClick={() => setIsGlobalScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-900 bg-red-100 hover:bg-red-200 border border-red-300 rounded-xl transition-all whitespace-nowrap shadow-2xs active:scale-98"
              title="Escanear código QR de extintor con la cámara"
            >
              <QrCode className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">Escanear QR</span>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-2xs hover:shadow-xs active:scale-98"
            >
              <Search className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Buscador Fácil...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white text-[10px] text-amber-900 rounded-md border border-amber-200 font-mono font-bold shadow-2xs">
                Ctrl+K
              </kbd>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left ${
                    activeTab === item.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="font-mono tabular-nums text-[11px] opacity-80">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'resumen' && (
          <ResumenDashboard
            inspecciones={data.inspecciones}
            accidentes={data.accidentes}
            extintores={data.extintores}
            dotacionEPI={data.dotacionEPI}
            informes={data.informes}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenQuickSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeTab === 'graficos' && (
          <GraficosSection
            inspecciones={data.inspecciones}
            accidentes={data.accidentes}
            extintores={data.extintores}
            dotacionEPI={data.dotacionEPI}
            informes={data.informes}
          />
        )}

        {activeTab === 'inspecciones' && (
          <InspeccionesSection
            inspecciones={data.inspecciones}
            onSave={handleSaveInspeccion}
            onDelete={handleDeleteInspeccion}
            onSaveInforme={handleSaveInforme}
            selectedIdFromSearch={selectedRecordId}
            onClearSelectedId={() => setSelectedRecordId(null)}
          />
        )}

        {activeTab === 'accidentes' && (
          <AccidentesSection
            accidentes={data.accidentes}
            onSave={handleSaveAccidente}
            onDelete={handleDeleteAccidente}
            selectedIdFromSearch={selectedRecordId}
            onClearSelectedId={() => setSelectedRecordId(null)}
          />
        )}

        {activeTab === 'extintores' && (
          <ExtintoresSection
            extintores={data.extintores}
            onSave={handleSaveExtintor}
            onDelete={handleDeleteExtintor}
            selectedIdFromSearch={selectedRecordId}
            onClearSelectedId={() => setSelectedRecordId(null)}
          />
        )}

        {activeTab === 'dotacion_epi' && (
          <DotacionEPISection
            dotacionEPI={data.dotacionEPI}
            onSave={handleSaveDotacionEPI}
            onDelete={handleDeleteDotacionEPI}
            selectedIdFromSearch={selectedRecordId}
            onClearSelectedId={() => setSelectedRecordId(null)}
          />
        )}

        {activeTab === 'informes' && (
          <InformesSection
            informes={data.informes}
            onSave={handleSaveInforme}
            onDelete={handleDeleteInforme}
            onSaveInspeccion={handleSaveInspeccion}
            selectedIdFromSearch={selectedRecordId}
            onClearSelectedId={() => setSelectedRecordId(null)}
          />
        )}
      </main>

      {/* Global Easy Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        inspecciones={data.inspecciones}
        accidentes={data.accidentes}
        extintores={data.extintores}
        dotacionEPI={data.dotacionEPI}
        informes={data.informes}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Global Extinguisher QR Scanner */}
      <QRScannerModal
        isOpen={isGlobalScannerOpen}
        onClose={() => setIsGlobalScannerOpen(false)}
        extintores={data.extintores}
        onSelectExtintor={(ext) => {
          setActiveTab('extintores');
          setSelectedRecordId(ext.ID_Revision);
        }}
      />

      {/* Global Photo-to-Report Generator Modal */}
      <PhotoReportGeneratorModal
        isOpen={isGlobalPhotoReportOpen}
        onClose={() => setIsGlobalPhotoReportOpen(false)}
        onSaveInforme={handleSaveInforme}
        onSaveInspeccion={handleSaveInspeccion}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SafeWork EHS</span>
            <span aria-hidden="true">·</span>
            <span>Gestión de Higiene Ocupacional, Seguridad Industrial y Medio Ambiente</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer datos demo</span>
            </button>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-slate-400">
              Almacenamiento local activo
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
