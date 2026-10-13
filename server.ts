import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Gemini SDK server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint to generate automated photo-based inspection technical report using Gemini multimodal
app.post('/api/gemini/generate-photo-report', async (req, res) => {
  try {
    const { photos, areaSede, inspector, notasContexto } = req.body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos una fotografía de evidencia' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API no configurada en el servidor',
        fallback: true
      });
    }

    // Build multimodal image parts
    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
    for (const p of photos.slice(0, 4)) {
      if (typeof p === 'string') {
        let mimeType = 'image/jpeg';
        let data = p;
        if (p.startsWith('data:')) {
          const match = p.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            data = match[2];
          } else {
            continue;
          }
        }
        imageParts.push({
          inlineData: {
            mimeType,
            data
          }
        });
      }
    }

    if (imageParts.length === 0) {
      return res.status(400).json({ error: 'No se pudieron procesar los formatos de imagen' });
    }

    const promptText = `Actúa como un Auditor Senior de Higiene, Seguridad Laboral y Medio Ambiente (HSL) especializado en la Industria Avícola (granjas avícolas, galpones de postura, plantas de faenado/beneficio, salas de eviscerado, cámaras de frío, calderas, PTAR y plantas de alimento).

El inspector de campo "${inspector || 'Inspector de Seguridad'}" ha tomado ${imageParts.length} fotografía(s) de evidencia en el área: "${areaSede || 'Instalaciones de Producción Avícola'}".
${notasContexto ? `Notas adicionales tomadas en campo por el inspector: "${notasContexto}"` : ''}

Realiza una inspección visual técnica exhaustiva sobre cada una de las imágenes fotográficas proporcionadas:
1. Identifica qué se observa exactamente en la imagen (equipos avícolas, líneas de ganchos, pisos, resguardos, tableros, extintores, operarios, EPP).
2. Detecta condiciones subestándares, peligros evidentes o actos inseguros presentes en las fotos.
3. Clasifica el nivel de riesgo en la matriz IPERC (Crítico, Alto, Medio, Bajo).
4. Cita la normativa técnica de seguridad aplicable (OSHA 1910, Resguardos de Máquinas, Trabajos en Frío, Bioseguridad Avícola, etc.).
5. Redacta la acción correctiva técnica recomendada con plazo de ejecución prioritario y cargo del responsable.
6. Emite un dictamen/calificación global del informe y recomendaciones preventivas.

Genera un informe técnico formal, estructurado en JSON de acuerdo al esquema solicitado.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...imageParts,
        promptText
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titulo: { 
              type: Type.STRING,
              description: 'Título técnico del informe de inspección'
            },
            areaSede: { 
              type: Type.STRING,
              description: 'Área identificada de la planta o granja avícola'
            },
            calificacionGlobal: { 
              type: Type.STRING,
              description: 'Calificación: Aprobado | Conforme con Observaciones | Requiere Acción Inmediata | Crítico'
            },
            resumenEjecutivo: { 
              type: Type.STRING,
              description: 'Resumen gerencial de la inspección visual realizada'
            },
            hallazgos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: { type: Type.STRING },
                  peligro: { type: Type.STRING },
                  nivelRiesgo: { type: Type.STRING, description: 'Crítico | Alto | Medio | Bajo' },
                  descripcionVisual: { type: Type.STRING, description: 'Detalle de lo observado en la fotografía' },
                  normativa: { type: Type.STRING },
                  accionCorrectiva: { type: Type.STRING },
                  plazo: { type: Type.STRING },
                  responsable: { type: Type.STRING }
                },
                required: ['titulo', 'peligro', 'nivelRiesgo', 'descripcionVisual', 'accionCorrectiva', 'plazo', 'responsable']
              }
            },
            normativaAplicable: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            conclusiones: { type: Type.STRING },
            recomendaciones: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['titulo', 'areaSede', 'calificacionGlobal', 'resumenEjecutivo', 'hallazgos', 'conclusiones', 'recomendaciones']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Respuesta vacía de Gemini al analizar fotos');
    }

    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('Error generando informe fotográfico con Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Error al procesar fotografías con Gemini',
      fallback: true
    });
  }
});


// Endpoint to generate dynamic checklists for ANY inspection topic using Gemini
app.post('/api/gemini/generate-checklist', async (req, res) => {
  try {
    const { topic, context } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'El tema de inspección es requerido' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API no configurada en el servidor',
        fallback: true
      });
    }

    const prompt = `Actúa como un Ingeniero Senior de Higiene, Seguridad Ocupacional y Medio Ambiente (EHS / SST) con certificación en normas OSHA, ISO 45001 e ISO 14001.
