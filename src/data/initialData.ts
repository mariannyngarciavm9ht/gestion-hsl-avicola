import {
  InspeccionSeguridad,
  RegistroAccidente,
  InspeccionExtintores,
  DotacionEPI,
  InformeSST
} from '../types/ehs';

const sampleSignature1 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><path d="M 30 70 Q 60 20 85 65 T 140 50 Q 180 80 210 40 T 260 70" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round"/><path d="M 90 90 L 230 75" fill="none" stroke="%231e3a8a" stroke-width="1.8" stroke-linecap="round"/></svg>';
const sampleSignature2 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><path d="M 40 80 Q 70 30 110 50 Q 150 70 190 35 Q 220 70 250 60" fill="none" stroke="%230f172a" stroke-width="2.2" stroke-linecap="round"/><circle cx="115" cy="35" r="3" fill="%230f172a"/></svg>';
const sampleSignature3 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><path d="M 25 85 Q 55 25 90 75 T 150 45 T 220 80 T 270 50" fill="none" stroke="%231e293b" stroke-width="2.5" stroke-linecap="round"/></svg>';

const sampleEvidencia1 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23fff1f2"/><rect x="40" y="40" width="320" height="220" rx="8" fill="%23ffe4e6" stroke="%23f43f5e" stroke-width="2"/><circle cx="110" cy="110" r="30" fill="%23f59e0b"/><path d="M 60 230 L 150 150 L 220 200 L 290 130 L 340 230 Z" fill="%23e11d48"/><text x="200" y="275" font-family="sans-serif" font-size="13" font-weight="bold" fill="%239f1239" text-anchor="middle">Evidencia: Tablero expuesto sin protección</text></svg>';
const sampleEvidencia2 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0fdf4"/><rect x="40" y="40" width="320" height="220" rx="8" fill="%23dcfce7" stroke="%2322c55e" stroke-width="2"/><path d="M 120 150 L 170 200 L 280 100" fill="none" stroke="%2316a34a" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><text x="200" y="275" font-family="sans-serif" font-size="13" font-weight="bold" fill="%2315803d" text-anchor="middle">Evidencia: Demarcación y orden conforme</text></svg>';

export const INITIAL_INSPECCIONES: InspeccionSeguridad[] = [
  {
    ID_Inspeccion: 'INS-2026-001',
    Fecha_Hora: '2026-10-08 09:30',
    Inspector: 'Ing. Carlos Mendoza',
    Area_Sede: 'Taller Central de Mantenimiento',
    Ubicacion_Detallada: 'Nave B · Pasillo 4 · Junto al Tablero General TD-03',
    Aspecto_Evaluado: 'Instalaciones eléctricas y cableado',
    Estado: 'No Cumple',
    Hallazgo_Descripcion: 'Tablero eléctrico secundario TD-03 sin tapa de protección acrílica y cables de 220V expuestos cerca a zona de lavado.',
    Foto_Evidencia: sampleEvidencia1,
    Accion_Correctiva: 'Instalar tapa de policarbonato aislante e impermeabilizar canaleta perimetral.',
    Responsable: 'Ing. Roberto Silva (Jefe de Mantenimiento)',
    Fecha_Limite: '2026-10-15',
    Estado_Accion: 'En Proceso'
  },
  {
    ID_Inspeccion: 'INS-2026-002',
    Fecha_Hora: '2026-10-09 11:15',
    Inspector: 'Lic. Mariana Valenzuela',
    Area_Sede: 'Almacén de Químicos y Materia Prima',
    Ubicacion_Detallada: 'Sector Químicos A · Bahía 12 · Muro Exterior Norte',
    Aspecto_Evaluado: 'Orden, limpieza y kit antiderrame',
    Estado: 'Cumple',
    Hallazgo_Descripcion: 'Hojas de seguridad (MSDS/FDS) actualizadas y visibles. Bandejas de contención secundarias secas y kit antiderrame completo.',
    Foto_Evidencia: sampleEvidencia2,
    Accion_Correctiva: 'Mantener estándar de inspección semanal preventiva.',
    Responsable: 'Lic. Mariana Valenzuela',
    Fecha_Limite: '2026-10-30',
    Estado_Accion: 'Cerrada'
  },
  {
    ID_Inspeccion: 'INS-2026-003',
    Fecha_Hora: '2026-10-10 08:00',
    Inspector: 'Ing. Carlos Mendoza',
    Area_Sede: 'Línea de Envasado y Empaque',
    Ubicacion_Detallada: 'Planta Principal · Línea 2 · Módulo de Sellado Automático',
    Aspecto_Evaluado: 'Maquinarias y resguardos móviles',
    Estado: 'No Cumple',
    Hallazgo_Descripcion: 'Sensor de parada de emergencia en cinta transportadora 02 presenta holgura mecánica e intermitencia al accionarse.',
    Foto_Evidencia: sampleEvidencia1,
    Accion_Correctiva: 'Reemplazo del pulsador tipo hongo y calibración de microswitch de seguridad.',
    Responsable: 'Téc. Fernando Gómez',
    Fecha_Limite: '2026-10-12',
    Estado_Accion: 'Pendiente'
  },
  {
    ID_Inspeccion: 'INS-2026-004',
    Fecha_Hora: '2026-10-10 14:40',
    Inspector: 'Lic. Mariana Valenzuela',
    Area_Sede: 'Oficinas de Operaciones y Logística',
    Ubicacion_Detallada: 'Edificio Central · Piso 2 · Puerta de Emergencia Oeste',
    Aspecto_Evaluado: 'Ergonomía, iluminación y vías de evacuación',
    Estado: 'Cumple',
    Hallazgo_Descripcion: 'Pasillos libres de cajas u obstáculos. Luces de emergencia operativas en prueba manual de corte.',
    Foto_Evidencia: sampleEvidencia2,
    Accion_Correctiva: 'Ninguna requerida actualmente.',
    Responsable: 'Supervisor de Logística',
    Fecha_Limite: '2026-11-01',
    Estado_Accion: 'Cerrada'
  }
];

