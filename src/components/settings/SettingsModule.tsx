import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  Bell, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Check, 
  CheckCircle2, 
  Save, 
  RefreshCw 
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const [uslDefectRate, setUslDefectRate] = useState(2.0);
  const [temperatureThreshold, setTemperatureThreshold] = useState(40.0);
  const [vibrationThreshold, setVibrationThreshold] = useState(3.0);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [emailDigestFrequency, setEmailDigestFrequency] = useState('daily');
  const [complianceStandard, setComplianceStandard] = useState('ISO 9001:2015 & IATF 16949');
  const [retentionYears, setRetentionYears] = useState(7);
  const [opcUaEndpoint, setOpcUaEndpoint] = useState('opc.tcp://edge-gw-plant04.local:4840');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System configuration parameters persisted successfully!</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Quality Settings & Sensor Thresholds
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tune statistical tolerance limits, automated notification triggers, and edge PLC telemetry protocols
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        
        {/* Section 1: Statistical Process Control (SPC) Limits */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Statistical Process Control (SPC) & Alarm Trigger Limits
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                Defect Rate Upper Spec Limit (USL %):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={uslDefectRate}
                  onChange={(e) => setUslDefectRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-slate-400 font-mono">%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Breach triggers line hold warning</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                CNC Spindle Temp Limit (°C):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={temperatureThreshold}
                  onChange={(e) => setTemperatureThreshold(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-slate-400 font-mono">°C</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Triggers predictive thermal drift alert</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                Spindle Vibration Warning Limit:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={vibrationThreshold}
                  onChange={(e) => setVibrationThreshold(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-slate-400 font-mono">mm/s</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Accelerometer RMS vibration threshold</p>
            </div>
          </div>
        </div>

        {/* Section 2: Notifications & Shop Floor Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Alerts Dispatch & Escalation Protocols
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <div>
                <span className="font-semibold text-white block">SMS Push on Critical Breaches</span>
                <span className="text-[11px] text-slate-400">Instant OTP and SMS to on-call Quality Lead</span>
              </div>
              <button
                type="button"
                onClick={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  smsAlertsEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    smsAlertsEnabled ? 'translate-x-2' : '-translate-x-2'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <label className="font-semibold text-white block mb-1">Executive Digest Frequency</label>
              <select
                value={emailDigestFrequency}
                onChange={(e) => setEmailDigestFrequency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
              >
                <option value="shift">Per Shift Changeover (Every 8 hours)</option>
                <option value="daily">Daily Morning Executive Digest (07:00 AM)</option>
                <option value="weekly">Weekly Quality Assurance Summary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Compliance & Edge Device Connectivity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Compliance Standards & Edge Industrial Gateway
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                Active Quality Management Standard:
              </label>
              <select
                value={complianceStandard}
                onChange={(e) => setComplianceStandard(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="ISO 9001:2015 & IATF 16949">ISO 9001:2015 & IATF 16949 (Automotive)</option>
                <option value="AS9100D">AS9100D (Aerospace & Defense)</option>
                <option value="ISO 13485:2016">ISO 13485:2016 (Medical Devices)</option>
                <option value="FDA 21 CFR Part 820">FDA 21 CFR Part 820 Quality System Regulation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                Audit Records Retention Mandate:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={retentionYears}
                  onChange={(e) => setRetentionYears(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-slate-400 font-mono">Years</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
              OPC-UA / MQTT Edge Gateway Broker URL:
            </label>
            <input
              type="text"
              value={opcUaEndpoint}
              onChange={(e) => setOpcUaEndpoint(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        </div>

      </form>

    </div>
  );
};
