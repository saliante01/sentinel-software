import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SentinelStore } from '../../core/sentinel.store';

@Component({
  selector: 'app-monitor-detail',
  imports: [RouterLink],
  template: `
    @if (monitor(); as monitor) {
      <header class="page-heading detail-heading"><div><a class="back-link" routerLink="/monitors">← Monitores</a><p class="eyebrow">{{ monitor.type === 'BROWSER_JOURNEY' ? 'Recorrido sintetico' : 'Monitor HTTP' }}</p><h1>{{ monitor.name }}</h1><p class="mono">{{ monitor.url }}</p></div><div class="heading-actions"><button class="button">Editar</button><button class="button primary" [disabled]="running" (click)="run(monitor)">{{ running ? 'Ejecutando...' : 'Ejecutar ahora' }}</button></div></header>
      @if (runError) { <aside class="simulation-banner error"><span>ERROR</span><p>{{ runError }}</p></aside> }
      @if (monitor.type === 'BROWSER_JOURNEY') {
        <aside class="simulation-banner"><span>PROTOTIPO</span><p>Este waterfall utiliza una ejecucion simulada. El contrato esta listo, pero la captura real requiere desplegar el worker Playwright.</p></aside>
      }
      <section class="run-summary">
        <article><span>ESTADO</span><strong class="status" [class]="monitor.lastStatus"><i></i>{{ statusLabel(monitor.lastStatus) }}</strong></article>
        <article><span>DURACION TOTAL</span><strong>2.84 s</strong></article>
        <article><span>SOLICITUDES</span><strong>{{ store.networkRequests().length }}</strong></article>
        <article><span>TRANSFERIDO</span><strong>{{ totalSize() }} kB</strong></article>
        <article><span>ERRORES</span><strong class="danger-text">{{ errors() }}</strong></article>
      </section>
      <section class="panel waterfall-panel">
        <div class="panel-heading"><div><h2>Actividad de red</h2><p>Documento, recursos y solicitudes XHR/fetch capturadas</p></div><div class="waterfall-scale"><span>0 ms</span><span>1 s</span><span>2 s</span><span>3 s</span></div></div>
        <div class="network-header"><span>Solicitud</span><span>Estado</span><span>Tipo</span><span>Tamaño</span><span>Duracion</span><span>Linea de tiempo</span></div>
        <div class="network-list">@for (request of store.networkRequests(); track request.id) {
          <div class="network-row" [class.failed]="request.status >= 400">
            <span class="request-name"><b [class.post]="request.method === 'POST'">{{ request.method }}</b><span class="mono">{{ request.url }}</span></span><span [class.error-code]="request.status >= 400">{{ request.status }}</span><span>{{ request.type }}</span><span>{{ request.sizeKb }} kB</span><span>{{ request.durationMs }} ms</span>
            <span class="bar-track"><i [style.left.%]="request.offsetMs / 30" [style.width.%]="request.durationMs / 30" [class.error]="request.status >= 400"></i></span>
          </div>
        }</div>
      </section>
      <section class="detail-grid monitor-bottom">
        <article class="panel"><div class="panel-heading"><div><h2>Pasos del recorrido</h2><p>Acciones reproducidas por el navegador</p></div></div><div class="step-results"><div><i>1</i><span><strong>Abrir portal</strong><small>Completado en 1.02 s</small></span><b>OK</b></div><div><i>2</i><span><strong>Autenticar sesion</strong><small>Completado en 780 ms</small></span><b>OK</b></div><div class="failed"><i>3</i><span><strong>Cargar historial de pagos</strong><small>GET /v1/payments devolvio 503</small></span><b>FAIL</b></div></div></article>
        <article class="panel metadata"><div class="panel-heading"><div><h2>Configuracion</h2><p>Politica del monitor</p></div></div><dl><div><dt>Aplicacion</dt><dd>{{ application()?.name }}</dd></div><div><dt>Frecuencia</dt><dd>Cada 5 minutos</dd></div><div><dt>Ubicacion</dt><dd>Local · prototipo</dd></div><div><dt>Credencial</dt><dd class="mono">{{ application()?.credentialRef || 'No requerida' }}</dd></div></dl></article>
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
  readonly totalSize = computed(() => this.store.networkRequests().reduce((total, item) => total + item.sizeKb, 0).toFixed(1));
  readonly errors = computed(() => this.store.networkRequests().filter((item) => item.status >= 400).length);
  running = false;
  runError = '';
  run(monitor: import('../../core/models').Monitor): void {
    this.running = true;
    this.runError = '';
    this.store.runMonitor(monitor).subscribe({
      next: () => this.running = false,
      error: (error) => { this.running = false; this.runError = error.error?.detail ?? 'No se pudo ejecutar el monitor.'; },
    });
  }
  statusLabel(status: string): string { return ({ healthy: 'Correcto', degraded: 'Degradado', down: 'Fallido', unknown: 'Sin datos' } as Record<string, string>)[status]; }
}