export const INITIAL_ACCIDENTES: RegistroAccidente[] = [
  {
    ID_Accidente: 'ACC-2026-001',
    Fecha_Incidente: '2026-09-24',
    Nombre_Afectado: 'Jorge Ramírez Morales',
    Area: 'Taller de Soldadura y Estructuras',
    Ubicacion_Exacta: 'Estación de Esmerilado N° 2',
    Tipo_Evento: 'Accidente Laboral',
    Gravedad: 'Leve',
    Descripcion_Hechos: 'Durante pulido de pieza metálica se desprendió escoria que impactó en dorso de mano izquierda ocasionando laceración superficial de 2 cm. Portaba guantes de carnaza desgastados.',
    Dias_Perdidos: 2,
    Parte_Cuerpo: 'Mano izquierda',
    Accion_Inmediata: 'Atención en tópico médico, desinfección y dotación de nuevos guantes de Kevlar.'
  },
  {
    ID_Accidente: 'ACC-2026-002',
    Fecha_Incidente: '2026-10-02',
    Nombre_Afectado: 'Lucía Fernández Ramos',
    Area: 'Zona de Despacho y Rampa 3',
    Ubicacion_Exacta: 'Rampa de Desnivel 3B',
    Tipo_Evento: 'Incidente',
    Gravedad: 'Leve',
    Descripcion_Hechos: 'Montacargas N° 4 frenó intempestivamente al cruzar rampa mojada por lluvia, rozando una tarima vacía sin causar daño físico al operador ni peatones.',
    Dias_Perdidos: 0,
    Parte_Cuerpo: 'Ninguna',
    Accion_Inmediata: 'Instalación de cinta antideslizante en rampa y señalización de velocidad máxima a 10 km/h.'
  },
  {
    ID_Accidente: 'ACC-2026-003',
    Fecha_Incidente: '2026-10-05',
    Nombre_Afectado: 'Miguel Ángel Castillo',
    Area: 'Planta de Mezclado de Resinas',
    Ubicacion_Exacta: 'Cabina de Dosificación Química',
    Tipo_Evento: 'Enfermedad Ocupacional',
    Gravedad: 'Grave',
    Descripcion_Hechos: 'Operador diagnosticado con dermatitis de contacto aguda y broncoespasmo recurrente tras exposición continuada a solventes volátiles en cabina de preparación.',
    Dias_Perdidos: 15,
    Parte_Cuerpo: 'Vías respiratorias y antebrazos',
    Accion_Inmediata: 'Reubicación temporal de puesto de trabajo y auditoría a sistema de extracción localizada.'
  }
];

