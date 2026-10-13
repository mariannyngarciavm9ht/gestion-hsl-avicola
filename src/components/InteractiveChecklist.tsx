import React, { useState } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  AlertTriangle, 
  RotateCcw, 
  Edit2, 
  Check, 
  X,
  ChevronDown, 
  ChevronUp,
  Loader2,
  Wand2,
  Info
} from 'lucide-react';
import { ChecklistItem, EstadoInspeccion } from '../types/ehs';
import { 
  PRESET_CHECKLIST_TEMPLATES, 
  generateChecklistForTopic, 
  requestIntelligentChecklist 
} from '../utils/checklistGenerator';

interface InteractiveChecklistProps {
  initialTopic?: string;
  items: ChecklistItem[];
  onChangeItems: (items: ChecklistItem[]) => void;
  onApplyFindings?: (summary: {
    estadoGeneral: EstadoInspeccion;
    hallazgo: string;
    accionRecomendada: string;
    aspectoEvaluado: string;
  }) => void;
}

export const InteractiveChecklist: React.FC<InteractiveChecklistProps> = ({
  initialTopic = '',
  items,
  onChangeItems,
  onApplyFindings
}) => {
  const [topicInput, setTopicInput] = useState(initialTopic);
  const [showPresets, setShowPresets] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'gemini' | 'local' | null>(null);

  const handleGenerate = async (topicToUse?: string) => {
    const target = topicToUse || topicInput;
    if (!target.trim()) {
      alert('Por favor escriba lo que desea inspeccionar (ej: Andamios, Montacargas, Calderas, Sustancias Químicas).');
      return;
    }

    setIsGenerating(true);
    setGenerationSource(null);

    try {
      const result = await requestIntelligentChecklist(target);
      onChangeItems(result.items);
      setGenerationSource(result.source);
      if (topicToUse) {
        setTopicInput(topicToUse);
      }
    } catch (err) {
      const fallback = generateChecklistForTopic(target);
      onChangeItems(fallback);
      setGenerationSource('local');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateItemState = (id: string, nuevoEstado: EstadoInspeccion) => {
    const updated = items.map((it) => (it.id === id ? { ...it, estado: nuevoEstado } : it));
    onChangeItems(updated);
  };

  const startEditItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditText(item.criterio);
  };

  const saveEditItem = (id: string) => {
    if (!editText.trim()) return;
    const updated = items.map((it) => (it.id === id ? { ...it, criterio: editText.trim() } : it));
    onChangeItems(updated);
    setEditingItemId(null);
    setEditText('');
  };

  const handleUpdateItemObservacion = (id: string, obs: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, observacion: obs } : it));
    onChangeItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    onChangeItems(updated);
  };

  const handleAddNewItem = () => {
    const newItem: ChecklistItem = {
      id: `chk-custom-${Date.now()}`,
      criterio: 'Nuevo criterio de seguridad a evaluar en terreno',
      estado: 'Cumple',
      observacion: ''
    };
    onChangeItems([...items, newItem]);
    startEditItem(newItem);
  };

  // Calculations
  const total = items.length;
  const cumplen = items.filter((i) => i.estado === 'Cumple').length;
  const noCumplen = items.filter((i) => i.estado === 'No Cumple').length;
  const noAplica = items.filter((i) => i.estado === 'No Aplica').length;
  const evaluables = total - noAplica;
  const compliancePercent = evaluables > 0 ? Math.round((cumplen / evaluables) * 100) : 100;

  const handleApplyToInspection = () => {
    if (!onApplyFindings) return;

    const fallas = items.filter((i) => i.estado === 'No Cumple');
    const estadoGeneral: EstadoInspeccion = fallas.length > 0 ? 'No Cumple' : 'Cumple';

    let hallazgo = '';
    let accion = '';

    if (fallas.length > 0) {
      hallazgo = `Se detectaron ${fallas.length} no conformidades en checklist de "${topicInput || 'Inspección'}":\n` +
        fallas.map((f, idx) => `• ${f.criterio}${f.observacion ? ` [Nota: ${f.observacion}]` : ''}`).join('\n');

      accion = `Subsanar de inmediato las ${fallas.length} desviaciones identificadas en el checklist de "${topicInput || 'la inspección'}": ` +
        fallas.map((f) => f.criterio.split(':')[0]).join(', ') + '.';
    } else {
      hallazgo = `Checklist 100% conforme. Todos los ${cumplen} puntos de control evaluados para "${topicInput || 'Inspección'}" cumplen satisfactoriamente con la normativa de seguridad.`;
      accion = `Mantener inspecciones preventivas periódicas y el orden del área para "${topicInput || 'este equipo'}".`;
    }

    onApplyFindings({
      estadoGeneral,
      hallazgo,
      accionRecomendada: accion,
      aspectoEvaluado: topicInput || 'Inspección Asistida con Checklist'
    });
  };

  return (
    <div className="space-y-4 bg-linear-to-b from-amber-50/60 via-white to-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-sm">
      {/* Top Generator Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>Generador Inmediato de Checklist de Inspección</span>
          </label>
          <div className="flex items-center gap-1.5">
            {generationSource === 'gemini' && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Gemini AI
              </span>
            )}
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              100% Modificable
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 mb-2">
          Escriba <strong>cualquier inspección que desee realizar</strong> (equipo, proceso, tarea o área) y la aplicación le ayudará de inmediato a generar y editar la lista de chequeo:
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="¿Qué desea inspeccionar? Ej: Calderas, Andamios, Montacargas, Soldadura, Químicos, Comedor..."
            className="flex-1 px-3.5 py-2.5 text-xs border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium text-slate-900 placeholder-slate-400 shadow-2xs"
          />
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => handleGenerate()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando Checklist...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Generar Checklist Inmediata
              </>
            )}
          </button>
        </div>

        {/* Preset topics dropdown toggle */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-amber-800 font-bold hover:underline flex items-center gap-1"
          >
            <span>Ver plantillas de inspección predefinidas ({PRESET_CHECKLIST_TEMPLATES.length})</span>
            {showPresets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-slate-400">Puede escribir cualquier tema personalizado</span>
        </div>

        {showPresets && (
          <div className="mt-2 p-2.5 bg-white rounded-xl border border-amber-200 shadow-xs flex flex-wrap gap-1.5">
            {PRESET_CHECKLIST_TEMPLATES.map((tpl) => (
              <button
                key={tpl.topic}
                type="button"
                onClick={() => handleGenerate(tpl.topic)}
                className="text-[11px] px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition-colors font-medium"
              >
                {tpl.topic}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress & Compliance bar */}
      {total > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Resultado de Verificación:
              </span>
              <span
                className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                  compliancePercent >= 90
                    ? 'bg-emerald-100 text-emerald-800'
                    : compliancePercent >= 70
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {compliancePercent}% Conforme
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> {cumplen} Cumple
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <XCircle className="w-3.5 h-3.5" /> {noCumplen} No Cumple
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <MinusCircle className="w-3.5 h-3.5" /> {noAplica} N/A
              </span>
            </div>
          </div>

          {/* Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(cumplen / total) * 100}%` }}
              className="bg-emerald-500 h-full transition-all duration-300"
            />
            <div
              style={{ width: `${(noCumplen / total) * 100}%` }}
              className="bg-rose-500 h-full transition-all duration-300"
            />
            <div
              style={{ width: `${(noAplica / total) * 100}%` }}
              className="bg-slate-300 h-full transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Checklist items list */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-amber-300">
            <CheckSquare className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No hay lista de chequeo generada aún</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Escriba arriba lo que desea inspeccionar y presione "Generar Checklist Inmediata".
            </p>
          </div>
        ) : (
          items.map((item, index) => {
            const isEditing = editingItemId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.estado === 'No Cumple'
                    ? 'bg-rose-50/50 border-rose-300 shadow-2xs'
                    : item.estado === 'Cumple'
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-white border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="text-xs font-mono font-bold text-slate-400 mt-0.5">
                      {String(index + 1).padStart(2, '0')}.
                    </span>

                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 text-xs border border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEditItem(item.id)}
                              className="px-2.5 py-1 text-xs font-bold bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-medium text-slate-900 leading-snug">
                            {item.criterio}
                          </p>

                          {/* Item observation input */}
                          <input
                            type="text"
                            value={item.observacion || ''}
                            onChange={(e) => handleUpdateItemObservacion(item.id, e.target.value)}
                            placeholder="Añadir nota o hallazgo específico de este punto..."
                            className="mt-1.5 w-full px-2 py-1 text-[11px] border border-slate-200 rounded-md bg-white/80 focus:bg-white focus:outline-none focus:border-amber-400 placeholder-slate-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this item */}
                  <div className="flex items-center gap-1">
                    {/* State selection buttons */}
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 gap-0.5">
                      {(['Cumple', 'No Cumple', 'No Aplica'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateItemState(item.id, st)}
                          title={`Marcar como ${st}`}
                          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                            item.estado === st
                              ? st === 'Cumple'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : st === 'No Cumple'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-800 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st === 'Cumple' ? '✓ Cumple' : st === 'No Cumple' ? '✕ Falla' : 'N/A'}
                        </button>
                      ))}
                    </div>

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startEditItem(item)}
                        title="Modificar texto del criterio"
                        className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Eliminar este punto"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom controls: Add item & Auto-apply to inspection */}
      <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={handleAddNewItem}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Nuevo Criterio a la Lista</span>
        </button>

        {onApplyFindings && items.length > 0 && (
          <button
            type="button"
            onClick={handleApplyToInspection}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md transition-all active:scale-98 w-full sm:w-auto justify-center"
          >
            <Wand2 className="w-4 h-4 text-emerald-200" />
            <span>Aplicar Checklist a Hallazgos y Acciones</span>
          </button>
        )}
      </div>
    </div>
  );
};
