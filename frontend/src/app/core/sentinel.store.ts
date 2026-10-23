import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { ApplicationDto, HealthCheckDto, IncidentDto, MonitorDto, MonitorRunDto } from './api.contracts';
import { ActivityItem, AuthType, CredentialReference, Incident, Monitor, MonitoredApplication, ServiceDependency } from './models';
import { SentinelApi } from './sentinel.api';

export interface CreateApplicationInput {
  name: string;
  url: string;
  environment?: MonitoredApplication['environment'];
  authType: AuthType;
  credentialRef?: string;
  tags?: string[];
}

@Injectable({ providedIn: 'root' })
export class SentinelStore {
  private readonly api = inject(SentinelApi);

  readonly applications = signal<MonitoredApplication[]>([]);
  readonly incidents = signal<Incident[]>([]);
  readonly monitors = signal<Monitor[]>([]);
  readonly dependencies = signal<ServiceDependency[]>([]);
  readonly checks = signal<Record<number, HealthCheckDto[]>>({});
  readonly runs = signal<Record<number, MonitorRunDto[]>>({});
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly activeIncidents = computed(() => this.incidents().filter((item) => item.status !== 'resolved'));
  readonly healthyApplications = computed(() => this.applications().filter((item) => item.status === 'healthy'));
  readonly credentials = computed<CredentialReference[]>(() => this.applications().filter((item) => item.credentialConfigured).map((item) => ({
    id: `application-${item.id}`,
    name: `Credencial de ${item.name}`,
    type: item.authType,
    configured: true,
    applicationIds: [item.id],
  })));
  readonly activity = computed<ActivityItem[]>(() => {
    const incidentItems = this.incidents().map((item) => ({ id: `incident-${item.id}`, title: item.title, detail: item.summary, timestamp: this.relative(item.startedAt), tone: item.severity === 'critical' ? 'danger' as const : 'warning' as const }));
    const runItems = Object.values(this.runs()).flat().map((run) => ({ id: `run-${run.id}`, title: run.success ? 'Monitor ejecutado correctamente' : 'Monitor con error', detail: run.error ?? `HTTP ${run.status ?? 'sin respuesta'} · ${run.durationMs} ms`, timestamp: this.relative(run.checkedAt), tone: run.success ? 'success' as const : 'danger' as const }));
    return [...incidentItems, ...runItems].slice(0, 8);
  });

  constructor() { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.applications().subscribe({
      next: (applications) => {
        this.applications.set(applications.map((item) => this.mapApplication(item)));
        this.loading.set(false);
        this.loadApplicationData(applications.map((item) => item.id));
        this.loadAggregates();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo conectar con Sentinel API. Comprueba que el backend este activo en el puerto 8080.');
      },
    });
  }

  applicationById(id: number): MonitoredApplication | undefined { return this.applications().find((application) => application.id === id); }
  runsFor(monitorId: number): MonitorRunDto[] { return this.runs()[monitorId] ?? []; }
  checksFor(applicationId: number): HealthCheckDto[] { return this.checks()[applicationId] ?? []; }

  addApplication(input: CreateApplicationInput): Observable<MonitoredApplication> {
    return this.api.createApplication({ name: input.name, url: input.url, authType: input.authType, credentialRef: input.credentialRef }).pipe(
      map((item) => this.mapApplication(item, input.environment, input.tags ?? [], input.credentialRef)),
      tap((application) => this.applications.update((current) => [application, ...current])),
    );
  }

  addMonitors(monitors: Omit<Monitor, 'id'>[]): Observable<Monitor[]> {
    if (!monitors.length) return of([]);
    return forkJoin(monitors.map((monitor) => this.api.createMonitor(monitor.applicationId, { type: monitor.type, name: monitor.name, method: monitor.method, url: monitor.url, active: monitor.active, config: monitor.config }))).pipe(
      map((items) => items.map((item) => this.mapMonitor(item))),
      tap((created) => this.monitors.update((current) => [...created, ...current])),
    );
  }

