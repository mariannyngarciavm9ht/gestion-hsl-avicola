export type EstadoInspeccion = 'Cumple' | 'No Cumple' | 'No Aplica';
export type EstadoAccion = 'Pendiente' | 'En Proceso' | 'Cerrada';

export interface ChecklistItem {
  id: string;
  criterio: string;
  estado: EstadoInspeccion;
  observacion?: string;
}

export interface InspeccionSeguridad {
  ID_Inspeccion: string;
  Fecha_Hora: string;
  Inspector: string;
  Area_Sede: string;
  Ubicacion_Detallada: string; // Dónde se encuentra ubicado específicamente (piso, columna, nave, línea)
  Aspecto_Evaluado: string;
  Tema_Inspeccion?: string; // Lo que el usuario desea inspeccionar (ej: Andamios, Montacargas, Soldadura, etc.)
  Checklist_Items?: ChecklistItem[]; // Checklist de inspección dinámica y editable
  Estado: EstadoInspeccion;
  Hallazgo_Descripcion: string;
  Foto_Evidencia: string; // Base64 o URL
  Accion_Correctiva: string;
  Responsable: string;
  Fecha_Limite: string;
  Estado_Accion?: EstadoAccion;
}

export type TipoEventoAccidente = 'Accidente Laboral' | 'Incidente' | 'Enfermedad Ocupacional';
export type GravedadAccidente = 'Leve' | 'Grave' | 'Mortal';

export interface RegistroAccidente {
  ID_Accidente: string;
  Fecha_Incidente: string;
  Nombre_Afectado: string;
  Area: string;
  Ubicacion_Exacta?: string;
  Tipo_Evento: TipoEventoAccidente;
  Gravedad: GravedadAccidente;
  Descripcion_Hechos: string;
  Dias_Perdidos: number;
  Parte_Cuerpo?: string;
  Accion_Inmediata?: string;
}

export type TipoAgenteExtintor = 'CO2' | 'PQS' | 'Agua' | 'Espuma AFFF' | 'Acetato de Potasio (K)';
export type EstadoGeneralExtintor = 'Aprobado' | 'Requiere Mantenimiento';
export type CheckSiNo = 'Sí' | 'No';
export type EstadoPresionExtintor = 'Normal (Zona Verde)' | 'Baja Presión (Descargado)' | 'Sobrepresión (Peligro)';

export interface InspeccionExtintores {
  ID_Revision: string;
  Codigo_Extintor: string;
  Ubicacion: string;
  Tipo_Agente: TipoAgenteExtintor;
  Capacidad: string;
  Fecha_Ultima_Recarga: string;
  Proxima_Recarga: string;
  Manometro_Ok: CheckSiNo;
  Presion_PSI: number; // Presión en PSI medida en manómetro
  Estado_Presion?: EstadoPresionExtintor;
  Manguera_Ok: CheckSiNo;
  Seguro_Presinto_Ok: CheckSiNo;
  Estado_General: EstadoGeneralExtintor;
  Observaciones?: string;
}

export interface DotacionEPI {
  ID_Entrega: string;
  Fecha_Entrega: string;
  Nombre_Colaborador: string;
  Cargo: string;
  Tipo_EPI: string;
  Cantidad: number;
  Firma_Recibido: string; // Base64 PNG de la firma táctil
  Observaciones?: string;
}

export type TipoInforme = 
  | 'Auditoría Ambiental' 
  | 'Informe Técnico SST' 
  | 'Inspección Fotográfica con IA'
  | 'Medición de Ruido e Iluminación' 
  | 'Plan de Emergencia y Evacuación' 
  | 'Estudio de Impacto Ambiental' 
  | 'Investigación de Accidente'
  | 'Monitoreo de Calidad de Aire';

export interface FotoHallazgoReporte {
  id: string;
  url: string; // Base64 o SVG data URL
  etiqueta?: string;
  timestamp?: string;
  titulo?: string;
  peligroDetectado?: string;
  nivelRiesgo?: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  descripcionVisual?: string;
  normativaViolada?: string;
  accionCorrectiva?: string;
  plazoHorasDias?: string;
  responsable?: string;
}

export interface InformeSST {
  ID_Informe: string;
  Titulo: string;
  Tipo_Informe: TipoInforme;
  Autor: string;
  Fecha: string;
  Area_Sede: string;
  Resumen_Alcance: string;
  Nombre_Archivo: string;
  Tamano_Archivo: string;
  Archivo_Data?: string; // Base64 Data URL
  Estado: 'Vigente' | 'En Revisión' | 'Archivado';
  Fotos_Evidencia?: FotoHallazgoReporte[];
  Conclusiones?: string;
  Recomendaciones?: string[];
  Normativa_Aplicable?: string[];
  Calificacion_Global?: 'Aprobado' | 'Conforme con Observaciones' | 'Requiere Acción Inmediata' | 'Crítico';
  Firma_Inspector?: string;
  Generado_Automatico?: boolean;
}

export type ActiveTab = 'resumen' | 'inspecciones' | 'accidentes' | 'extintores' | 'dotacion_epi' | 'informes' | 'graficos';

