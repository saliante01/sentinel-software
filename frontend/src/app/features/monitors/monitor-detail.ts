import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Monitor } from '../../core/models';
import { SentinelStore } from '../../core/sentinel.store';

@Component({
  selector: 'app-monitor-detail',
  imports: [RouterLink],
  template: `
    @if (monitor(); as monitor) {
      <header class="page-heading detail-heading"><div><a class="back-link" routerLink="/monitors">← Monitores</a><p class="eyebrow">{{ monitor.type === 'BROWSER_JOURNEY' ? 'Recorrido sintetico' : 'Monitor HTTP real' }}</p><h1>{{ monitor.name }}</h1><p class="mono">{{ monitor.url }}</p></div><div class="heading-actions"><button class="button primary" [disabled]="running || monitor.type === 'BROWSER_JOURNEY'" (click)="run(monitor)">{{ running ? 'Ejecutando...' : 'Ejecutar ahora' }}</button></div></header>
      @if (runError) { <aside class="simulation-banner error"><span>ERROR</span><p>{{ runError }}</p></aside> }
      @if (monitor.type === 'BROWSER_JOURNEY') { <aside class="simulation-banner"><span>NO DISPONIBLE</span><p>Este recorrido no se ejecutara hasta desplegar un worker Playwright real. Sentinel no mostrara evidencia simulada.</p></aside> }

      <section class="run-summary">
        <article><span>ESTADO</span><strong class="status" [class]="monitor.lastStatus"><i></i>{{ statusLabel(monitor.lastStatus) }}</strong></article>
        <article><span>ULTIMA DURACION</span><strong>{{ monitor.responseTimeMs != null ? monitor.responseTimeMs + ' ms' : '--' }}</strong></article>
        <article><span>EJECUCIONES</span><strong>{{ runs().length }}</strong></article>
        <article><span>CORRECTAS</span><strong>{{ successfulRuns() }}</strong></article>
        <article><span>ERRORES</span><strong class="danger-text">{{ failedRuns() }}</strong></article>
      </section>

      <section class="panel table-panel">
        <div class="panel-heading"><div><h2>Ejecuciones reales</h2><p>Resultados persistidos por el backend</p></div></div>
        <table><thead><tr><th>Fecha</th><th>Resultado</th><th>HTTP</th><th>Duracion</th><th>Content-Type</th><th>Error</th></tr></thead><tbody>
          @for (run of runs(); track run.id) { <tr><td class="mono">{{ formatDate(run.checkedAt) }}</td><td><span class="status" [class]="run.success ? 'healthy' : 'down'"><i></i>{{ run.success ? 'Correcto' : 'Fallido' }}</span></td><td class="mono">{{ run.status ?? '--' }}</td><td class="mono">{{ run.durationMs }} ms</td><td class="mono">{{ evidenceValue(run.evidence, 'contentType') }}</td><td>{{ run.error ?? '--' }}</td></tr> }
          @empty { <tr><td colspan="6" class="empty">Todavia no existen ejecuciones para este monitor.</td></tr> }
        </tbody></table>
      </section>

      <section class="detail-grid monitor-bottom">
        <article class="panel metadata"><div class="panel-heading"><div><h2>Politica de resultado</h2><p>Configuracion enviada al ejecutor</p></div></div><dl><div><dt>Metodo</dt><dd class="mono">{{ monitor.method }}</dd></div><div><dt>Estados esperados</dt><dd class="mono">{{ expectedStatuses(monitor) }}</dd></div><div><dt>Intervalo</dt><dd>{{ interval(monitor) }}</dd></div><div><dt>Programado</dt><dd>{{ monitor.active ? 'Si' : 'No' }}</dd></div></dl></article>
        <article class="panel metadata"><div class="panel-heading"><div><h2>Aplicacion</h2><p>Credenciales y destino heredados</p></div></div><dl><div><dt>Nombre</dt><dd>{{ application()?.name }}</dd></div><div><dt>Autenticacion</dt><dd>{{ application()?.authType }}</dd></div><div><dt>Credencial</dt><dd>{{ application()?.credentialConfigured ? 'Configurada en backend' : 'No requerida' }}</dd></div></dl></article>
      </section>
    } @else { <section class="empty-state"><span>404</span><h1>Monitor no encontrado</h1><a class="button" routerLink="/monitors">Volver</a></section> }
  `,
})
export class MonitorDetail {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(SentinelStore);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly monitor = computed(() => this.store.monitors().find((item) => item.id === this.id));
  readonly application = computed(() => this.monitor() ? this.store.applicationById(this.monitor()!.applicationId) : undefined);
  readonly runs = computed(() => this.store.runsFor(this.id));
  readonly successfulRuns = computed(() => this.runs().filter((item) => item.success).length);
  readonly failedRuns = computed(() => this.runs().filter((item) => !item.success).length);
  running = false;
  runError = '';

  run(monitor: Monitor): void {
    this.running = true;
    this.runError = '';
    this.store.runMonitor(monitor).subscribe({ next: () => this.running = false, error: (error) => { this.running = false; this.runError = error.error?.detail ?? 'No se pudo ejecutar el monitor.'; } });
  }

  statusLabel(status: string): string { return ({ healthy: 'Correcto', degraded: 'Degradado', down: 'Fallido', unknown: 'Sin datos' } as Record<string, string>)[status]; }
  formatDate(value: string): string { return new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value)); }
  evidenceValue(evidence: Record<string, unknown> | null, key: string): string { return evidence?.[key] ? String(evidence[key]) : '--'; }
  expectedStatuses(monitor: Monitor): string { const value = monitor.config['expectedStatuses'] ?? monitor.config['expectedStatus']; return value ? String(value) : '2xx'; }
  interval(monitor: Monitor): string { return `${Number(monitor.config['intervalSeconds'] ?? 300)} segundos`; }
}