  discover(document: unknown) { return this.api.discover(document); }

  runMonitor(monitor: Monitor): Observable<MonitorRunDto> {
    return this.api.runMonitor(monitor.applicationId, monitor.id).pipe(tap((run) => {
      this.runs.update((current) => ({ ...current, [monitor.id]: [run, ...(current[monitor.id] ?? [])] }));
      this.monitors.update((items) => items.map((item) => item.id === monitor.id ? this.withRun(item, run) : item));
    }));
  }

  runApplicationCheck(applicationId: number): Observable<HealthCheckDto> {
    return this.api.runApplicationCheck(applicationId).pipe(tap((check) => {
      this.checks.update((current) => ({ ...current, [applicationId]: [check, ...(current[applicationId] ?? [])] }));
      this.applyCheck(applicationId, check);
    }));
  }

  private loadAggregates(): void {
    this.api.allMonitorsAggregate().pipe(catchError(() => of([]))).subscribe((items) => {
      const mapped = items.map((item) => this.mapMonitor(item));
      this.monitors.set(mapped);
      for (const monitor of mapped) this.loadRuns(monitor);
    });
    this.api.allIncidents().pipe(catchError(() => of([]))).subscribe((items) => this.incidents.set(items.map((item) => this.mapIncident(item))));
  }

  private loadApplicationData(applicationIds: number[]): void {
    if (!applicationIds.length) { this.dependencies.set([]); return; }
    for (const applicationId of applicationIds) {
      this.api.applicationChecks(applicationId, 30).pipe(catchError(() => of(null))).subscribe((page) => {
        if (!page) return;
        this.checks.update((current) => ({ ...current, [applicationId]: page.content }));
        if (page.content[0]) this.applyCheck(applicationId, page.content[0]);
      });
      this.api.dependencies(applicationId).pipe(catchError(() => of([]))).subscribe((items) => {
        this.dependencies.update((current) => [...current.filter((item) => item.applicationId !== applicationId), ...items]);
      });
    }
  }

  private loadRuns(monitor: Monitor): void {
    this.api.monitorRuns(monitor.applicationId, monitor.id, 30).pipe(catchError(() => of(null))).subscribe((page) => {
      if (!page) return;
      this.runs.update((current) => ({ ...current, [monitor.id]: page.content }));
      if (page.content[0]) this.monitors.update((items) => items.map((item) => item.id === monitor.id ? this.withRun(item, page.content[0]) : item));
    });
  }

  private applyCheck(applicationId: number, check: HealthCheckDto): void {
    this.applications.update((items) => items.map((item) => item.id === applicationId ? { ...item, status: check.available ? 'healthy' : 'down', responseTimeMs: check.responseTimeMs } : item));
  }

  private mapApplication(item: ApplicationDto, environment?: MonitoredApplication['environment'], tags: string[] = [], credentialRef?: string): MonitoredApplication {
    return { ...item, code: item.name.slice(0, 3).toUpperCase(), status: 'unknown', environment, tags, credentialRef };
  }

  private mapMonitor(item: MonitorDto): Monitor {
    return { id: item.id, applicationId: item.applicationId, name: item.name, type: item.type, method: item.method ?? (item.type === 'BROWSER_JOURNEY' ? 'BROWSER' : 'GET'), url: item.url ?? '', active: item.active, lastStatus: 'unknown', config: item.config ?? {} };
  }

  private withRun(monitor: Monitor, run: MonitorRunDto): Monitor { return { ...monitor, lastStatus: run.success ? 'healthy' : 'down', lastRunAt: run.checkedAt, responseTimeMs: run.durationMs }; }

  private mapIncident(item: IncidentDto): Incident {
    return { id: String(item.id), title: item.title, summary: item.description, status: item.status.toLowerCase() as Incident['status'], severity: item.severity.toLowerCase() as Incident['severity'], startedAt: item.startedAt, resolvedAt: item.resolvedAt ?? undefined, affectedApplicationIds: [item.applicationId], evidence: [] };
  }

  private relative(value: string): string { return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)); }
}
