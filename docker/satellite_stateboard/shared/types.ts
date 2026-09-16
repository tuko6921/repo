/**
 * Shared types for the Satellite Stateboard application
 * Design: Aerospace Command Center - Technical precision and operational clarity
 */

// Ship data structure
export interface Ship {
  id: string;
  name: string;
  class: number; // 0-10 classification
  hullNumber: string;
  crest?: string; // URL to ship crest image
  description?: string;
}

// Terminal types and configurations
export type TerminalType = 'UHF' | 'VHF' | 'X-Band' | 'Ka-Band';

export interface Terminal {
  id: string;
  shipId: string;
  type: TerminalType;
  designation: string; // e.g., "Terminal-A", "Terminal-B"
  status: 'active' | 'inactive' | 'maintenance' | 'standby';
  currentLeaseId?: string;
  notes?: string;
}

// Satellite lease information
export interface SatelliteLease {
  id: string;
  terminalId: string;
  satelliteName: string;
  txDataRate: number; // Mbps
  rxDataRate: number; // Mbps
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  documentUrl?: string; // Link to lease document (Word/PDF)
  phases: LeasePhase[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Phase changes within a lease
export interface LeasePhase {
  id: string;
  leaseId: string;
  name: string; // e.g., "Phase 1", "Phase 2"
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  txDataRate?: number; // Overrides lease default if set
  rxDataRate?: number; // Overrides lease default if set
  description?: string;
}

// Operational notes and maintenance records
export interface OperationalNote {
  id: string;
  terminalId: string;
  type: 'maintenance' | 'issue' | 'observation' | 'triage';
  title: string;
  content: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  createdBy?: string;
  resolvedAt?: string;
}

// Triage workflow structure
export interface TriageWorkflow {
  id: string;
  terminalId: string;
  problemNature: string;
  questionsAsked: string[];
  informationCollected: Record<string, string>;
  status: 'open' | 'in-progress' | 'escalated' | 'resolved';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

// Application state for dashboard views
export interface DashboardState {
  selectedShipId?: string;
  selectedTerminalId?: string;
  filterByStatus?: Terminal['status'];
  sortBy?: 'name' | 'class' | 'status';
  groupBy?: 'class' | 'status' | 'none';
}
