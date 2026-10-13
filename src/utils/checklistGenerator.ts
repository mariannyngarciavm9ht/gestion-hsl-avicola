import { ChecklistItem } from '../types/ehs';

export interface ChecklistTemplate {
  topic: string;
  category: string;
  keywords: string[];
  items: string[];
}

export const PRESET_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    topic: 'Andamios y Trabajos en Altura',
    category: 'Alto Riesgo',
    keywords: ['altura', 'andamio', 'linea de vida', 'arnes', 'cubierta', 'escala', 'techo', 'torre', 'canastilla'],
    items: [
      'Andamio nivelado y apoyado sobre bases regulables con durmientes de madera firmes.',
      'Crucetas, diagonales y pasadores de seguridad instalados en todos los cuerpos del andamio.',
      'Plataforma de trabajo completa, sin orificios y con tablones metálicos trabados.',
      'Barandas perimetrales completas: superior a 1.20m, intermedia a 0.60m y rodapié de 15cm.',
      'Puntos de anclaje certificados independientes y líneas de vida verticales operativas.',
      'Inspección de arnés de cuerpo entero (4 argollas): costuras, hebillas y absorbedor de impacto vigentes.',
      'Tarjeta de señalización de andamio (Verde: Operativo / Roja: Prohibido usar) visible.',
      'Escalera interna o externa de acceso asegurada al cuerpo del andamio.'
    ]
  },
  {
    topic: 'Montacargas y Apiladores Eléctricos',
    category: 'Maquinarias',
    keywords: ['montacarga', 'apilador', 'forklift', 'elevador', 'vehiculo', 'autoelevador'],
    items: [
      'Revisión de frenos de servicio y freno de mano / estacionamiento operativos.',
      'Estado y desgaste de las horquillas, pasadores y cadena de elevación sin fisuras.',
      'Alarma sonora de retroceso y circulina destellante operativas.',
      'Cinturón de seguridad operativo y estructura antivuelco (ROPS) sin daños.',
      'Niveles de fluido hidráulico, batería y ausencia de fugas de aceite.',
      'Bocina / claxon y luces delanteras/traseras funcionando correctamente.',
      'Extintor de PQS 2.5 kg adosado al montacargas con carga vigente.',
      'Licencia interna de conducir del operador y checklist pre-uso diario firmado.'
    ]
  },
  {
    topic: 'Soldadura y Trabajos en Caliente',
    category: 'Alto Riesgo',
    keywords: ['soldadura', 'caliente', 'corte', 'oxicorte', 'esmeril', 'chispa', 'amolar', 'soplete'],
    items: [
      'Permiso de Trabajo de Alto Riesgo (PETAR) de trabajo en caliente firmado y visible.',
      'Área despejada de material combustible en radio de 11 metros o protegida con mantas ignífugas.',
      'Extintor PQS de 20 Lbs presente y listo a menos de 5 metros del punto de chispa.',
      'Cilindros de gas comprimido encadenados verticalmente y con válvulas antirretorno de llama.',
      'Cables de soldadura sin empalmes defectuosos y con pinza de masa adecuada.',
      'EPP específico: Careta fotosensible, guantes de soldar largos, mandil y escarpines de cuero.',
      'Vigía de fuego asignado durante el trabajo y por 30 minutos posteriores al término.'
    ]
  },
  {
    topic: 'Instalaciones y Tableros Eléctricos',
    category: 'Instalaciones',
    keywords: ['electrico', 'tablero', 'subestacion', 'cable', 'tension', 'breaker', 'transformador'],
    items: [
      'Tablero eléctrico cerrado con llave, mandil de protección acrílica y sin cables expuestos.',
      'Rotulación y directorio de circuitos con interruptores termomagnéticos y diferenciales identificados.',
      'Interruptor diferencial de 30 mA operativo y probado con pulsador de test.',
      'Conexión a tierra (pozo a tierra) conectada y en buen estado mecánico.',
      'Señalética de advertencia de "Peligro: Alta Tensión" fotoluminiscente en la puerta exterior.',
      'Área frente al tablero despejada de materiales u obstáculos en al menos 1 metro de distancia.',
      'Alfombra dieléctrica o banqueta aislante colocada al frente del tablero.'
    ]
  },
  {
    topic: 'Almacenamiento de Sustancias Químicas',
    category: 'Materiales Peligrosos',
    keywords: ['quimico', 'reactivo', 'solvente', 'acido', 'sustancia', 'msds', 'gaspeligroso', 'cilindro'],
    items: [
      'Hojas de Datos de Seguridad (MSDS / FDS) en español disponibles y visibles en el área.',
      'Envases y recipientes químicos rotulados con rombo NFPA 704 o SGA (GHS).',
      'Bandejas de contención secundaria con capacidad para el 110% del contenedor mayor.',
      'Kit antiderrame completo: paños absorbentes, salchichas, pala antichispa y bolsas rotuladas.',
      'Ducha de emergencia y lavaojos operativa, con prueba de flujo semanal registrada.',
      'Sustancias incompatibles almacenadas con separación física segura.',
      'Ventilación natural o forzada adecuada para evitar acumulación de vapores inflamables.'
    ]
  },
  {
    topic: 'Espacios Confinados',
    category: 'Alto Riesgo',
    keywords: ['confinado', 'tanque', 'cisterna', 'silo', 'pozo', 'alcantarilla', 'bunker', 'tunel'],
    items: [
      'Medición de atmósfera peligrosa (Oxígeno 19.5-23.5%, gases inflamables <10% LEL, CO y H2S) registrada.',
      'Permiso de ingreso a espacio confinado (PETAR) aprobado por supervisor y vigía.',
      'Vigía de seguridad apostado permanentemente en la entrada del espacio confinado.',
      'Sistema de ventilación forzada continua (extractor / inyector de aire) en funcionamiento.',
      'Trípode de rescate con sistema de poleas, arnés y línea retráctil instalado en la boca de ingreso.',
      'Plan de rescate de emergencia coordinado y equipos de respiración autónoma (ERA) listos.'
    ]
  },
  {
    topic: 'Calderas y Recipientes a Presión',
    category: 'Equipos Críticos',
    keywords: ['caldera', 'presion', 'compresor', 'autoclave', 'vapor', 'manometro', 'valvula de seguridad'],
    items: [
      'Válvula de alivio de seguridad con prueba de disparo vigente y descarga canalizada segura.',
      'Manómetro calibrado con sello de verificación y aguja dentro de la zona de presión de trabajo.',
      'Nivel de agua visual purgado y libre de incrustaciones o fugas.',
      'Controles automáticos de corte por bajo nivel de agua y alta presión operativos.',
      'Libro de vida y registro de mantenimiento preventivo y purgas al día.',
      'Aislamiento térmico de tuberías de vapor en buen estado para evitar quemaduras por contacto.',
      'Ventilación adecuada de la sala de calderas y detector de gases / monóxido de carbono.'
    ]
  },
  {
    topic: 'Orden, Limpieza y Metodología 5S',
    category: 'Higiene y Ergonomía',
    keywords: ['orden', 'limpieza', '5s', 'aseo', 'despejado', 'pasillo', 'comedor', 'oficina'],
    items: [
      'Pasillos principales y secundarios despejados, demarcados con líneas amarillas continuas.',
      'Herramientas manuales guardadas en tableros organizadores o cajas de herramientas rotuladas.',
      'Residuos sólidos clasificados en tachos de colores según código ambiental de colores.',
      'Pisos secos, libres de virutas, grasas, charcos de agua o cables sueltos.',
      'Materiales apilados con altura segura respetando la relación 3:1 de estabilidad.',
      'Accesos a extintores, camillas y salidas de emergencia 100% libres de obstáculos.'
    ]
  },
  {
    topic: 'Maquinarias, Prensas y Resguardos',
    category: 'Maquinarias',
    keywords: ['maquinaria', 'prensa', 'torno', 'resguardo', 'guillotina', 'faja', 'rotativo', 'engranaje'],
    items: [
      'Paradas de emergencia (setas rojas) operativas, accesibles y con reset manual.',
      'Resguardos fijos o enclavamientos de seguridad en todas las partes móviles y de transmisión.',
      'Dispositivos de bloqueo y etiquetado (LOTO) aplicables para tareas de ajuste o limpieza.',
      'Pedal de accionamiento con capota de protección contra accionamientos involuntarios.',
      'Iluminación puntual de la zona de trabajo de la máquina sin sombras ni deslumbramiento.',
      'Placas de advertencia de atrapamiento y corte visibles en los puntos de peligro.',
      'Operadores con ropa ceñida al cuerpo, cabello recogido y sin cadenas o anillos.'
    ]
  },
  {
    topic: 'Herramientas Manuales y de Poder',
    category: 'Equipos Menores',
    keywords: ['herramienta', 'taladro', 'amoladora', 'sierra', 'martillo', 'destornillador', 'pulidora'],
    items: [
      'Herramientas manuales sin mangos astillados, rebabas, cabezas de hongo o deformaciones.',
      'Herramientas eléctricas con doble aislamiento o cable de puesta a tierra intacto.',
      'Guarda de protección disco / hoja instalada correctamente en ángulo de protección.',
      'Gatillo o interruptor con seguro para evitar encendidos accidentales.',
      'Código de colores de inspección trimestral de herramientas colocado en el cable/mango.',
      'EPP específico obligatorio: protección facial completa, guantes anticorte y protección auditiva.'
    ]
  },
  {
    topic: 'Ergonomía y Manipulación Manual de Cargas',
    category: 'Salud Ocupacional',
    keywords: ['ergonomia', 'carga', 'postura', 'levantamiento', 'pantalla', 'silla', 'musculoesqueletico'],
    items: [
      'Pesos de carga manual dentro del límite máximo legal (máx. 25 kg para hombres / 15 kg para mujeres).',
      'Uso de ayudas mecánicas (carros, transpaletas) para traslados mayores a 10 metros.',
      'Sillas ergonómicas ajustables con apoyo lumbar operativo para puestos sentados.',
      'Pantallas a la altura de los ojos y distancia de visión adecuada para evitar fatiga cervical.',
      'Programa de pausas activas implementado y ejecutado durante la jornada laboral.',
      'Zonas de trabajo diseñadas para evitar giros forzados de tronco o alcances por encima del hombro.'
    ]
  },
  {
    topic: 'Excavaciones y Zanjas',
    category: 'Alto Riesgo',
    keywords: ['excavacion', 'zanja', 'talud', 'entibado', 'tierra', 'derrumbe'],
    items: [
      'Estudio de interferencias de redes subterráneas (agua, gas, electricidad) verificado antes de cavar.',
      'Entibación o tablestacado instalado en zanjas mayores a 1.50 metros de profundidad.',
      'Material extraído acumulado a una distancia mínima de 0.60 metros del borde de la excavación.',
      'Escaleras de acceso y evacuación colocadas cada 7.5 metros a lo largo de la zanja.',
      'Señalización perimetral y barrera rígida con malla naranja a 1 metro de distancia.',
      'Inspección de taludes después de lluvias o vibraciones de maquinaria pesada.'
    ]
  }
];

