import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Sparkles, 
  Clock, 
  Thermometer, 
  Sliders, 
  Check, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

export const MainDashboard: React.FC = () => {
  const { 
    metrics, 
    telemetry, 
    alerts, 
    acknowledgeAlert, 
    setActiveTab 
  } = useQuality();

  const [selectedShift, setSelectedShift] = useState<'shift1' | 'shift2' | 'shift3'>('shift1');
  const [activeLineFilter, setActiveLineFilter] = useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{ hour: number; line: string; rate: number } | null>(null);

  // Shifts time labels (8 hours each)
  const shiftHours = selectedShift === 'shift1' 
    ? ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00']
    : selectedShift === 'shift2'
    ? ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
    : ['22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00'];

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  // Line colors for multi-line chart
  const lineColors: Record<string, { stroke: string; fill: string; name: string }> = {
    'Line 1': { stroke: '#6366f1', fill: '#818cf8', name: 'Line 1 (Turning & Milling)' },
    'Line 2': { stroke: '#f43f5e', fill: '#fb7185', name: 'Line 2 (Gear Hobbing)' },
    'Line 3': { stroke: '#f59e0b', fill: '#fbbf24', name: 'Line 3 (High-Speed CNC)' },
    'Line 4': { stroke: '#10b981', fill: '#34d399', name: 'Line 4 (Sub-Assembly)' },
  };

  // SVG Chart Geometry
  const chartWidth = 700;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 35;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  const maxRate = 10; // 0% to 10% defect rate scale

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Shift Operational Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Real-Time Quality Operations
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Stream
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Plant Unit 04 • Continuous SPC monitoring across 6 machining cells
          </p>
        </div>

        {/* Quick Shift Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex text-xs">
            <button
              onClick={() => setSelectedShift('shift1')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedShift === 'shift1' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Morning (Shift 1)
            </button>
            <button
              onClick={() => setSelectedShift('shift2')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedShift === 'shift2' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Evening (Shift 2)
            </button>
            <button
              onClick={() => setSelectedShift('shift3')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedShift === 'shift3' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Night (Shift 3)
            </button>
          </div>

          <button
            onClick={() => setActiveTab('inspections')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>New Audit</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards with Trend Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Inspections */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Inspections</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.totalInspections}</span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12.4% vs yday
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {metrics.passedInspections} Passed
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <XCircle className="w-3.5 h-3.5" /> {metrics.failedInspections} Failed
            </span>
          </div>
        </div>

        {/* KPI 2: Active Complaints */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Complaints</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.activeComplaints}</span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              <TrendingDown className="w-3 h-3 mr-0.5" /> -18.2% this mo
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>5 RMA investigations</span>
            <span className="text-amber-400">2 Inbound SCAR</span>
          </div>
        </div>

        {/* KPI 3: Open Defect Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Open Defect Rate</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.openDefectRate}%</span>
            <span className="text-xs text-rose-400 flex items-center font-medium">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +0.4% spike on L2
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Target Threshold: &lt; 2.0%</span>
            <span className="text-amber-400 font-medium">Upper Spec Limit</span>
          </div>
        </div>

        {/* KPI 4: Pending CAPA Items */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending CAPA Items</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.pendingCapaCount}</span>
            <span className="text-xs text-slate-400">
              Across 3 lines
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="text-amber-400 font-medium">1 Due in 48h</span>
            <button
              onClick={() => setActiveTab('capa')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: Real-Time Quality Status Chart + Live Alerts Feed Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-Time Quality Status Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Real-Time Quality Status Chart
                </h2>
                <p className="text-xs text-slate-400">
                  Defect rate percentage (%) over 8-hour shift cycle per active production line
                </p>
              </div>

              {/* Line Legend & Filter */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => setActiveLineFilter('all')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeLineFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All Lines
                </button>
                {['Line 1', 'Line 2', 'Line 3', 'Line 4'].map((lineKey) => (
                  <button
                    key={lineKey}
                    onClick={() => setActiveLineFilter(lineKey)}
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                      activeLineFilter === lineKey
                        ? 'bg-slate-700 text-white font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: lineColors[lineKey]?.stroke }}
                    />
                    {lineKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Multi-Line SVG Chart */}
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto min-w-[500px]"
              >
                {/* Horizontal Grid Lines */}
                {[0, 2.5, 5.0, 7.5, 10.0].map((val) => {
                  const y = paddingTop + plotHeight - (val / maxRate) * plotHeight;
                  return (
                    <g key={val}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#334155"
                        strokeDasharray={val === 2.0 ? '4 2' : '2 2'}
                        strokeWidth={val === 2.0 ? '1.5' : '1'}
                        opacity={val === 2.0 ? 0.8 : 0.3}
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {val.toFixed(1)}%
                      </text>
                    </g>
                  );
                })}

                {/* Target Threshold Line (2.0%) */}
                <line
                  x1={paddingLeft}
                  y1={paddingTop + plotHeight - (2.0 / maxRate) * plotHeight}
                  x2={chartWidth - paddingRight}
                  y2={paddingTop + plotHeight - (2.0 / maxRate) * plotHeight}
                  stroke="#ef4444"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  opacity="0.7"
                />
                <text
                  x={chartWidth - paddingRight - 10}
                  y={paddingTop + plotHeight - (2.0 / maxRate) * plotHeight - 4}
                  fill="#f87171"
                  fontSize="9"
                  textAnchor="end"
                  fontWeight="600"
                >
                  USL 2.0% Spec Threshold
                </text>

                {/* Time Axis (Shift Hours) */}
                {shiftHours.map((hour, idx) => {
                  const x = paddingLeft + (idx / (shiftHours.length - 1)) * plotWidth;
                  return (
                    <g key={hour}>
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={chartHeight - paddingBottom}
                        stroke="#334155"
                        strokeDasharray="2 2"
                        opacity="0.2"
                      />
                      <text
                        x={x}
                        y={chartHeight - 12}
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {hour}
                      </text>
                    </g>
                  );
                })}

                {/* Line Series Paths */}
                {telemetry
                  .filter(t => ['Line 1', 'Line 2', 'Line 3', 'Line 4'].includes(t.lineId))
                  .filter(t => activeLineFilter === 'all' || activeLineFilter === t.lineId)
                  .map((t) => {
                    const color = lineColors[t.lineId] || { stroke: '#94a3b8', fill: '#cbd5e1' };
                    const points = t.hourlyDefectTrend.map((rate, idx) => {
                      const x = paddingLeft + (idx / (shiftHours.length - 1)) * plotWidth;
                      const y = paddingTop + plotHeight - (rate / maxRate) * plotHeight;
                      return { x, y, rate, hour: idx };
                    });

                    const pathD = points.reduce((acc, pt, idx) => {
                      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                    }, '');

                    return (
                      <g key={t.lineId}>
                        {/* Glow outline */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={color.stroke}
                          strokeWidth="3.5"
                          opacity="0.2"
                        />
                        {/* Main line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={color.stroke}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Interactive Data Dots */}
                        {points.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r={hoveredPoint?.line === t.lineId && hoveredPoint?.hour === idx ? 6 : 3.5}
                            fill={color.stroke}
                            stroke="#0f172a"
                            strokeWidth="1.5"
                            className="cursor-pointer transition-all hover:scale-125"
                            onMouseEnter={() => setHoveredPoint({ hour: idx, line: t.lineId, rate: pt.rate })}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        ))}
                      </g>
                    );
                  })}
              </svg>

              {/* Tooltip Hover Overlay */}
              {hoveredPoint && (
                <div className="absolute top-2 right-4 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-xs shadow-xl pointer-events-none z-10 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: lineColors[hoveredPoint.line]?.stroke }}
                  />
                  <span className="font-semibold text-white">{hoveredPoint.line}</span>
                  <span className="text-slate-400">at {shiftHours[hoveredPoint.hour]}:</span>
                  <span className="font-mono font-bold text-amber-400">{hoveredPoint.rate.toFixed(1)}% defect rate</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Line Telemetry Status Chips */}
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {telemetry.slice(0, 4).map((t) => (
              <div key={t.lineId} className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{t.lineId}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                    t.status === 'Operational' ? 'bg-emerald-950 text-emerald-300' :
                    t.status === 'Warning' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Yield: <strong className="text-slate-200">{t.currentYield}%</strong></span>
                  <span>Defect: <strong className="text-rose-400">{t.defectRate}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Alerts Feed Ticker (1 Column) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <h2 className="text-base font-bold text-white">Live Alerts Feed</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-rose-950/80 text-rose-300 border border-rose-800/60">
                {unacknowledgedAlerts.length} Unresolved
              </span>
            </div>

            {/* Alert items list */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border transition-all ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/20 border-rose-900/60'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/20 border-amber-900/60'
                      : 'bg-slate-800/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        alert.severity === 'critical' ? 'bg-rose-500' :
                        alert.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                      <span className="font-semibold text-xs text-white leading-tight">
                        {alert.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{alert.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                    <span className="font-mono text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded">
                      {alert.lineId}
                    </span>

                    <div className="flex items-center gap-2">
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-colors"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <Check className="w-3 h-3" /> Acknowledged
                        </span>
                      )}

                      <button
                        onClick={() => {
                          if (alert.category === 'defect_spike') setActiveTab('defects');
                          else if (alert.category === 'temperature') setActiveTab('ai-analytics');
                          else setActiveTab('capa');
                        }}
                        className="text-slate-400 hover:text-white p-1"
                        title="Investigate Root Cause"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Automated Recommendation Bar */}
          <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-indigo-200">AI Quality Co-Pilot:</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Thermal compensation recommended on Line 3. Predicted 14% defect reduction upon auxiliary chiller trigger.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Production Lines Overview Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Production Line Cell Health</h2>
            <p className="text-xs text-slate-400">Continuous edge sensor status: Temperature, Spindle Vibration & Yield</p>
          </div>
          <button
            onClick={() => setActiveTab('ai-analytics')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View Defect Heatmap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {telemetry.map((t) => (
            <div
              key={t.lineId}
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{t.lineId}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      t.status === 'Operational' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      t.status === 'Warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.name}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Yield</span>
                  <span className="font-mono font-bold text-white">{t.currentYield}%</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Temp</span>
                  <span className={`font-mono font-bold ${t.temperature > 40 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {t.temperature}°C
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Vibration</span>
                  <span className="font-mono font-bold text-slate-200">{t.vibrationMmPerSec} mm/s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
