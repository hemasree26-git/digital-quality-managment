import React, { createContext, useContext, useState } from 'react';
import { 
  InspectionRecord, 
  DefectRecord, 
  CapaRecord, 
  QualityAlert, 
  LineTelemetry, 
  HeatmapCell, 
  RbacMatrix,
  UserRole,
  DefectStatus,
} from '../types';
import { 
  INITIAL_INSPECTIONS, 
  INITIAL_DEFECTS, 
  INITIAL_CAPAS, 
  INITIAL_ALERTS, 
  LINE_TELEMETRY_DATA, 
  HEATMAP_DATA, 
  DEFAULT_RBAC_MATRIX 
} from '../data/mockData';

export type NavTab = 
  | 'dashboard' 
  | 'inspections' 
  | 'defects' 
  | 'ai-analytics' 
  | 'capa' 
  | 'reports' 
  | 'rbac' 
  | 'settings';

interface QualityContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  inspections: InspectionRecord[];
  defects: DefectRecord[];
  capas: CapaRecord[];
  alerts: QualityAlert[];
  telemetry: LineTelemetry[];
  heatmap: HeatmapCell[];
  rbacMatrix: RbacMatrix;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Actions
  addInspection: (record: Omit<InspectionRecord, 'id' | 'timestamp'>) => void;
  addDefect: (defect: Omit<DefectRecord, 'id' | 'reportedAt'>) => string;
  updateDefectStatus: (defectId: string, status: DefectStatus) => void;
  addCapa: (capa: Omit<CapaRecord, 'id' | 'createdAt'>) => void;
  updateCapaStatus: (capaId: string, status: DefectStatus) => void;
  acknowledgeAlert: (alertId: string) => void;
  toggleRbacPermission: (role: UserRole, module: string, permKey: 'read' | 'write' | 'approve' | 'delete' | 'export') => void;
  
  // Stats
  metrics: {
    totalInspections: number;
    passedInspections: number;
    failedInspections: number;
    activeComplaints: number;
    openDefectRate: number;
    pendingCapaCount: number;
  };
}

const QualityContext = createContext<QualityContextType | undefined>(undefined);

export const QualityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [inspections, setInspections] = useState<InspectionRecord[]>(INITIAL_INSPECTIONS);
  const [defects, setDefects] = useState<DefectRecord[]>(INITIAL_DEFECTS);
  const [capas, setCapas] = useState<CapaRecord[]>(INITIAL_CAPAS);
  const [alerts, setAlerts] = useState<QualityAlert[]>(INITIAL_ALERTS);
  const [telemetry, setTelemetry] = useState<LineTelemetry[]>(LINE_TELEMETRY_DATA);
  const [heatmap] = useState<HeatmapCell[]>(HEATMAP_DATA);
  const [rbacMatrix, setRbacMatrix] = useState<RbacMatrix>(DEFAULT_RBAC_MATRIX);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addInspection = (record: Omit<InspectionRecord, 'id' | 'timestamp'>) => {
    const newId = `INS-2026-${Math.floor(882 + inspections.length)}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const newRecord: InspectionRecord = {
      ...record,
      id: newId,
      timestamp: formattedDate,
    };
    setInspections(prev => [newRecord, ...prev]);

    // If inspection failed, also add an alert or defect prompt
    if (record.status === 'FAILED') {
      const alertId = `ALT-${Math.floor(105 + alerts.length)}`;
      setAlerts(prev => [
        {
          id: alertId,
          title: `Quality Breach on ${record.lineId}: ${record.batchId}`,
          description: `Inspection ${newId} marked FAILED with compliance score ${record.complianceScore}%.`,
          severity: 'critical',
          timestamp: 'Just now',
          lineId: record.lineId,
          acknowledged: false,
          category: 'defect_spike',
        },
        ...prev,
      ]);
    }
  };

  const addDefect = (defect: Omit<DefectRecord, 'id' | 'reportedAt'>): string => {
    const newId = `DEF-${Math.floor(4092 + defects.length)}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newDefect: DefectRecord = {
      ...defect,
      id: newId,
      reportedAt: formattedDate,
    };
    setDefects(prev => [newDefect, ...prev]);

    if (defect.severity === 'Critical') {
      setAlerts(prev => [
        {
          id: `ALT-${Math.floor(200 + alerts.length)}`,
          title: `Critical Defect Logged: ${newId}`,
          description: `${defect.title} (${defect.partName}) reported on ${defect.lineId}. RPN: ${defect.rpn}`,
          severity: 'critical',
          timestamp: 'Just now',
          lineId: defect.lineId,
          acknowledged: false,
          category: 'tolerance',
        },
        ...prev
      ]);
    }

    return newId;
  };

  const updateDefectStatus = (defectId: string, status: DefectStatus) => {
    setDefects(prev => prev.map(d => d.id === defectId ? { ...d, status } : d));
  };

  const addCapa = (capa: Omit<CapaRecord, 'id' | 'createdAt'>) => {
    const newId = `CAPA-2026-${String(45 + capas.length).padStart(3, '0')}`;
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];

    const newCapa: CapaRecord = {
      ...capa,
      id: newId,
      createdAt: formattedDate,
    };

    setCapas(prev => [newCapa, ...prev]);

    // Update corresponding defect if present
    if (capa.defectId) {
      setDefects(prev => prev.map(d => d.id === capa.defectId ? { ...d, capaId: newId, status: 'Action Assigned' } : d));
    }
  };

  const updateCapaStatus = (capaId: string, status: DefectStatus) => {
    setCapas(prev => prev.map(c => c.id === capaId ? { ...c, status } : c));
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const toggleRbacPermission = (
    role: UserRole, 
    module: string, 
    permKey: 'read' | 'write' | 'approve' | 'delete' | 'export'
  ) => {
    setRbacMatrix(prev => {
      const currentRole = prev[role] || {};
      const currentModule = currentRole[module] || { read: false, write: false, approve: false, delete: false, export: false };
      return {
        ...prev,
        [role]: {
          ...currentRole,
          [module]: {
            ...currentModule,
            [permKey]: !currentModule[permKey],
          },
        },
      };
    });
  };

  // Derived metrics
  const passedInspections = inspections.filter(i => i.status === 'PASSED').length;
  const failedInspections = inspections.filter(i => i.status === 'FAILED').length;
  const openDefects = defects.filter(d => d.status === 'Open' || d.status === 'Investigation');
  const openDefectRate = 2.4; // % overall plant rate
  const pendingCapaCount = capas.filter(c => c.status !== 'Closed').length;

  return (
    <QualityContext.Provider
      value={{
        activeTab,
        setActiveTab,
        inspections,
        defects,
        capas,
        alerts,
        telemetry,
        heatmap,
        rbacMatrix,
        globalSearch,
        setGlobalSearch,
        theme,
        toggleTheme,
        addInspection,
        addDefect,
        updateDefectStatus,
        addCapa,
        updateCapaStatus,
        acknowledgeAlert,
        toggleRbacPermission,
        metrics: {
          totalInspections: inspections.length,
          passedInspections,
          failedInspections,
          activeComplaints: 7, // 7 customer warranty/field reports
          openDefectRate,
          pendingCapaCount,
        },
      }}
    >
      {children}
    </QualityContext.Provider>
  );
};

export const useQuality = () => {
  const ctx = useContext(QualityContext);
  if (!ctx) {
    throw new Error('useQuality must be used within a QualityProvider');
  }
  return ctx;
};