export const INITIAL_EXTINTORES: InspeccionExtintores[] = [
  {
    ID_Revision: 'EXT-REV-001',
    Codigo_Extintor: 'EXT-TALL-01',
    Ubicacion: 'Taller de Mantenimiento · Columna A-4 · Junto al torno CNC',
    Tipo_Agente: 'PQS',
    Capacidad: '20 Lbs',
    Fecha_Ultima_Recarga: '2026-02-15',
    Proxima_Recarga: '2027-02-15',
    Manometro_Ok: 'Sí',
    Presion_PSI: 155,
    Estado_Presion: 'Normal (Zona Verde)',
    Manguera_Ok: 'Sí',
    Seguro_Presinto_Ok: 'Sí',
    Estado_General: 'Aprobado',
    Observaciones: 'Acceso despejado, señalética fotoluminiscente visible a 2 metros.'
  },
  {
    ID_Revision: 'EXT-REV-002',
    Codigo_Extintor: 'EXT-SERV-03',
    Ubicacion: 'Sala de Servidores TI · Nivel 1 · Frente a Rack 02',
    Tipo_Agente: 'CO2',
    Capacidad: '10 Lbs',
    Fecha_Ultima_Recarga: '2025-08-10',
    Proxima_Recarga: '2026-08-10',
    Manometro_Ok: 'No',
    Presion_PSI: 65,
    Estado_Presion: 'Baja Presión (Descargado)',
    Manguera_Ok: 'Sí',
    Seguro_Presinto_Ok: 'No',
    Estado_General: 'Requiere Mantenimiento',
    Observaciones: 'Fecha de recarga vencida y aguja en zona de recarga baja (65 PSI). Precinto roto.'
  },
  {
    ID_Revision: 'EXT-REV-003',
    Codigo_Extintor: 'EXT-ALM-08',
    Ubicacion: 'Almacén Central · Pasillo 3 · Columna H-12',
    Tipo_Agente: 'Agua',
    Capacidad: '2.5 Gal',
    Fecha_Ultima_Recarga: '2026-05-20',
    Proxima_Recarga: '2027-05-20',
    Manometro_Ok: 'Sí',
    Presion_PSI: 140,
    Estado_Presion: 'Normal (Zona Verde)',
    Manguera_Ok: 'Sí',
    Seguro_Presinto_Ok: 'Sí',
    Estado_General: 'Aprobado',
    Observaciones: 'Boquilla limpia, soporte mural reforzado adecuadamente.'
  },
  {
    ID_Revision: 'EXT-REV-004',
    Codigo_Extintor: 'EXT-COC-02',
    Ubicacion: 'Comedor y Cocina Industrial · Entrada Principal de Servicios',
    Tipo_Agente: 'Acetato de Potasio (K)',
    Capacidad: '6 Litros',
    Fecha_Ultima_Recarga: '2026-01-10',
    Proxima_Recarga: '2026-11-15',
    Manometro_Ok: 'Sí',
    Presion_PSI: 180,
    Estado_Presion: 'Normal (Zona Verde)',
    Manguera_Ok: 'No',
    Seguro_Presinto_Ok: 'Sí',
    Estado_General: 'Requiere Mantenimiento',
    Observaciones: 'Presión adecuada (180 PSI), pero manguera presenta resequedad y fisura en unión.'
  }
];