/**
 * Generates an editable checklist for ANY inspection topic.
 * Uses smart pattern matching or generates contextual checks dynamically.
 */
export function generateChecklistForTopic(topic: string): ChecklistItem[] {
  if (!topic || !topic.trim()) {
    return generateDefaultChecklist();
  }

  const clean = topic.toLowerCase().trim();

  // 1. Search in preset templates by keywords or topic
  const matched = PRESET_CHECKLIST_TEMPLATES.find((tpl) => {
    if (clean.includes(tpl.topic.toLowerCase())) return true;
    return tpl.keywords.some((kw) => clean.includes(kw));
  });

  if (matched) {
    return matched.items.map((criterio, index) => ({
      id: `chk-${Date.now()}-${index + 1}`,
      criterio,
      estado: 'Cumple',
      observacion: ''
    }));
  }

  // 2. Dynamic generation based on custom topic
  const dynamicItems: string[] = [
    `Verificación de condiciones operativas y estructurales seguras de ${topic}.`,
    `Ausencia de riesgos críticos evidentes, fugas, partes sueltas o sobrecargas en ${topic}.`,
    `Presencia de señalización de seguridad, rotulación de advertencia y delimitación del área.`,
    `Personal involucrado cuenta con inducción técnica, competencias y EPP específico reglamentario.`,
    `Orden, limpieza y pasillos de evacuación despejados en el entorno de trabajo.`,
    `Equipos de respuesta a emergencia (extintor, botiquín o pulsador) accesibles en la zona.`,
    `Cumplimiento del procedimiento estándar de trabajo seguro (PETS) y permisos requeridos.`
  ];

  return dynamicItems.map((criterio, index) => ({
    id: `chk-${Date.now()}-${index + 1}`,
    criterio,
    estado: 'Cumple',
    observacion: ''
  }));
}

