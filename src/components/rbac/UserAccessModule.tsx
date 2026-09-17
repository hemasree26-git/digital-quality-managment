import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  SlidersHorizontal,
  Key,
  Info
} from 'lucide-react';
import { DEFAULT_RBAC_MATRIX } from '../../data/mockData';

export const UserAccessModule: React.FC = () => {
  const { rbacMatrix, toggleRbacPermission } = useQuality();
  const { user, switchRole } = useAuth();

  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>(user?.role || 'Quality Manager');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const roles: UserRole[] = ['Inspector', 'Auditor', 'Quality Manager', 'Admin'];

  const modules = [
    'Inspections & Audits',
    'Defects & Issues',
    'CAPA Management',
    'AI Analytics',
    'Reports & Export',
    'User Management',
  ];

  const roleDescriptions: Record<UserRole, string> = {
    'Inspector': 'Floor personnel responsible for conducting digital audits, logging deviations, and uploading physical photographic evidence.',
    'Auditor': 'Internal or external compliance officers performing ISO-9001 certification assessments, review sign-offs, and compliance scoring.',
    'Quality Manager': 'Lead quality engineers overseeing plant-wide SPC metrics, authorizing CAPA root-cause assignments, and closing corrective actions.',
    'Admin': 'Plant systems administrators with root permissions across user provisioning, role assignments, and edge IoT telemetry integrations.',
  };

  const handleToggle = (module: string, permKey: 'read' | 'write' | 'approve' | 'delete' | 'export') => {
    toggleRbacPermission(selectedRoleTab, module, permKey);
    setSaveToast(`Updated ${selectedRoleTab} permission for ${module} (${permKey})`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-950 border border-indigo-500 text-indigo-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Role-Based Access Control (RBAC) Matrix
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              ISO 27001 / FDA 21 CFR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure granular Read, Write, Approve, Delete, and Export authorization policies per operational profile
          </p>
        </div>

        {/* Current User Active Role Status */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-xs">
          <Key className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Your Current Role:</span>
          <span className="font-bold text-white font-mono">{user?.role}</span>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRoleTab(role)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRoleTab === role
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{role}</span>
            {user?.role === role && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" title="You are currently signed in as this role" />
            )}
          </button>
        ))}
      </div>

      {/* Role Description Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Profile Scope: {selectedRoleTab}
            </span>
            {user?.role !== selectedRoleTab && (
              <button
                onClick={() => switchRole(selectedRoleTab)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline ml-2"
              >
                Switch to this role for testing
              </button>
            )}
          </div>
          <p className="text-slate-400 leading-relaxed">
            {roleDescriptions[selectedRoleTab]}
          </p>
        </div>
      </div>

      {/* Interactive RBAC Permission Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Authorization Privileges for: <strong className="text-white">{selectedRoleTab}</strong>
          </span>
          <span className="text-xs text-slate-400">
            Click switches to toggle permission live
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">System Module</th>
                <th className="py-3.5 px-4 text-center">Read</th>
                <th className="py-3.5 px-4 text-center">Write / Create</th>
                <th className="py-3.5 px-4 text-center">Approve / Sign</th>
                <th className="py-3.5 px-4 text-center">Delete / Void</th>
                <th className="py-3.5 px-4 text-center">Export Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {modules.map((mod) => {
                const perms = rbacMatrix[selectedRoleTab]?.[mod] || {
                  read: false,
                  write: false,
                  approve: false,
                  delete: false,
                  export: false,
                };

                const permKeys: ('read' | 'write' | 'approve' | 'delete' | 'export')[] = [
                  'read',
                  'write',
                  'approve',
                  'delete',
                  'export',
                ];

                return (
                  <tr key={mod} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-semibold text-white">
                      {mod}
                    </td>

                    {permKeys.map((key) => {
                      const isGranted = perms[key];
                      return (
                        <td key={key} className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(mod, key)}
                            className={`inline-flex items-center justify-center w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                              isGranted ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
                            }`}
                            title={`Toggle ${key} on ${mod}`}
                          >
                            <span
                              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                isGranted ? 'translate-x-2' : '-translate-x-2'
                              }`}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Role Simulation Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {roles.map((r) => (
          <div
            key={r}
            className={`p-4 rounded-xl border text-xs transition-all ${
              user?.role === r 
                ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40' 
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white">{r}</span>
              {user?.role === r ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-600 text-white font-bold">
                  ACTIVE
                </span>
              ) : (
                <button
                  onClick={() => switchRole(r)}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  Switch
                </button>
              )}
            </div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div>Audits: <strong className="text-slate-200">{rbacMatrix[r]?.['Inspections & Audits']?.write ? 'Create + Sign' : 'View Only'}</strong></div>
              <div>Defects: <strong className="text-slate-200">{rbacMatrix[r]?.['Defects & Issues']?.approve ? 'Approve Closure' : 'Report'}</strong></div>
              <div>CAPA: <strong className="text-slate-200">{rbacMatrix[r]?.['CAPA Management']?.approve ? 'Authorizer' : 'Collaborator'}</strong></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