El usuario desea realizar una inspección de seguridad sobre el siguiente tema o equipo:
"${topic}"
${context ? `Contexto o área: "${context}"` : ''}

Genera una lista de chequeo (checklist) técnica, rigurosa, práctica y completa para inspección de campo.
Debe contener entre 6 y 9 criterios de verificación claros, observables en terreno y específicos para este tipo de inspección.
Para cada criterio, redacta una afirmación en presente que describa la condición segura que debe cumplirse.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aspectoRecomendado: {
              type: Type.STRING,
              description: 'Nombre estandarizado del aspecto evaluado o categoría'
            },
            criterios: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'Criterio específico de verificación de seguridad'
              },
              description: 'Lista de 6 a 9 criterios técnicos de chequeo'
            },
            sugerenciaEPP: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: 'EPP sugeridos para realizar esta inspección'
            }
          },
          required: ['aspectoRecomendado', 'criterios']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Respuesta vacía de Gemini');
    }

    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('Error generando checklist con Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Error al procesar solicitud con Gemini',
      fallback: true
    });
  }
});

// Endpoint to generate automated executive EHS analysis for the poultry plant
app.post('/api/gemini/generate-analysis', async (req, res) => {
  try {
    const { periodo, metrics } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API no configurada en el servidor',
        fallback: true
      });
    }

    const prompt = `Actúa como un Auditor y Director Senior de Higiene, Seguridad Laboral y Medio Ambiente (HSL) especializado en la Industria Avícola (granjas de crianza, galpones de postura, plantas de beneficio/faenado, salas de eviscerado, cámaras frigoríficas, bioseguridad y plantas de alimento).

Analiza las siguientes métricas estadísticas consolidadas del sistema "Gestión de HSL Avícola" para el período: "${periodo || 'Período Actual'}":
- Inspecciones de seguridad: ${metrics?.totalInspecciones || 0} realizadas. Tasa de conformidad: ${metrics?.tasaConformidad || 0}%. No conformidades detectadas: ${metrics?.noConformidades || 0}.
- Registro de Accidentes: ${metrics?.totalAccidentes || 0} eventos registrados. Accidentes graves/mortales: ${metrics?.accidentesGraves || 0}. Días perdidos acumulados: ${metrics?.diasPerdidos || 0} días.
- Extintores e Incendios: ${metrics?.totalExtintores || 0} extintores. Aprobados: ${metrics?.extintoresAprobados || 0}. Anómalos o baja presión: ${metrics?.extintoresAnomalos || 0}.
- Dotación de EPIs entregados: ${metrics?.totalEPI || 0} entregas.
- Áreas registradas con observaciones: ${JSON.stringify(metrics?.areasCriticas || [])}.
- Principales hallazgos o no conformidades: ${JSON.stringify(metrics?.hallazgosPrincipales || [])}.

Genera un informe analítico ejecutivo, profesional y contundente para la gerencia avícola.
Debe evaluar los riesgos propios del rubro avícola (pisos resbaladizos con agua/grasa en faena, exposición a frío en cámaras, polvillo y amoníaco NH3 en galpones, maquinaria de corte, manipulación de cargas y bioseguridad).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titulo: { type: Type.STRING },
            calificacionGeneral: { type: Type.STRING },
            resumenEjecutivo: { type: Type.STRING },
            puntosCriticos: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            analisisTendencias: { type: Type.STRING },
            recomendacionesPrioritarias: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            compromisosSST: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['titulo', 'calificacionGeneral', 'resumenEjecutivo', 'puntosCriticos', 'recomendacionesPrioritarias']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Respuesta vacía de Gemini');
    }

    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('Error generando análisis ejecutivo con Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Error al procesar análisis con Gemini',
      fallback: true
    });
  }
});

// Mount Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EHS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
