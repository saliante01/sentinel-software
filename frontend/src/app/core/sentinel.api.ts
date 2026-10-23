import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { AuthType, MonitorType } from './models';
import {
  ApplicationDto,
  DiscoveryResponseDto,
  HealthCheckDto,
  IncidentDto,
  MonitorDto,
  MonitorRunDto,
  PageDto,
} from './api.contracts';

@Injectable({ providedIn: 'root' })
export class SentinelApi {
  private readonly http = inject(HttpClient);

  applications(): Observable<ApplicationDto[]> {
    return this.http.get<ApplicationDto[]>('/api/applications');
  }

  createApplication(request: { name: string; url: string; authType: AuthType; credentialRef?: string }): Observable<ApplicationDto> {
    return this.http.post<ApplicationDto>('/api/applications', request);
  }

  runApplicationCheck(applicationId: number): Observable<HealthCheckDto> {
    return this.http.post<HealthCheckDto>(`/api/applications/${applicationId}/checks`, {});
  }

  applicationChecks(applicationId: number, size = 20): Observable<PageDto<HealthCheckDto>> {
    return this.http.get<PageDto<HealthCheckDto>>(`/api/applications/${applicationId}/checks`, { params: { page: 0, size } });
  }

  monitors(applicationId: number): Observable<MonitorDto[]> {
    return this.http.get<MonitorDto[]>(`/api/applications/${applicationId}/monitors`);
  }

  createMonitor(applicationId: number, request: { type: MonitorType; name: string; method: string; url: string; active: boolean; config: Record<string, unknown> }): Observable<MonitorDto> {
    return this.http.post<MonitorDto>(`/api/applications/${applicationId}/monitors`, request);
  }

  monitorRuns(applicationId: number, monitorId: number, size = 20): Observable<PageDto<MonitorRunDto>> {
    return this.http.get<PageDto<MonitorRunDto>>(`/api/applications/${applicationId}/monitors/${monitorId}/runs`, { params: { page: 0, size } });
  }

  runMonitor(applicationId: number, monitorId: number): Observable<MonitorRunDto> {
    return this.http.post<MonitorRunDto>(`/api/applications/${applicationId}/monitors/${monitorId}/runs`, {});
  }

  discover(document: unknown): Observable<DiscoveryResponseDto> {
    return this.http.post<DiscoveryResponseDto>('/api/monitor-discovery', document);
  }

  incidents(applicationId: number): Observable<IncidentDto[]> {
    return this.http.get<IncidentDto[]>(`/api/applications/${applicationId}/incidents`);
  }

  allMonitors(applicationIds: number[]): Observable<MonitorDto[][]> {
    return forkJoin(applicationIds.map((id) => this.monitors(id)));
  }
}
