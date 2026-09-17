import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Flame, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  ChevronRight, 
  Info,
  Wrench,
  Search
} from 'lucide-react';
import { PARETO_DEFECT_CATEGORIES } from '../../data/mockData';
import { HeatmapCell } from '../../types';

export const AiAnalyticsModule: React.FC = () => {
  const { heatmap, telemetry, defects, capas, setActiveTab } = useQuality();

  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [activeTab, setActiveTabFilter] = useState<'all' | 'pareto' | 'heatmap' | 'ai-rca'>('all');
  
  // Interactive AI RCA Generator state
  const [analyzingDefectId, setAnalyzingDefectId] = useState<string>('DEF-4091');
  const [isGeneratingAiRca, setIsGeneratingAiRca] = useState<boolean>(false);
  const [aiRcaOutput, setAiRcaOutput] = useState<{
    rootCause5Why: string[];
    containmentAction: string;
    permanentCountermeasure: string;
    ishikawaCategory: string;
  } | null>({
    rootCause5Why: [
      '1. Why did the bore diameter exceed 0.015mm tolerance? -> Spindle housing expanded by 0.032mm during cycle #440.',
      '2. Why did the spindle expand? -> Coolant fluid reached 42°C (exceeding 24°C nominal design).',
      '3. Why was the coolant overheating? -> Auxiliary refrigeration unit compressor tripped on high pressure.',
      '4. Why did the compressor trip? -> Secondary condenser fan intake was clogged with particulate mist.',
      '5. Root Cause: Lack of automated differential pressure sensor and preventative airflow filter cleaning schedule on CNC chiller unit.',
    ],
    containmentAction: 'Immediately throttle cutting feed rate by 20% and activate portable secondary vortex chillers on Line 3.',
    permanentCountermeasure: 'Install IoT temperature transducer connected directly to CNC feed-hold circuit; schedule weekly ultrasonic radiator wash.',
    ishikawaCategory: 'Machine & Environment (Thermal Equilibrium Drift)',
  });

  const parts = ['Chassis Housing', 'Spindle Shaft', 'Sensor Bracket', 'Bearing Race', 'Fasteners M6'];
  const lines = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'];

  // Run AI RCA generation simulation (or enhanced generation)
  const handleGenerateAiRca = (defectId: string) => {
    setAnalyzingDefectId(defectId);
    setIsGeneratingAiRca(true);

    const targetDefect = defects.find(d => d.id === defectId) || defects[0];

    setTimeout(() => {
      setIsGeneratingAiRca(false);
      if (targetDefect.rootCauseCategory === 'Material Contamination') {
        setAiRcaOutput({
          rootCause5Why: [
            '1. Why did the gear pinions show surface cracking under Eddy current inspection? -> Non-metallic micro-inclusions in core steel.',
            '2. Why were inclusions present? -> Ingot casting at tier-2 forge had incomplete vacuum degassing.',
            '3. Why was degassing cut short? -> Mill supervisor accelerated furnace tap to fulfill backlog shipment.',
            '4. Why was this not caught at receiving? -> Standard inbound inspection used destructive sampling on only 1 bar in 200.',
            '5. Root Cause: Supplier quality agreement lacked mandatory ultrasonic immersion NDT certificate with serial heat mapping.',
          ],
          containmentAction: 'Quarantine all remaining 45 tons of bar stock batch #ST-110 and issue global Stop-Ship order for affected lots.',
          permanentCountermeasure: 'Implement Supplier Quality Assurance (SQA) mandate requiring ultrasonic NDT C-scan for every incoming billet.',
          ishikawaCategory: 'Material (Raw Ingot Purity Deficit)',
        });
      } else {
        setAiRcaOutput({
          rootCause5Why: [
            `1. Why did ${targetDefect.partName} experience defect? -> Exceeded operating tolerance on ${targetDefect.lineId}.`,
            `2. Why was parameter out of spec? -> Secondary vibration induced micro-misalignment of machine datum.`,
            `3. Why did vibration increase? -> Harmonic resonance at 3,200 RPM during tool plunge cycle.`,
            `4. Why was harmonic resonance unchecked? -> Damping pads worn beyond 50% compressive fatigue limit.`,
            `5. Root Cause: Dynamic machine maintenance cycle based on calendar days rather than continuous accelerometer spindle cycles.`,
          ],
          containmentAction: 'Re-zero machine work coordinates and inspect fixture clamping pressure.',
          permanentCountermeasure: 'Deploy vibration sensor telemetry with automated alarm when root-mean-square vibration exceeds 2.5 mm/s.',
          ishikawaCategory: 'Method & Machine Dynamics',
        });
      }
    }, 700);
  };

  const getHeatmapColor = (level: HeatmapCell['riskLevel']) => {
    switch (level) {
      case 'critical':
        return 'bg-rose-600/90 text-white hover:bg-rose-500 font-bold border-rose-500/50';
      case 'high':
        return 'bg-amber-600/80 text-white hover:bg-amber-500 font-semibold border-amber-500/40';
      case 'moderate':
        return 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/80 border-amber-800/40';
      case 'low':
      default:
        return 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 border-slate-700/40';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: AI Prediction Banner with Probability & Warning */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border border-rose-800/70 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-900/90 text-rose-200 border border-rose-700">
                  CRITICAL AI PREDICTIVE ALERT
                </span>
                <span className="text-xs text-rose-300 font-mono">Confidence: 94.2%</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Warning: Line 3 shows a 78% probability of dimensional tolerance breach within 4 hours
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                Real-time thermal sensor gradient on spindle housing (+14°C above baseline) indicates non-linear thermal drift on high-speed CNC cutting. Early containment recommended before batch BATCH-NX-9941 is compromised.
              </p>
            </div>
          </div>

          {/* Action recommendation buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('defects');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Initiate CAPA Containment</span>
            </button>

            <button
              onClick={() => handleGenerateAiRca('DEF-4091')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulate AI RCA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Defect Heatmap + Pareto Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Heatmap Grid (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                Defect Heatmap Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Visual recurring failure intensity across production lines & manufactured components
              </p>
            </div>

            {/* Risk Legend */}
            <div className="flex items-center gap-2 text-[10px] font-medium">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" /> Low
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2.5 h-2.5 rounded bg-amber-950 border border-amber-800" /> Mod
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded bg-amber-600" /> High
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-600" /> Critical
              </span>
            </div>
          </div>

          {/* Interactive Heatmap Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                    Line / Component
                  </th>
                  {parts.map((p) => (
                    <th key={p} className="p-2 font-semibold text-slate-300 text-[11px]">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lines.map((l) => (
                  <tr key={l}>
                    <td className="p-2 text-left font-bold text-white font-mono text-[11px] whitespace-nowrap">
                      {l}
                    </td>
                    {parts.map((p) => {
                      const cell = heatmap.find(h => h.line === l && h.part === p) || {
                        line: l,
                        part: p,
                        defectCount: 2,
                        riskLevel: 'low',
                      };
                      return (
                        <td key={p} className="p-1">
                          <button
                            onClick={() => setSelectedCell(cell)}
                            className={`w-full py-2.5 px-2 rounded-lg border text-xs transition-all transform hover:scale-105 ${getHeatmapColor(
                              cell.riskLevel
                            )}`}
                            title={`${l} - ${p}: ${cell.defectCount} recorded defects`}
                          >
                            <span className="font-mono">{cell.defectCount}</span>
                            <span className="block text-[9px] opacity-80 uppercase">
                              {cell.riskLevel}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Critical clusters detected on Line 2 (Bearing Race) & Line 3 (Spindle Shaft)</span>
            <span className="text-indigo-400 font-mono text-[11px]">Updated 5m ago via MES API</span>
          </div>
        </div>

        {/* Pareto Root Cause Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Pareto Root Cause Analysis (80/20)
                </h2>
                <p className="text-xs text-slate-400">
                  Top drivers accounting for 80% of aggregate defects
                </p>
              </div>
            </div>

            {/* Pareto Chart Bars with Cumulative Line */}
            <div className="space-y-3 mt-2">
              {PARETO_DEFECT_CATEGORIES.map((item, idx) => {
                const is80Cutoff = item.cumulative <= 80.0;
                return (
                  <div key={item.category} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200 flex items-center gap-1.5">
                        <span className="font-mono text-slate-500 font-bold">#{idx + 1}</span>
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-white font-bold">{item.count} defects</span>
                        <span className="text-indigo-400 font-bold">({item.cumulative.toFixed(1)}% cum.)</span>
                      </div>
                    </div>

                    <div className="relative w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          is80Cutoff ? 'bg-indigo-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Focusing on Tool Wear & Thermal Drift eliminates 64.5% of defects.
            </span>
          </div>
        </div>

      </div>

      {/* AI Smart Root Cause Analysis (5-Why & Ishikawa Fishbone Generator) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Root Cause Investigation Engine (5-Why & Ishikawa)
            </h2>
            <p className="text-xs text-slate-400">
              Deep machine learning synthesis grounded in manufacturing telemetry & ISO-14224 failure modes
            </p>
          </div>

          {/* Select defect to analyze */}
          <div className="flex items-center gap-2">
            <select
              value={analyzingDefectId}
              onChange={(e) => handleGenerateAiRca(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer"
            >
              {defects.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id}: {d.partName} ({d.severity})
                </option>
              ))}
            </select>

            <button
              onClick={() => handleGenerateAiRca(analyzingDefectId)}
              disabled={isGeneratingAiRca}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAiRca ? 'animate-spin' : ''}`} />
              <span>Re-Analyze</span>
            </button>
          </div>
        </div>

        {aiRcaOutput && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            
            {/* 5-Whys Chain (7 cols) */}
            <div className="lg:col-span-7 space-y-2.5">
              <span className="font-semibold text-indigo-300 uppercase tracking-wider text-[11px] block">
                Iterative 5-Why Causal Tree:
              </span>

              <div className="space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-950/60">
                {aiRcaOutput.rootCause5Why.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className={idx === 4 ? 'text-amber-300 font-semibold' : ''}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ishikawa & Recommended Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Ishikawa Primary Branch
                </span>
                <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                  {aiRcaOutput.ishikawaCategory}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Immediate Containment (24h)
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {aiRcaOutput.containmentAction}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Permanent Corrective Action (CAPA)
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {aiRcaOutput.permanentCountermeasure}
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Detail Modal for Clicked Heatmap Cell */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                Cell Drilldown: {selectedCell.line} • {selectedCell.part}
              </h3>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Defect Count</span>
                <span className="text-lg font-bold font-mono text-white">{selectedCell.defectCount} incidents</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Risk Tier</span>
                <span className={`text-lg font-bold uppercase font-mono ${
                  selectedCell.riskLevel === 'critical' ? 'text-rose-400' :
                  selectedCell.riskLevel === 'high' ? 'text-amber-400' : 'text-slate-300'
                }`}>
                  {selectedCell.riskLevel}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Historical trends indicate recurring tolerances drift during second-shift tool changeovers. Ultrasonic inspection and feed override limits recommended.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCell(null);
                  setActiveTab('defects');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                View Linked Defects
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
