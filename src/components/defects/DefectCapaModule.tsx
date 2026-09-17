import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
import { 
  DefectRecord, 
  CapaRecord, 
  DefectStatus, 
  DefectSeverity 
} from '../../types';
import { 
  AlertOctagon, 
  Kanban, 
  Table as TableIcon, 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Paperclip, 
  BellRing, 
  ChevronRight, 
  X, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const DefectCapaModule: React.FC = () => {
  const { defects, capas, addDefect, updateDefectStatus, addCapa, updateCapaStatus } = useQuality();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeTabSub, setActiveTabSub] = useState<'defects' | 'capas'>('defects');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Modal states
  const [isNewDefectModalOpen, setIsNewDefectModalOpen] = useState(false);
  const [selectedDefectForCapa, setSelectedDefectForCapa] = useState<DefectRecord | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // New Defect Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBatchId, setNewBatchId] = useState('BATCH-NX-9942');
  const [newLineId, setNewLineId] = useState('Line 3');
  const [newPartName, setNewPartName] = useState('Spindle Housing (P/N: SH-401)');
  const [newSeverity, setNewSeverity] = useState<DefectSeverity>('Critical');
  const [newAssignee, setNewAssignee] = useState('Dave Miller (Lead Reliability Eng)');
  const [newDeadline, setNewDeadline] = useState('2026-09-22');
  const [newRootCause, setNewRootCause] = useState<DefectRecord['rootCauseCategory']>('Thermal Stress');
  const [newSeverityScale, setNewSeverityScale] = useState(8);
  const [newOccurrenceScale, setNewOccurrenceScale] = useState(7);
  const [newDetectionScale, setNewDetectionScale] = useState(4);
  const [newDescription, setNewDescription] = useState('');

  // CAPA Form State
  const [capaTitle, setCapaTitle] = useState('');
  const [capaRootCause, setCapaRootCause] = useState('');
  const [capaCorrective, setCapaCorrective] = useState('');
  const [capaPreventive, setCapaPreventive] = useState('');
  const [capaOwner, setCapaOwner] = useState('Dave Miller');
  const [capaDeadline, setCapaDeadline] = useState('2026-09-25');

  const kanbanColumns: { id: DefectStatus; label: string; color: string; bg: string }[] = [
    { id: 'Open', label: 'Open', color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-800/40' },
    { id: 'Investigation', label: 'Investigation', color: 'text-blue-400', bg: 'bg-blue-950/20 border-blue-800/40' },
    { id: 'Action Assigned', label: 'Action Assigned', color: 'text-purple-400', bg: 'bg-purple-950/20 border-purple-800/40' },
    { id: 'Closed', label: 'Closed & Verified', color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-800/40' },
  ];

  // Calculated RPN
  const calculatedRpn = newSeverityScale * newOccurrenceScale * newDetectionScale;

  const handleCreateDefect = (e: React.FormEvent) => {
    e.preventDefault();
    const createdId = addDefect({
      title: newTitle,
      batchId: newBatchId,
      lineId: newLineId,
      partName: newPartName,
      severity: newSeverity,
      status: 'Open',
      reportedBy: user?.name || 'Marcus Vance',
      assignedTo: newAssignee,
      deadline: newDeadline,
      rootCauseCategory: newRootCause,
      rpn: calculatedRpn,
      description: newDescription,
      attachments: ['spec_deviation_chart.png'],
    });

    setIsNewDefectModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    triggerReminderToast(`Defect ${createdId} created and dispatched to ${newAssignee}!`);
  };

  const handleOpenCapaModal = (defect: DefectRecord) => {
    setSelectedDefectForCapa(defect);
    setCapaTitle(`CAPA for ${defect.id}: ${defect.title}`);
    setCapaRootCause(defect.description);
    setCapaCorrective('Immediate quarantine of affected lot and tool replacement.');
    setCapaPreventive('Install automated telemetry interlock to prevent recurrence.');
    setCapaOwner(defect.assignedTo);
    setCapaDeadline(defect.deadline);
  };

  const handleSaveCapa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDefectForCapa) return;

    addCapa({
      defectId: selectedDefectForCapa.id,
      title: capaTitle,
      rootCauseAnalysis: capaRootCause,
      correctiveAction: capaCorrective,
      preventiveAction: capaPreventive,
      owner: capaOwner,
      deadline: capaDeadline,
      status: 'Action Assigned',
    });

    triggerReminderToast(`CAPA issued and assigned to ${capaOwner}! Automatic reminders scheduled.`);
    setSelectedDefectForCapa(null);
  };

  const triggerReminderToast = (msg: string) => {
    setReminderToast(msg);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Filtered defects
  const filteredDefects = defects.filter(d => {
    const matchesSeverity = severityFilter === 'all' || d.severity === severityFilter;
    const matchesSearch = 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.lineId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Simulation */}
      {reminderToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <BellRing className="w-5 h-5 text-indigo-400 animate-bounce shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-indigo-300 block">Notification Dispatched</span>
            <span className="text-slate-300">{reminderToast}</span>
          </div>
        </div>
      )}

      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-amber-400" />
              Defect & CAPA Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
              8D Framework
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track non-conformances from triage to root cause containment and preventive verification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tab switcher: Defects vs CAPA items */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex text-xs">
            <button
              onClick={() => setActiveTabSub('defects')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTabSub === 'defects' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Defects ({defects.length})
            </button>
            <button
              onClick={() => setActiveTabSub('capas')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTabSub === 'capas' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              CAPA Actions ({capas.length})
            </button>
          </div>

          {/* Kanban / Table view toggle */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table Grid View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsNewDefectModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log Defect</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defect title, ID, or part name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="Major">Major Only</option>
              <option value="Minor">Minor Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: DEFECTS */}
      {activeTabSub === 'defects' && (
        viewMode === 'kanban' ? (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kanbanColumns.map((col) => {
              const colDefects = filteredDefects.filter(d => d.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${col.color}`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {col.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {colDefects.length}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colDefects.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                        No issues in {col.label}
                      </div>
                    ) : (
                      colDefects.map((defect) => (
                        <div
                          key={defect.id}
                          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-3.5 text-xs transition-all shadow-md group"
                        >
                          {/* Card Top: ID & Severity */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="font-mono font-bold text-indigo-400 text-[11px]">
                              {defect.id}
                            </span>
                            <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                              defect.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              defect.severity === 'Major' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              {defect.severity}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-white text-xs leading-snug mb-1">
                            {defect.title}
                          </h3>

                          {/* Line and Part */}
                          <div className="text-[11px] text-slate-400 mb-2">
                            <span>{defect.lineId}</span> • <span className="text-slate-300">{defect.partName}</span>
                          </div>

                          {/* RPN and Root Cause Badge */}
                          <div className="flex items-center justify-between mb-3 text-[10px] font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                              RPN: <strong className={defect.rpn > 200 ? 'text-rose-400' : 'text-amber-400'}>{defect.rpn}</strong>
                            </span>
                            <span className="text-slate-400 truncate max-w-[110px]">
                              {defect.rootCauseCategory}
                            </span>
                          </div>

                          {/* Assignee & Deadline */}
                          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 truncate max-w-[120px]">
                              <User className="w-3 h-3 text-slate-400" />
                              {defect.assignedTo.split(' ')[0]}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {defect.deadline}
                            </span>
                          </div>

                          {/* Card Action footer: Advance status & CAPA */}
                          <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-1">
                            {defect.capaId ? (
                              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {defect.capaId}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenCapaModal(defect)}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
                              >
                                + Assign CAPA
                              </button>
                            )}

                            {/* Status mover */}
                            <div className="flex items-center gap-1">
                              {col.id === 'Open' && (
                                <button
                                  onClick={() => updateDefectStatus(defect.id, 'Investigation')}
                                  className="px-2 py-0.5 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-[10px]"
                                  title="Move to Investigation"
                                >
                                  Investigate →
                                </button>
                              )}
                              {col.id === 'Investigation' && (
                                <button
                                  onClick={() => updateDefectStatus(defect.id, 'Action Assigned')}
                                  className="px-2 py-0.5 rounded bg-purple-600/80 hover:bg-purple-600 text-white text-[10px]"
                                  title="Assign Action"
                                >
                                  Action →
                                </button>
                              )}
                              {col.id === 'Action Assigned' && (
                                <button
                                  onClick={() => updateDefectStatus(defect.id, 'Closed')}
                                  className="px-2 py-0.5 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white text-[10px]"
                                  title="Close & Verify"
                                >
                                  Close ✓
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View for Defects */
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Defect ID</th>
                  <th className="py-3 px-4">Title & Part</th>
                  <th className="py-3 px-4">Line</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">RPN</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredDefects.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{d.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{d.title}</span>
                      <span className="text-slate-400 text-[11px]">{d.partName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{d.lineId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.severity === 'Critical' ? 'bg-rose-950 text-rose-300' :
                        d.severity === 'Major' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {d.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{d.rpn}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{d.assignedTo}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{d.deadline}</td>
                    <td className="py-3 px-4 text-right">
                      {!d.capaId && (
                        <button
                          onClick={() => handleOpenCapaModal(d)}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          CAPA
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* SUB-VIEW 2: CAPA (Corrective & Preventive Actions) */}
      {activeTabSub === 'capas' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Corrective & Preventive Action Logs (CAPA - 8D Standard)
            </span>
            <span className="text-xs text-indigo-400 font-mono">
              IATF 16949 Clause 10.2
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {capas.map((capa) => (
              <div key={capa.id} className="p-5 hover:bg-slate-800/30 transition-colors text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-400 text-sm">{capa.id}</span>
                    <span className="text-slate-400">Linked to: <strong className="text-white font-mono">{capa.defectId}</strong></span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      capa.status === 'Closed' ? 'bg-emerald-950 text-emerald-300' : 'bg-purple-950 text-purple-300'
                    }`}>
                      {capa.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {capa.owner}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-amber-400">
                      <Calendar className="w-3.5 h-3.5" /> Due: {capa.deadline}
                    </span>
                    {capa.status !== 'Closed' && (
                      <button
                        onClick={() => {
                          updateCapaStatus(capa.id, 'Closed');
                          triggerReminderToast(`CAPA ${capa.id} marked Closed & Verified!`);
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                      >
                        Verify & Close
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-white text-sm">{capa.title}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Root Cause Analysis
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">{capa.rootCauseAnalysis}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      Corrective Action (Immediate)
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">{capa.correctiveAction}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-800/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                      Preventive Action (Permanent)
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">{capa.preventiveAction}</p>
                  </div>
                </div>

                {capa.verificationEvidence && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span><strong>Verification Audit:</strong> {capa.verificationEvidence}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Log New Defect */}
      {isNewDefectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Log New Defect & Non-Conformance</h2>
              </div>
              <button
                onClick={() => setIsNewDefectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDefect} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                  Defect Summary / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spindle Housing outer diameter exceeds drawing tolerance (+0.028mm)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                    Batch ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newBatchId}
                    onChange={(e) => setNewBatchId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                    Line #
                  </label>
                  <select
                    value={newLineId}
                    onChange={(e) => setNewLineId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Line 1">Line 1</option>
                    <option value="Line 2">Line 2</option>
                    <option value="Line 3">Line 3</option>
                    <option value="Line 4">Line 4</option>
                    <option value="Line 5">Line 5</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                    Severity Tier
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as DefectSeverity)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Critical">Critical (Stop Line)</option>
                    <option value="Major">Major (Containment Required)</option>
                    <option value="Minor">Minor (Rework Allowed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                    Part Name / Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                    Root Cause Hypothesis
                  </label>
                  <select
                    value={newRootCause}
                    onChange={(e) => setNewRootCause(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Tool Wear">Tool Wear & Chipping</option>
                    <option value="Thermal Stress">Thermal Stress & Expansion</option>
                    <option value="Material Contamination">Material Inclusions / Porosity</option>
                    <option value="Calibration Drift">Sensor / Tooling Calibration Drift</option>
                    <option value="Operator Technique">Operator Handling / Torque</option>
                    <option value="Component Flaw">Vendor Sub-tier Component Flaw</option>
                  </select>
                </div>
              </div>

              {/* RPN Calculator Slider Matrix */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase text-[11px]">
                    FMEA Risk Priority Number (RPN = S × O × D)
                  </span>
                  <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                    calculatedRpn > 200 ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    RPN: {calculatedRpn}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-[11px]">
                  <div>
                    <label className="text-slate-400 block mb-1">Severity (S: 1-10): {newSeverityScale}</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={newSeverityScale}
                      onChange={(e) => setNewSeverityScale(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Occurrence (O: 1-10): {newOccurrenceScale}</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={newOccurrenceScale}
                      onChange={(e) => setNewOccurrenceScale(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Detection (D: 1-10): {newDetectionScale}</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={newDetectionScale}
                      onChange={(e) => setNewDetectionScale(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                    Assignee (Owner)
                  </label>
                  <input
                    type="text"
                    required
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                    Mandatory Resolution Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[11px]">
                  Description & Non-Conformance Evidence
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Details of physical deviation, gauge reading, or visual flaw..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDefectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Create & Dispatch Defect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assign CAPA Action to Defect */}
      {selectedDefectForCapa && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                Initiate CAPA Investigation
              </h2>
              <button
                onClick={() => setSelectedDefectForCapa(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCapa} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                  CAPA Plan Title
                </label>
                <input
                  type="text"
                  required
                  value={capaTitle}
                  onChange={(e) => setCapaTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                  Root Cause Investigation (5-Why Conclusion)
                </label>
                <textarea
                  rows={2}
                  required
                  value={capaRootCause}
                  onChange={(e) => setCapaRootCause(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                  Immediate Corrective Action (Containment)
                </label>
                <textarea
                  rows={2}
                  required
                  value={capaCorrective}
                  onChange={(e) => setCapaCorrective(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                  Permanent Preventive Action (Poka-Yoke / Interlock)
                </label>
                <textarea
                  rows={2}
                  required
                  value={capaPreventive}
                  onChange={(e) => setCapaPreventive(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Designated Action Owner
                  </label>
                  <input
                    type="text"
                    required
                    value={capaOwner}
                    onChange={(e) => setCapaOwner(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Audit Verification Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={capaDeadline}
                    onChange={(e) => setCapaDeadline(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDefectForCapa(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Assign & Activate CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