/**
 * Async generator that tries calling the Gemini API endpoint first,
 * falling back smoothly to the local generator.
 */
export async function requestIntelligentChecklist(topic: string, context?: string): Promise<{
  items: ChecklistItem[];
  aspectoRecomendado?: string;
  source: 'gemini' | 'local';
}> {
  try {
    const res = await fetch('/api/gemini/generate-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, context })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.criterios) && json.data.criterios.length > 0) {
        const items: ChecklistItem[] = json.data.criterios.map((crit: string, idx: number) => ({
          id: `chk-ai-${Date.now()}-${idx + 1}`,
          criterio: crit,
          estado: 'Cumple',
          observacion: ''
        }));

        return {
          items,
          aspectoRecomendado: json.data.aspectoRecomendado,
          source: 'gemini'
        };
      }
    }
  } catch (err) {
    console.warn('Fallback to local checklist engine:', err);
  }

  // Fallback to rich local generator
  return {
    items: generateChecklistForTopic(topic),
    source: 'local'
  };
}

function generateDefaultChecklist(): ChecklistItem[] {
  const defaults = [
    'Orden y limpieza: Pisos libres de obstáculos, líquidos y residuos.',
    'Señalización de seguridad visible, legible y en buen estado.',
    'Extintores de incendio accesibles, con manómetro en zona verde y carga vigente.',
    'Vías de evacuación y salidas de emergencia 100% despejadas.',
    'Uso obligatorio y correcto de Equipos de Protección Individual (EPI).',
    'Condiciones eléctricas: Cables canalizados, tomas sin sobrecarga y tableros cerrados.'
  ];

  return defaults.map((criterio, index) => ({
    id: `chk-def-${Date.now()}-${index + 1}`,
    criterio,
    estado: 'Cumple',
    observacion: ''
  }));
}
