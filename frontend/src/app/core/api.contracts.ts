import { AuthType, IncidentSeverity, IncidentStatus, MonitorType } from './models';

export interface ApplicationDto {
  id: number;
  name: string;
  url: string;
  createdAt: string;
  active: boolean;
  authType: AuthType;
  credentialConfigured: boolean;
}

export interface MonitorDto {
  id: number;
  applicationId: number;
  type: MonitorType;
  name: string;
  method: string | null;
  url: string | null;
  active: boolean;
  config: Record<string, unknown> | null;
  createdAt: string;
}

export interface MonitorRunDto {
  id: number;
  monitorId: number;
  checkedAt: string;
  durationMs: number;
  status: number | null;
  success: boolean;
  error: string | null;
  config: Record<string, unknown> | null;
  evidence: Record<string, unknown> | null;
}

export interface HealthCheckDto {
  id: number;
  applicationId: number;
  checkedAt: string;
  responseTimeMs: number;
  httpStatus: number | null;
  available: boolean;
  errorMessage: string | null;
}

export interface IncidentDto {
  id: number;
  applicationId: number;
  title: string;
  description: string;
  status: Uppercase<IncidentStatus>;
  severity: Uppercase<IncidentSeverity>;
  startedAt: string;
  resolvedAt: string | null;
  createdAt: string;
}

export interface PageDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DiscoveryCandidateDto {
  name: string;
  method: string;
  url: string;
  source: 'OPENAPI' | 'HAR';
}

export interface DiscoveryResponseDto {
  format: string;
  candidates: DiscoveryCandidateDto[];
}

export interface ServiceDependencyDto {
  id: number;
  applicationId: number;
  name: string;
  url: string;
  active: boolean;
  createdAt: string;
}