export const INITIAL_DOTACION_EPI: DotacionEPI[] = [
  {
    ID_Entrega: 'EPI-2026-001',
    Fecha_Entrega: '2026-10-07',
    Nombre_Colaborador: 'Raúl Medina Paredes',
    Cargo: 'Técnico Soldador Especialista',
    Tipo_EPI: 'Careta de soldar fotosensible + Guantes de carnaza largos',
    Cantidad: 2,
    Firma_Recibido: sampleSignature1,
    Observaciones: 'Dotación periódica por desgaste según matriz IPERC de soldadura.'
  },
  {
    ID_Entrega: 'EPI-2026-002',
    Fecha_Entrega: '2026-10-08',
    Nombre_Colaborador: 'Elena Torres Huamán',
    Cargo: 'Operaria de Almacén y Montacargas',
    Tipo_EPI: 'Botas de seguridad dieléctricas con puntera composite talla 37',
    Cantidad: 1,
    Firma_Recibido: sampleSignature2,
    Observaciones: 'Reemplazo programado semestral. Certificación ASTM F2413.'
  },
  {
    ID_Entrega: 'EPI-2026-003',
    Fecha_Entrega: '2026-10-09',
    Nombre_Colaborador: 'Daniel Ortiz Sánchez',
    Cargo: 'Mecánico de Planta',
    Tipo_EPI: 'Casco de seguridad tipo Jockey Clase E + Lentes claros antivaho',
    Cantidad: 2,
    Firma_Recibido: sampleSignature3,
    Observaciones: 'Ingreso a nueva línea de producción de empaque.'
  }
];

export const INITIAL_INFORMES: InformeSST[] = [
  {
    ID_Informe: 'INF-2026-001',
    Titulo: 'Auditoría Anual de Cumplimiento Legal Ambiental y Gestión de Residuos Peligrosos',
    Tipo_Informe: 'Auditoría Ambiental',
    Autor: 'Consorcio EcoSeguridad Ambiental SAC',
    Fecha: '2026-09-30',
    Area_Sede: 'Todas las Sedes / Planta Industrial',
    Resumen_Alcance: 'Evaluación de trazabilidad de manifiestos de residuos peligrosos (RESPEL), límites máximos permisibles de efluentes y plan de minimización de huella de carbono.',
    Nombre_Archivo: 'Auditoria_Ambiental_Planta_2026.pdf',
    Tamano_Archivo: '4.8 MB',
    Estado: 'Vigente'
  },
  {
    ID_Informe: 'INF-2026-002',
    Titulo: 'Estudio de Monitoreo Ocupacional: Ruido Sonoro Continuo e Iluminación en Puestos Operativos',
    Tipo_Informe: 'Medición de Ruido e Iluminación',
    Autor: 'Ing. Carlos Mendoza (EHS Lead)',
    Fecha: '2026-10-04',
    Area_Sede: 'Línea de Prensas y Taller Mecánico',
    Resumen_Alcance: 'Dosimetría sonora arrojó 88.5 dBA en zona de corte (requiere protectores auditivos copa NRR 27). Luxometría en almacén conforme con 320 lux.',
    Nombre_Archivo: 'Monitoreo_Ruido_Iluminacion_Q3.pdf',
    Tamano_Archivo: '2.1 MB',
    Estado: 'Vigente'
  },
  {
    ID_Informe: 'INF-2026-003',
    Titulo: 'Informe de Investigación y Causa Raíz del Accidente ACC-2026-003 (Exposición Química)',
    Tipo_Informe: 'Investigación de Accidente',
    Autor: 'Comité de Seguridad y Salud en el Trabajo (CSST)',
    Fecha: '2026-10-07',
    Area_Sede: 'Planta de Mezclado de Resinas',
    Resumen_Alcance: 'Análisis mediante método de Árbol de Causas e Ishikawa. Se identificó saturación prematura de filtros de carbón activado en respiradores y deficiencia en velocidad de campana extractora.',
    Nombre_Archivo: 'Investigacion_Causa_Raiz_ACC_003.pdf',
    Tamano_Archivo: '1.4 MB',
    Estado: 'En Revisión'
  },
  {
    ID_Informe: 'INF-2026-004',
    Titulo: 'Informe Técnico de Inspección Fotográfica: Superficies de Tránsito y Resguardos en Faenado',
    Tipo_Informe: 'Inspección Fotográfica con IA',
    Autor: 'Ing. Carlos Mendoza (EHS Avícola Lead)',
    Fecha: '2026-10-10',
    Area_Sede: 'Planta de Faenado y Beneficio',
    Resumen_Alcance: 'Inspección en terreno con evidencia fotográfica directa. Se evaluaron condiciones locativas y mecánicas en línea de recepción y desposte. Se detectó acumulación de grasa en piso sin esteras y necesidad de refuerzo de guantes de cota de malla.',
    Nombre_Archivo: 'Informe_Fotografico_Faenado_IA.pdf',
    Tamano_Archivo: '1.8 MB',
    Estado: 'Vigente',
    Calificacion_Global: 'Requiere Acción Inmediata',
    Generado_Automatico: true,
    Fotos_Evidencia: [
      {
        id: 'foto-init-1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f1f5f9"/><rect x="20" y="20" width="560" height="360" rx="12" fill="%23e2e8f0" stroke="%23cbd5e1" stroke-width="2"/><circle cx="300" cy="180" r="80" fill="%23fef3c7" stroke="%23f59e0b" stroke-width="4"/><polygon points="300,120 350,210 250,210" fill="%23d97706"/><circle cx="300" cy="195" r="5" fill="white"/><rect x="296" y="150" width="8" height="35" rx="3" fill="white"/><rect x="80" y="300" width="440" height="40" rx="8" fill="%23fee2e2" stroke="%23ef4444"/><text x="300" y="325" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23991b1b" text-anchor="middle">ZONA CRÍTICA: Piso Húmedo con Grasa en Faena</text></svg>',
        etiqueta: 'Piso de tolva de recepción de aves',
        timestamp: '2026-10-10 08:45:00',
        titulo: 'Piso resbaladizo con grasa orgánica sin canaleta despejada',
        peligroDetectado: 'Riesgo Locativo: Caída al mismo nivel',
        nivelRiesgo: 'Alto',
        descripcionVisual: 'Acumulación de humedad y grasa cerca del área de colgado de aves vivas.',
        normativaViolada: 'OSHA 1910.22 (Superficies de Tránsito)',
        accionCorrectiva: 'Instalar esteras antideslizantes perforadas y activar drenaje químico.',
        plazoHorasDias: '24 Horas',
        responsable: 'Supervisor de Higiene y Saneamiento'
      }
    ],
    Conclusiones: 'Se requiere intervención prioritaria en el piso de la tolva y refuerzo del uso de EPP anti-corte en el turno de beneficio.',
    Normativa_Aplicable: [
      'OSHA 1910.22 - Superficies de Tránsito',
      'Protocolos de Higiene y Seguridad Laboral en Faena Avícola'
    ]
  }
];

