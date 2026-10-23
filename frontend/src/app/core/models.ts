export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AuthType = 'NONE' | 'BEARER';

export interface MonitoredApplication {
  id: number;
  name: string;
  code: string;
  url: string;
  active: boolean;
  status: ServiceStatus;
  authType: AuthType;
  credentialRef?: string;
  credentialConfigured: boolean;
  environment: 'Produccion' | 'Staging' | 'Desarrollo';
  tags: string[];
  responseTimeMs?: number;
  uptime?: number;
  createdAt: string;
}

export interface IncidentEvidence {
  id: string;
  type: 'health-check' | 'latency' | 'http-error' | 'note';
  occurredAt: string;
  description: string;
  factual: boolean;
}

export interface Incident {
  id: string;
  title: string;
  summary: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startedAt: string;
  resolvedAt?: string;
  affectedApplicationIds: number[];
  evidence: IncidentEvidence[];
}

export interface ServiceDependency {
  id: string;
  sourceApplicationId: number;
  targetApplicationId: number;
  type: 'depends-on' | 'calls' | 'related-to';
}

export interface CredentialReference {
  id: string;
  name: string;
  type: AuthType;
  configured: boolean;
  applicationIds: number[];
  lastValidatedAt?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}
