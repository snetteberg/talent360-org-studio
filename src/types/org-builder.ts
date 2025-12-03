export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  skills: string[];
  matchScore?: number;
}

export interface Position {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  level: number;
  department: string;
}

export interface OrgNode {
  id: string;
  position: Position;
  employee?: Employee;
  parentId: string | null;
  children: string[];
  x: number;
  y: number;
}

export interface Scenario {
  id: string;
  name: string;
  isBaseline: boolean;
  createdAt: Date;
  nodes: Record<string, OrgNode>;
  rootId: string | null;
  freeAgents: Employee[];
}

export interface OrgHealth {
  headcount: number;
  layers: number;
  openPositions: number;
  flags: HealthFlag[];
}

export interface HealthFlag {
  id: string;
  type: 'span' | 'layer' | 'vacancy' | 'skill-gap';
  severity: 'warning' | 'critical';
  message: string;
  nodeIds: string[];
}

export type ViewMode = 'landing' | 'workspace';

export type PanelContent = 
  | { type: 'person'; nodeId: string }
  | { type: 'position'; nodeId: string }
  | { type: 'health' }
  | { type: 'flag'; flagId: string }
  | null;
