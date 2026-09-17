import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Filter, 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  X,
  Share2
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { inspections, defects, capas, metrics } = useQuality();

  const [dateRange, setDateRange] = useState('7d');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedFailureType, setSelectedFailureType] = useState('all');
  const [previewPdfOpen, setPreviewPdfOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Filtered dataset for reporting
  const filteredInspections = inspections.filter(ins => {
    if (selectedDept !== 'all' && ins.lineId !== selectedDept) return false;
    return true;
  });

  const filteredDefects = defects.filter(def => {
    if (selectedDept !== 'all' && def.lineId !== selectedDept) return false;
    if (selectedFailureType !== 'all' && def.rootCauseCategory !== selectedFailureType) return false;
    return true;
  });

  // Real browser CSV export
  const exportCsv = (type: 'inspections' | 'defects') => {
    let csvContent = '';
    let filename = '';

    if (type === 'inspections') {
      csvContent = 'Audit ID,Batch ID,Line,Type,Inspector,Timestamp,Compliance Score,Status\n';
      filteredInspections.forEach(ins => {
        csvContent += `"${ins.id}","${ins.batchId}","${ins.lineId}","${ins.inspectionType}","${ins.inspectorName}","${ins.timestamp}",${ins.complianceScore}%,"${ins.status}"\n`;
      });
      filename = `DQM_Inspections_Report_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      csvContent = 'Defect ID,Title,Batch,Line,Part Name,Severity,Status,Assignee,Deadline,Root Cause,RPN\n';
      filteredDefects.forEach(def => {
        csvContent += `"${def.id}","${def.title}","${def.batchId}","${def.lineId}","${def.partName}","${def.severity}","${def.status}","${def.assignedTo}","${def.deadline}","${def.rootCauseCategory}",${def.rpn}\n`;
      });
      filename = `DQM_Defects_CAPA_Report_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Exported ${filename} successfully!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Download Alert Toast */}
      {downloadSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Quality Audits & Compliance Reporting
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate executive compliance summaries, statistical process control digests, and CSV/PDF records
          </p>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportCsv('inspections')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Inspections (CSV)</span>
          </button>

          <button
            onClick={() => exportCsv('defects')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Defects (CSV)</span>
          </button>

          <button
            onClick={() => setPreviewPdfOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Executive Summary PDF</span>
          </button>
        </div>
      </div>

      {/* Reporting Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs">
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Date Range:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="24h">Last 24 Hours (Current Shift)</option>
            <option value="7d">Last 7 Days (Weekly Audit)</option>
            <option value="30d">Last 30 Days (Monthly ISO Review)</option>
            <option value="90d">Last Quarter (Q3 2026)</option>
          </select>
        </div>

        {/* Department / Line Selector */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Department / Line:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments (Entire Plant)</option>
            <option value="Line 1">Turning & Milling (Line 1)</option>
            <option value="Line 2">Gear Hobbing (Line 2)</option>
            <option value="Line 3">CNC Machining (Line 3)</option>
            <option value="Line 4">Robotic Assembly (Line 4)</option>
            <option value="Line 5">Surface Finishing (Line 5)</option>
          </select>
        </div>

        {/* Failure Type Selector */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Failure Category:</span>
          <select
            value={selectedFailureType}
            onChange={(e) => setSelectedFailureType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Failure Modes</option>
            <option value="Tool Wear">Tool Wear & Chipping</option>
            <option value="Thermal Stress">Thermal Stress & Drift</option>
            <option value="Material Contamination">Material Inclusions / Porosity</option>
            <option value="Calibration Drift">Calibration & Sensor Drift</option>
            <option value="Operator Technique">Operator Torque Technique</option>
          </select>
        </div>

      </div>

      {/* Summary KPI Cards for Report View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-medium">Report Scope Inspections</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{filteredInspections.length}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {Math.round((filteredInspections.filter(i => i.status === 'PASSED').length / (filteredInspections.length || 1)) * 100)}% Pass Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            ISO 9001 Clause 8.6 release sign-offs recorded in chosen timeframe.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-medium">Logged Non-Conformances</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{filteredDefects.length}</span>
            <span className="text-xs text-amber-400 font-medium">
              Avg RPN: {Math.round(filteredDefects.reduce((a, b) => a + b.rpn, 0) / (filteredDefects.length || 1))}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Defects flagged for containment & engineering review.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-medium">CAPA Resolution Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {Math.round((capas.filter(c => c.status === 'Closed').length / (capas.length || 1)) * 100)}%
            </span>
            <span className="text-xs text-indigo-400 font-medium">
              {capas.filter(c => c.status === 'Closed').length} of {capas.length} Closed
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Average turnaround: 4.2 days per 8D containment protocol.
          </p>
        </div>
      </div>

      {/* Generated Report Data Preview Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Filtered Inspection & Audit Log Snapshot ({filteredInspections.length} Records)
            </span>
            <span className="text-[11px] text-slate-400">
              Ready for regulatory dispatch to Quality Assurance Committee
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Batch #</th>
                <th className="py-3 px-4">Line</th>
                <th className="py-3 px-4">Audit Type</th>
                <th className="py-3 px-4">Compliance Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Lead Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredInspections.map((ins) => (
                <tr key={ins.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{ins.id}</td>
                  <td className="py-3 px-4 font-semibold text-white">{ins.batchId}</td>
                  <td className="py-3 px-4 font-mono">{ins.lineId}</td>
                  <td className="py-3 px-4 text-slate-300">{ins.inspectionType}</td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={ins.complianceScore === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                      {ins.complianceScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ins.status === 'PASSED' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {ins.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{ins.inspectorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Executive Quality Summary PDF Preview */}
      {previewPdfOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Top Bar */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white text-sm">
                  Executive Quality Summary Report • ISO 9001:2015 Audit Digest
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPreviewPdfOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formatted Print Preview Paper */}
            <div className="p-8 overflow-y-auto bg-slate-950 text-slate-100 space-y-6 text-xs font-sans">
              
              {/* Paper Header */}
              <div className="border-b border-slate-800 pb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    DIGITAL QUALITY MANAGEMENT (DQM)
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Plant Operations Division • Plant 04 Sector B
                  </p>
                  <span className="text-[10px] font-mono text-indigo-400">
                    Doc ID: DQM-EXEC-2026-Q3-0917 • Rev 2.1
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                  <div>Date: <strong className="text-slate-200">17-Sep-2026</strong></div>
                  <div>Standard: <strong className="text-slate-200">IATF 16949 / ISO 9001</strong></div>
                  <div>Auditor: <strong className="text-slate-200">Elena Rostova, CQM</strong></div>
                </div>
              </div>

              {/* Executive Summary Narrative */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-slate-300 text-xs mb-2">
                  1. Executive Quality Summary & Risk Assessment
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  During the evaluated reporting interval, Plant 04 operated at a cumulative yield of <strong>98.4%</strong> with an open defect rate of <strong>2.4%</strong>. Critical dimensional non-conformance was contained on Line 3 (High-Speed CNC) through real-time thermal drift alerts, preventing an estimated $42,000 in scraped titanium alloy forgings. CAPA actions for tool wear life and raw material porosity are progressing within target cycle thresholds.
                </p>
              </div>

              {/* Statistical Metrics Breakdown */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-slate-300 text-xs mb-2">
                  2. Key Quality Metrics Digest
                </h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Inspections Conducted</span>
                    <span className="text-lg font-bold font-mono text-white">{inspections.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Pass Rate</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {Math.round((inspections.filter(i => i.status === 'PASSED').length / inspections.length) * 100)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Active Open Defects</span>
                    <span className="text-lg font-bold font-mono text-amber-400">
                      {defects.filter(d => d.status !== 'Closed').length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Verified CAPA Closures</span>
                    <span className="text-lg font-bold font-mono text-indigo-400">
                      {capas.filter(c => c.status === 'Closed').length} / {capas.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table of Open Critical Defects */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-slate-300 text-xs mb-2">
                  3. Critical Defect & CAPA Containment Status
                </h3>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2">Defect ID</th>
                        <th className="p-2">Line</th>
                        <th className="p-2">Issue Summary</th>
                        <th className="p-2">Root Cause</th>
                        <th className="p-2">Owner</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {defects.slice(0, 3).map((d) => (
                        <tr key={d.id}>
                          <td className="p-2 font-mono font-bold text-indigo-400">{d.id}</td>
                          <td className="p-2 font-mono">{d.lineId}</td>
                          <td className="p-2 font-medium text-white">{d.title}</td>
                          <td className="p-2 text-slate-400">{d.rootCauseCategory}</td>
                          <td className="p-2">{d.assignedTo.split(' ')[0]}</td>
                          <td className="p-2 font-semibold text-amber-400">{d.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formal Signatures & Sign-off */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-6 text-[11px]">
                <div>
                  <span className="text-slate-400 block mb-3">Prepared By:</span>
                  <div className="font-serif italic text-sm text-indigo-300">Marcus Vance</div>
                  <div className="text-slate-400 text-[10px]">Senior Quality Inspector</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-3">Quality Assurance Sign-off:</span>
                  <div className="font-serif italic text-sm text-indigo-300">Sarah Lin, CQE</div>
                  <div className="text-slate-400 text-[10px]">Head of Quality Engineering</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-3">Plant Director Approval:</span>
                  <div className="font-serif italic text-sm text-indigo-300">Alexandre DuPont</div>
                  <div className="text-slate-400 text-[10px]">Operations Vice President</div>
                </div>
              </div>

            </div>

            {/* Modal Bottom Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Simulated Automated PDF Export Engine • DQM v3.4
              </span>
              <button
                onClick={() => setPreviewPdfOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
