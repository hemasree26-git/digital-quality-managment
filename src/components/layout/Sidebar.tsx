import React from 'react';
import { useQuality, NavTab } from '../../context/QualityContext';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  AlertOctagon, 
  BrainCircuit, 
  ShieldAlert, 
  Users, 
  Settings, 
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, defects, capas, alerts } = useQuality();

  const openDefectsCount = defects.filter(d => d.status !== 'Closed').length;
  const pendingCapaCount = capas.filter(c => c.status !== 'Closed').length;
  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inspections', label: 'Inspections & Audits', icon: ClipboardCheck },
    { 
      id: 'defects', 
      label: 'Defect & Issue Tracking', 
      icon: AlertOctagon, 
      badge: openDefectsCount, 
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
    },
    { id: 'ai-analytics', label: 'AI Insights & Analytics', icon: BrainCircuit },
    { 
      id: 'capa', 
      label: 'Alerts & CAPA Management', 
      icon: ShieldAlert, 
      badge: pendingCapaCount, 
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
    },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'rbac', label: 'User Access & Controls', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Header / Branding in Sidebar */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-600/30">
                Q
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  DQM Workspace
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Plant Unit 04 • Sector B
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plant Health & Status Footer */}
        <div className="p-4 m-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Plant Yield
            </span>
            <span className="font-mono font-bold text-emerald-400 text-xs">98.4%</span>
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98.4%' }} />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" /> ISO 9001
            </span>
            <span className="font-mono text-slate-300">Audited 16-Sep</span>
          </div>
        </div>

      </aside>
    </>
  );
};
