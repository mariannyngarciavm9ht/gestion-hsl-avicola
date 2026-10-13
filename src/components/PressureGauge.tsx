import React from 'react';
import { Gauge, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

interface PressureGaugeProps {
  psi: number;
  interactive?: boolean;
  onChange?: (newPsi: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const PressureGauge: React.FC<PressureGaugeProps> = ({
  psi = 150,
  interactive = false,
  onChange,
  size = 'md'
}) => {
  // Range is 0 to 300 PSI
  // Angle: -120 deg (0 PSI) to +120 deg (300 PSI) -> total 240 deg span
  const minPsi = 0;
  const maxPsi = 300;
  const clampedPsi = Math.max(minPsi, Math.min(maxPsi, psi));

  const percent = clampedPsi / maxPsi;
  const needleAngle = -120 + percent * 240;

  const isLow = clampedPsi < 100;
  const isNormal = clampedPsi >= 100 && clampedPsi <= 195;
  const isHigh = clampedPsi > 195;

  const statusColor = isNormal 
    ? 'text-emerald-700 bg-emerald-50 border-emerald-300' 
    : isLow 
    ? 'text-amber-800 bg-amber-50 border-amber-300' 
    : 'text-rose-800 bg-rose-50 border-rose-300';

  const statusLabel = isNormal 
    ? 'Presión Óptima (Zona Verde)' 
    : isLow 
    ? 'Baja Presión (Recargar)' 
    : 'Sobrepresión (Peligro)';

  const presets = [
    { label: 'Baja (75 PSI)', value: 75, color: 'hover:bg-amber-100 text-amber-900 border-amber-200' },
    { label: 'Normal (150 PSI)', value: 150, color: 'hover:bg-emerald-100 text-emerald-900 border-emerald-300' },
    { label: 'Sobrepresión (220 PSI)', value: 220, color: 'hover:bg-rose-100 text-rose-900 border-rose-300' }
  ];

  const dimension = size === 'sm' ? 120 : size === 'lg' ? 220 : 170;

  return (
    <div className="flex flex-col items-center select-none">
      {/* SVG Dial */}
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full drop-shadow-sm"
        >
          {/* Metallic Outer Ring */}
          <circle cx="100" cy="100" r="92" fill="#1e293b" />
          <circle cx="100" cy="100" r="88" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          
          {/* Zone Arcs */}
          {/* Yellow Zone (0-100 PSI): -120 to -40 deg */}
          <path
            d="M 33 138 A 78 78 0 0 1 50 50"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Green Zone (100-195 PSI): -40 to +36 deg */}
          <path
            d="M 50 50 A 78 78 0 0 1 146 50"
            fill="none"
            stroke="#10b981"
            strokeWidth="16"
          />

          {/* Red Zone (195-300 PSI): +36 to +120 deg */}
          <path
            d="M 146 50 A 78 78 0 0 1 167 138"
            fill="none"
            stroke="#ef4444"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Inner ticks & markings */}
          <text x="35" y="152" fontSize="9" fontWeight="bold" fill="#78350f" textAnchor="middle">0</text>
          <text x="50" y="38" fontSize="9" fontWeight="bold" fill="#047857" textAnchor="middle">100</text>
          <text x="100" y="30" fontSize="10" fontWeight="bold" fill="#065f46" textAnchor="middle">150 PSI</text>
          <text x="150" y="38" fontSize="9" fontWeight="bold" fill="#b91c1c" textAnchor="middle">200</text>
          <text x="165" y="152" fontSize="9" fontWeight="bold" fill="#991b1b" textAnchor="middle">300</text>

          {/* Center text brand */}
          <text x="100" y="130" fontSize="8" fontWeight="600" fill="#64748b" textAnchor="middle" letterSpacing="0.05em">
            MANÓMETRO EHS
          </text>
          <text x="100" y="142" fontSize="11" fontWeight="bold" fill="#0f172a" textAnchor="middle" fontFamily="monospace">
            {clampedPsi} PSI
          </text>

          {/* Needle */}
          <g 
            transform={`rotate(${needleAngle} 100 100)`}
            className="transition-transform duration-300 ease-out"
          >
            {/* Needle shape */}
            <polygon points="98,100 102,100 101,28 99,28" fill="#dc2626" />
            <polygon points="99,28 101,28 100,22" fill="#ef4444" />
            {/* Counterweight */}
            <circle cx="100" cy="112" r="5" fill="#475569" />
          </g>

          {/* Center Hub Nut */}
          <circle cx="100" cy="100" r="8" fill="#1e293b" />
          <circle cx="100" cy="100" r="4" fill="#e2e8f0" />
        </svg>
      </div>

      {/* Numerical Badge */}
      <div className={`mt-2 px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 shadow-2xs ${statusColor}`}>
        {isNormal ? (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        ) : isLow ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        ) : (
          <Flame className="w-3.5 h-3.5 text-rose-600" />
        )}
        <span>{clampedPsi} PSI · {statusLabel}</span>
      </div>

      {/* Interactive Controls if editable */}
      {interactive && onChange && (
        <div className="w-full mt-3 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500">0</span>
            <input
              type="range"
              min={0}
              max={300}
              step={5}
              value={clampedPsi}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <span className="text-[11px] font-semibold text-slate-500">300</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.value)}
                className={`text-[10px] font-semibold px-2 py-1 rounded border bg-white transition-colors ${preset.color}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