// Helper functions for LocalStorage management
const STORAGE_KEYS = {
  INSPECCIONES: 'ehs_inspecciones_v2',
  ACCIDENTES: 'ehs_accidentes_v2',
  EXTINTORES: 'ehs_extintores_v2',
  DOTACION_EPI: 'ehs_dotacion_epi_v2',
  INFORMES: 'ehs_informes_v2',
};

export function loadData<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultData;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading data for ${key}:`, err);
    return defaultData;
  }
}

export function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving data for ${key}:`, err);
  }
}

export function getInitialState() {
  return {
    inspecciones: loadData<InspeccionSeguridad[]>(STORAGE_KEYS.INSPECCIONES, INITIAL_INSPECCIONES),
    accidentes: loadData<RegistroAccidente[]>(STORAGE_KEYS.ACCIDENTES, INITIAL_ACCIDENTES),
    extintores: loadData<InspeccionExtintores[]>(STORAGE_KEYS.EXTINTORES, INITIAL_EXTINTORES),
    dotacionEPI: loadData<DotacionEPI[]>(STORAGE_KEYS.DOTACION_EPI, INITIAL_DOTACION_EPI),
    informes: loadData<InformeSST[]>(STORAGE_KEYS.INFORMES, INITIAL_INFORMES),
  };
}

export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEYS.INSPECCIONES, JSON.stringify(INITIAL_INSPECCIONES));
  localStorage.setItem(STORAGE_KEYS.ACCIDENTES, JSON.stringify(INITIAL_ACCIDENTES));
  localStorage.setItem(STORAGE_KEYS.EXTINTORES, JSON.stringify(INITIAL_EXTINTORES));
  localStorage.setItem(STORAGE_KEYS.DOTACION_EPI, JSON.stringify(INITIAL_DOTACION_EPI));
  localStorage.setItem(STORAGE_KEYS.INFORMES, JSON.stringify(INITIAL_INFORMES));
  return getInitialState();
}

export { STORAGE_KEYS };
