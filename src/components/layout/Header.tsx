import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuality, NavTab } from '../../context/QualityContext';
import { UserRole } from '../../types';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  LogOut, 
  Check, 
  AlertTriangle,
  FileText,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebarMobile }) => {
  const { user, logout, switchRole } = useAuth();
  const { 
    alerts, 
    acknowledgeAlert, 
    globalSearch, 
    setGlobalSearch, 
    theme, 
    toggleTheme,
    setActiveTab,
    inspections,
    defects
  } = useQuality();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadAlerts = alerts.filter(a => !a.acknowledged);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const matchingInspections = globalSearch.trim() 
    ? inspections.filter(i => 
        i.id.toLowerCase().includes(globalSearch.toLowerCase()) || 
        i.batchId.toLowerCase().includes(globalSearch.toLowerCase()) ||
        i.lineId.toLowerCase().includes(globalSearch.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingDefects = globalSearch.trim()
    ? defects.filter(d =>
        d.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
        d.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
        d.partName.toLowerCase().includes(globalSearch.toLowerCase())
      ).slice(0, 3)
    : [];

  const handleSelectSearchItem = (tab: NavTab) => {
    setActiveTab(tab);
    setSearchResultsOpen(false);
    setGlobalSearch('');
  };

  const roles: UserRole[] = ['Inspector', 'Auditor', 'Quality Manager', 'Admin'];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left branding & mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white hidden sm:inline">
                Digital Quality Management
              </span>
              <span className="font-bold text-base tracking-tight text-white sm:hidden">
                DQM
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                PROD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative max-w-md w-full mx-4 hidden md:block" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Batch #, Defect ID, or Line (e.g. BATCH-NX, Line 3)..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setSearchResultsOpen(true);
            }}
            onFocus={() => setSearchResultsOpen(true)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 text-slate-400 hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResultsOpen && globalSearch.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 text-xs z-50">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Search Results
            </div>

            {matchingInspections.length === 0 && matchingDefects.length === 0 ? (
              <div className="p-3 text-slate-400 text-center">
                No matching inspection batches or defect records found.
              </div>
            ) : (
              <div className="space-y-1">
                {matchingInspections.map((ins) => (
                  <button
                    key={ins.id}
                    onClick={() => handleSelectSearchItem('inspections')}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <div>
                        <span className="font-semibold text-white">{ins.batchId}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({ins.lineId})</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      ins.status === 'PASSED' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {ins.status}
                    </span>
                  </button>
                ))}

                {matchingDefects.map((def) => (
                  <button
                    key={def.id}
                    onClick={() => handleSelectSearchItem('defects')}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <span className="font-semibold text-white">{def.id}: {def.title.slice(0, 32)}...</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({def.lineId})</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                      {def.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right controls: Role Switcher, Notifications, Theme, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Interactive Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-all"
            title="Switch User Role"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 hidden sm:inline">Role:</span>
            <span className="font-semibold text-white">{user?.role || 'Quality Manager'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Active Role
              </div>
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      user?.role === r 
                        ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{r}</span>
                    {user?.role === r && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 px-2 text-[11px] text-slate-400">
                Switches view permissions & authorized actions.
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell with unread counter */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 relative transition-all"
            aria-label="Alerts and Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Live System Alerts ({unreadAlerts.length} Active)
                </span>
                <button
                  onClick={() => {
                    alerts.forEach(a => acknowledgeAlert(a.id));
                  }}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Ack All
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No active quality alerts.</p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-2.5 rounded-lg border transition-all ${
                        alert.severity === 'critical'
                          ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                          : alert.severity === 'warning'
                          ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-white flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-400'
                          }`} />
                          {alert.title}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{alert.description}</p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-300">
                          {alert.lineId}
                        </span>
                        {!alert.acknowledged ? (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-2 py-0.5 text-[10px] rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" /> Acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Workspace`}
          aria-label="Toggle light or dark theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* User profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <img
            src={user?.avatarUrl}
            alt={user?.name}
            className="w-8 h-8 rounded-xl object-cover border border-slate-700"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{user?.department}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors ml-1"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
