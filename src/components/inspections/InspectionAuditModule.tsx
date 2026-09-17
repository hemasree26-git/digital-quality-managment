import React, { useState, useRef } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
import { 
  InspectionRecord, 
  InspectionType, 
  InspectionStatus, 
  ChecklistItem 
} from '../../types';
import { INITIAL_CHECKLIST_TEMPLATE } from '../../data/mockData';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eraser, 
  Check, 
  X, 
  Eye, 
  FileText, 
  Camera, 
  Calendar, 
  Hash, 
  Download,
  Trash2
} from 'lucide-react';

export const InspectionAuditModule: React.FC = () => {
  const { inspections, addInspection } = useQuality();
  const { user } = useAuth();

  // Audit form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<InspectionRecord | null>(null);

  // Form State
  const [batchId, setBatchId] = useState(`BATCH-NX-${Math.floor(9950 + Math.random() * 50)}`);
  const [lineId, setLineId] = useState('Line 3');
  const [inspectionType, setInspectionType] = useState<InspectionType>('In-Process Line Audit');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    INITIAL_CHECKLIST_TEMPLATE.map(c => ({ ...c, passed: true }))
  );
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  ]);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureName, setSignatureName] = useState(user?.name || 'Marcus Vance');

  // Search & Filters for inspection logs
  const [filterLine, setFilterLine] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Canvas ref for signature pad
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Auto-calculated compliance score
  const passedItemsCount = checklist.filter(c => c.passed).length;
  const complianceScore = Math.round((passedItemsCount / checklist.length) * 100);
  const calculatedStatus: InspectionStatus = 
    complianceScore === 100 ? 'PASSED' : complianceScore >= 80 ? 'CONDITIONAL' : 'FAILED';

  // Toggle checklist item
  const handleToggleItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, passed: !item.passed } : item
      )
    );
  };

  const handleUpdateItemNotes = (id: string, itemNotes: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, notes: itemNotes } : item
      )
    );
  };

  // Canvas Signature Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  // Photo upload simulator
  const handlePhotoUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Simulate reading image
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setUploadedPhotos(prev => [...prev, uploadEvent.target!.result as string]);
      }
    };
    reader.readAsDataURL(files[0]);
  };

  const addSampleDefectPhoto = () => {
    const samplePics = [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    ];
    const pick = samplePics[Math.floor(Math.random() * samplePics.length)];
    setUploadedPhotos(prev => [...prev, pick]);
  };

  // Submit Audit Form
  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();

    addInspection({
      batchId,
      lineId,
      inspectionType,
      inspectorName: signatureName,
      inspectorRole: user?.role || 'Inspector',
      checklist,
      complianceScore,
      status: calculatedStatus,
      notes: notes || 'Inspection completed via digital checklist protocol.',
      photoUrls: uploadedPhotos,
      signatureDataUrl: signatureData || undefined,
    });

    setIsModalOpen(false);
    // Reset form
    setBatchId(`BATCH-NX-${Math.floor(9950 + Math.random() * 50)}`);
    setNotes('');
    setChecklist(INITIAL_CHECKLIST_TEMPLATE.map(c => ({ ...c, passed: true })));
    setSignatureData(null);
  };

  // Filtered Inspections list
  const filteredInspections = inspections.filter(ins => {
    const matchesLine = filterLine === 'all' || ins.lineId === filterLine;
    const matchesStatus = filterStatus === 'all' || ins.status === filterStatus;
    const matchesSearch = 
      ins.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLine && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-400" />
            Digital Inspections & Shop Floor Audits
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conduct first-piece, in-process, and final QC audits with automated compliance scoring and digital signatures
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Conduct Digital Audit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Batch # or Inspector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Line Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Line:</span>
            <select
              value={filterLine}
              onChange={(e) => setFilterLine(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Lines</option>
              <option value="Line 1">Line 1</option>
              <option value="Line 2">Line 2</option>
              <option value="Line 3">Line 3</option>
              <option value="Line 4">Line 4</option>
              <option value="Line 5">Line 5</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="PASSED">Passed Only</option>
              <option value="FAILED">Failed Only</option>
              <option value="CONDITIONAL">Conditional</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historical Audits Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recorded Inspection Logs ({filteredInspections.length})
          </span>
          <span className="text-xs text-slate-400">
            ISO 9001:2015 Clause 8.6 Release of Products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Batch / Lot #</th>
                <th className="py-3 px-4">Line</th>
                <th className="py-3 px-4">Inspection Type</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No inspection records found matching current query.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {ins.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {ins.batchId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                        {ins.lineId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {ins.inspectionType}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {ins.inspectorName}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {ins.timestamp}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold ${
                        ins.complianceScore === 100 ? 'text-emerald-400' :
                        ins.complianceScore >= 80 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {ins.complianceScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ins.status === 'PASSED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : ins.status === 'CONDITIONAL'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {ins.status === 'PASSED' ? <CheckCircle2 className="w-3 h-3" /> :
                         ins.status === 'CONDITIONAL' ? <AlertTriangle className="w-3 h-3" /> :
                         <XCircle className="w-3 h-3" />}
                        {ins.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewingRecord(ins)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Digital Audit Checklist Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Digital Quality Audit Form</h2>
                  <p className="text-xs text-slate-400">Standard Operating Procedure SOP-QC-402</p>
                </div>
              </div>

              {/* Auto Compliance Score Banner */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Live Score
                  </span>
                  <span className={`text-base font-mono font-bold ${
                    complianceScore === 100 ? 'text-emerald-400' :
                    complianceScore >= 80 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {complianceScore}% ({calculatedStatus})
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmitAudit} className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Batch & Line Details Form Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                    Batch / Lot ID
                  </label>
                  <input
                    type="text"
                    required
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                    Production Line #
                  </label>
                  <select
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Line 1">Line 1 (Turning & Milling)</option>
                    <option value="Line 2">Line 2 (Gear Hobbing)</option>
                    <option value="Line 3">Line 3 (High-Speed CNC)</option>
                    <option value="Line 4">Line 4 (Sub-Assembly)</option>
                    <option value="Line 5">Line 5 (Surface Treatment)</option>
                    <option value="Line 6">Line 6 (Final Pack)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                    Inspection Type
                  </label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value as InspectionType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="First-Piece Approval">First-Piece Approval</option>
                    <option value="In-Process Line Audit">In-Process Line Audit</option>
                    <option value="Final Quality Control">Final Quality Control</option>
                    <option value="ISO 9001 Compliance">ISO 9001 Compliance</option>
                    <option value="Packaging & Dispatch">Packaging & Dispatch</option>
                  </select>
                </div>
              </div>

              {/* Digital Checklist Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-800/80 px-4 py-2.5 flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    Inspection Criteria & Verification Matrix
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {passedItemsCount} of {checklist.length} Passed
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 bg-slate-900/60">
                  {checklist.map((item) => (
                    <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-xs">{item.criterion}</span>
                          {item.critical && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{item.specification}</p>
                      </div>

                      {/* Pass / Fail Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            item.passed
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30'
                              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/30'
                          }`}
                        >
                          {item.passed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>PASS</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>FAIL</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Upload Dropzone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                    Photo Verification & Evidence Dropzone
                  </label>
                  <button
                    type="button"
                    onClick={addSampleDefectPhoto}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    + Attach Sample QC Image
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-800/30 transition-colors">
                  <input
                    type="file"
                    id="audit-file-upload"
                    accept="image/*"
                    onChange={handlePhotoUploadSim}
                    className="hidden"
                  />
                  <label
                    htmlFor="audit-file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center py-2"
                  >
                    <UploadCloud className="w-8 h-8 text-indigo-400 mb-1" />
                    <span className="text-xs font-semibold text-white">
                      Click to upload photos or drag and drop
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PNG, JPG up to 10MB (caliper reads, surface macroscopy, markings)
                    </span>
                  </label>
                </div>

                {/* Uploaded Photos Preview Thumbnails */}
                {uploadedPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-3">
                    {uploadedPhotos.map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 w-20 h-20">
                        <img src={url} alt="QC Evidence" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Digital Signature Pad */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                    Inspector Digital Signature Pad
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                  >
                    <Eraser className="w-3 h-3" /> Clear Signature
                  </button>
                </div>

                <div className="border border-slate-700 rounded-xl bg-slate-950 p-2 relative">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={100}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-24 bg-slate-950 rounded cursor-crosshair touch-none"
                  />
                  {!signatureData && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 text-xs italic">
                      Sign with mouse or stylus on touch screen here...
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Signing Inspector: <strong className="text-slate-200">{signatureName}</strong>
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    21 CFR Part 11 Electronic Signature Compliant
                  </span>
                </div>
              </div>

              {/* Audit Findings & Remedial Notes */}
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                  Inspector Notes & Remarks
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record any tooling deviations, ambient temperature, or corrective adjustments made..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Digital Audit</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: View Inspection Audit Details */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white text-sm">
                  Inspection Record: {viewingRecord.id}
                </span>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Batch</span>
                  <span className="font-bold text-white">{viewingRecord.batchId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Line</span>
                  <span className="font-bold text-white">{viewingRecord.lineId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Score</span>
                  <span className="font-bold text-emerald-400">{viewingRecord.complianceScore}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status</span>
                  <span className="font-bold text-indigo-400">{viewingRecord.status}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2 uppercase text-[11px] tracking-wider">
                  Checklist Breakdown
                </h3>
                <div className="space-y-1.5 border border-slate-800 rounded-xl p-3 bg-slate-950/40">
                  {viewingRecord.checklist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-0">
                      <span className="text-slate-300">{item.criterion}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        item.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {item.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {viewingRecord.photoUrls.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2 uppercase text-[11px] tracking-wider">
                    Attached Evidence Photos
                  </h3>
                  <div className="flex gap-2">
                    {viewingRecord.photoUrls.map((url, i) => (
                      <img key={i} src={url} alt="QC" className="w-24 h-24 rounded-lg object-cover border border-slate-700" />
                    ))}
                  </div>
                </div>
              )}

              {viewingRecord.signatureDataUrl && (
                <div>
                  <h3 className="font-semibold text-white mb-1 uppercase text-[11px] tracking-wider">
                    Digitally Signed By: {viewingRecord.inspectorName}
                  </h3>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 inline-block">
                    <img src={viewingRecord.signatureDataUrl} alt="Signature" className="h-16 object-contain" />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Remarks</span>
                <p className="text-slate-300 text-xs leading-relaxed">{viewingRecord.notes}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
