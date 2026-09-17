export type UserRole = 'Inspector' | 'Auditor' | 'Quality Manager' | 'Admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
}

export type InspectionType = 
  | 'First-Piece Approval' 
  | 'In-Process Line Audit' 
  | 'Final Quality Control' 
  | 'ISO 9001 Compliance' 
  | 'Packaging & Dispatch';

export type InspectionStatus = 'PASSED' | 'FAILED' | 'CONDITIONAL';

export interface ChecklistItem {
  id: string;
  criterion: string;
  specification: string;
  passed: boolean;
  critical: boolean;
  notes?: string;
}

export interface InspectionRecord {
  id: string;
  batchId: string;
  lineId: string;
  inspectionType: InspectionType;
  timestamp: string;
  inspectorName: string;
  inspectorRole: UserRole;
  checklist: ChecklistItem[];
  complianceScore: number;
  status: InspectionStatus;
  notes: string;
  photoUrls: string[];
  signatureDataUrl?: string;
}

export type DefectSeverity = 'Critical' | 'Major' | 'Minor';
export type DefectStatus = 'Open' | 'Investigation' | 'Action Assigned' | 'Closed';

export interface DefectRecord {
  id: string;
  title: string;
  batchId: string;
  lineId: string;
  partName: string;
  severity: DefectSeverity;
  status: DefectStatus;
  reportedBy: string;
  reportedAt: string;
  assignedTo: string;
  deadline: string;
  rootCauseCategory: 'Tool Wear' | 'Calibration Drift' | 'Material Contamination' | 'Thermal Stress' | 'Operator Technique' | 'Component Flaw';
  rpn: number; // Risk Priority Number (Severity x Occurrence x Detection)
  description: string;
  capaId?: string;
  attachments: string[];
  actionNotes?: string;
}

export interface CapaRecord {
  id: string;
  defectId: string;
  title: string;
  rootCauseAnalysis: string;
  correctiveAction: string;
  preventiveAction: string;
  owner: string;
  deadline: string;
  status: DefectStatus;
  verificationEvidence?: string;
  createdAt: string;
}

export interface QualityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  lineId: string;
  acknowledged: boolean;
  category: 'tolerance' | 'temperature' | 'defect_spike' | 'calibration';
}

export interface LineTelemetry {
  lineId: string;
  name: string;
  status: 'Operational' | 'Warning' | 'Halted';
  currentYield: number;
  defectRate: number;
  temperature: number; // in °C
  vibrationMmPerSec: number;
  hourlyDefectTrend: number[]; // defect rate % over past 8 hours
}

export interface HeatmapCell {
  line: string;
  part: string;
  defectCount: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export interface RolePermissions {
  read: boolean;
  write: boolean;
  approve: boolean;
  delete: boolean;
  export: boolean;
}

export type RbacMatrix = Record<UserRole, Record<string, RolePermissions>>;
