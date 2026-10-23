import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { MOCK_ACTIVITY, MOCK_CREDENTIALS, MOCK_DEPENDENCIES, MOCK_NETWORK_REQUESTS } from './mock-data';
import { ApplicationDto, HealthCheckDto, IncidentDto, MonitorDto, MonitorRunDto } from './api.contracts';
import { AuthType, Incident, Monitor, MonitoredApplication } from './models';
import { SentinelApi } from './sentinel.api';

export interface CreateApplicationInput {
  name: string;
  url: string;
  environment: MonitoredApplication['environment'];
  authType: AuthType;
  credentialRef?: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class SentinelStore {
  private readonly api = inject(SentinelApi);

  readonly applications = signal<MonitoredApplication[]>([]);
  readonly incidents = signal<Incident[]>([]);
  readonly monitors = signal<Monitor[]>([]);
  readonly credentials = signal([...MOCK_CREDENTIALS]);
  readonly dependencies = signal([...MOCK_DEPENDENCIES]);
  readonly activity = signal([...MOCK_ACTIVITY]);
  readonly networkRequests = signal([...MOCK_NETWORK_REQUESTS]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly activeIncidents = computed(() => this.incidents().filter((item) => item.status !== 'resolved'));
  readonly healthyApplications = computed(() => this.applications().filter((item) => item.status === 'healthy'));

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.applications().subscribe({
      next: (applications) => {
        this.applications.set(applications.map((item) => this.mapApplication(item)));
        this.loading.set(false);
        this.loadApplicationData(applications.map((item) => item.id));
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo conectar con Sentinel API. Comprueba que el backend este activo en el puerto 8080.');
      },
    });
  }

  applicationById(id: number): MonitoredApplication | undefined {
    return this.applications().find((application) => application.id === id);
  }

  addApplication(input: CreateApplicationInput): Observable<MonitoredApplication> {
    return this.api.createApplication({
      name: input.name,
      url: input.url,
      authType: input.authType,
      credentialRef: input.credentialRef,
    }).pipe(
      map((item) => this.mapApplication(item, input.environment, input.tags, input.credentialRef)),
      tap((application) => this.applications.update((current) => [application, ...current])),
    );
  }

  addMonitors(monitors: Omit<Monitor, 'id'>[]): Observable<Monitor[]> {
    if (!monitors.length) return of([]);
    return forkJoin(monitors.map((monitor) => this.api.createMonitor(monitor.applicationId, {
      type: monitor.type,
      name: monitor.name,
      method: monitor.method,
      url: monitor.url,
      active: monitor.active,
      config: monitor.config,
    }))).pipe(
      map((items) => items.map((item) => this.mapMonitor(item))),
      tap((created) => this.monitors.update((current) => [...created, ...current])),
    );
  }

  discover(document: unknown) {
    return this.api.discover(document);
  }

  runMonitor(monitor: Monitor): Observable<MonitorRunDto> {
    return this.api.runMonitor(monitor.applicationId, monitor.id).pipe(tap((run) => {
      this.monitors.update((items) => items.map((item) => item.id === monitor.id ? this.withRun(item, run) : item));
    }));
  }

  runApplicationCheck(applicationId: number): Observable<HealthCheckDto> {
    return this.api.runApplicationCheck(applicationId).pipe(tap((check) => this.applyCheck(applicationId, check)));
  }

  private loadApplicationData(applicationIds: number[]): void {
    if (!applicationIds.length) {
      this.monitors.set([]);
      this.incidents.set([]);
      return;
    }
    for (const applicationId of applicationIds) {
      this.api.applicationChecks(applicationId, 1).pipe(catchError(() => of(null))).subscribe((page) => {
        if (page?.content[0]) this.applyCheck(applicationId, page.content[0]);
      });
      this.api.monitors(applicationId).pipe(catchError(() => of([]))).subscribe((items) => {
        const mapped = items.map((item) => this.mapMonitor(item));
        this.monitors.update((current) => [...current.filter((item) => item.applicationId !== applicationId), ...mapped]);
        for (const monitor of mapped) this.loadLatestRun(monitor);
      });
      this.api.incidents(applicationId).pipe(catchError(() => of([]))).subscribe((items) => {
        const mapped = items.map((item) => this.mapIncident(item));
        this.incidents.update((current) => [...current.filter((item) => !item.affectedApplicationIds.includes(applicationId)), ...mapped]);
      });
    }
  }

  private loadLatestRun(monitor: Monitor): void {
    this.api.monitorRuns(monitor.applicationId, monitor.id, 1).pipe(catchError(() => of(null))).subscribe((page) => {
      const run = page?.content[0];
      if (run) this.monitors.update((items) => items.map((item) => item.id === monitor.id ? this.withRun(item, run) : item));
    });
  }

  private applyCheck(applicationId: number, check: HealthCheckDto): void {
    this.applications.update((items) => items.map((item) => item.id === applicationId ? {
      ...item,
      status: check.available ? 'healthy' : 'down',
      responseTimeMs: check.responseTimeMs,
    } : item));
  }

  private mapApplication(item: ApplicationDto, environment: MonitoredApplication['environment'] = 'Produccion', tags: string[] = [], credentialRef?: string): MonitoredApplication {
    return {
      ...item,
      code: item.name.slice(0, 3).toUpperCase(),
      status: 'unknown',
      environment,
      tags,
      credentialRef,
    };
  }

  private mapMonitor(item: MonitorDto): Monitor {
    return {
      id: item.id,
      applicationId: item.applicationId,
      name: item.name,
      type: item.type,
      method: item.method ?? (item.type === 'BROWSER_JOURNEY' ? 'BROWSER' : 'GET'),
      url: item.url ?? '',
      active: item.active,
      lastStatus: 'unknown',
      config: item.config ?? {},
    };
  }

  private withRun(monitor: Monitor, run: MonitorRunDto): Monitor {
    return {
      ...monitor,
      lastStatus: run.success ? 'healthy' : 'down',
      lastRunAt: run.checkedAt,
      responseTimeMs: run.durationMs,
    };
  }

  private mapIncident(item: IncidentDto): Incident {
    return {
      id: String(item.id),
      title: item.title,
      summary: item.description,
      status: item.status.toLowerCase() as Incident['status'],
      severity: item.severity.toLowerCase() as Incident['severity'],
      startedAt: item.startedAt,
      resolvedAt: item.resolvedAt ?? undefined,
      affectedApplicationIds: [item.applicationId],
      evidence: [],
    };
  }
}
