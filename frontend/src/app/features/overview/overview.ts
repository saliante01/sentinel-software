import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SentinelStore } from '../../core/sentinel.store';

@Component({
  selector: 'app-overview',
  imports: [RouterLink],
  template: `
    <header class="page-heading">
      <div><p class="eyebrow">Centro de operaciones</p><h1>Estado del sistema</h1><p>Supervision consolidada de servicios e incidencias.</p></div>
      <a class="button primary" routerLink="/applications/new">+ Registrar aplicacion</a>
    </header>

    <section class="metric-grid">
      <article class="metric"><span>Servicios monitorizados</span><strong>{{ store.applications().length }}</strong><small><i class="dot healthy"></i>{{ activeCount() }} activos</small></article>
      <article class="metric"><span>Disponibilidad global</span><strong>98.74<em>%</em></strong><small class="positive">+0.18% esta semana</small></article>
      <article class="metric danger-glow"><span>Incidencias activas</span><strong>{{ store.activeIncidents().length }}</strong><small><i class="dot down"></i>1 impacto critico</small></article>
      <article class="metric"><span>Latencia promedio</span><strong>214<em> ms</em></strong><small class="warning-text">+32 ms en 24 horas</small></article>
    </section>

    <section class="overview-grid">
      <article class="panel health-panel">
        <div class="panel-heading"><div><h2>Salud de servicios</h2><p>Ultima comprobacion hace 38 segundos</p></div><a routerLink="/applications">Ver todos</a></div>
        <div class="service-list">
          @for (application of store.applications().slice(0, 6); track application.id) {
            <a class="service-row" [routerLink]="['/applications', application.id]">
              <span class="service-code" [class]="'service-code ' + application.status">{{ application.code }}</span>
              <span class="service-main"><strong>{{ application.name }}</strong><small>{{ application.url }}</small></span>
              <span class="environment">{{ application.environment }}</span>
              <span class="latency">{{ application.responseTimeMs ? application.responseTimeMs + ' ms' : '--' }}</span>
              <span class="status" [class]="application.status"><i></i>{{ statusLabel(application.status) }}</span>
            </a>
          }
        </div>
      </article>

      <article class="panel activity-panel">
        <div class="panel-heading"><div><h2>Actividad reciente</h2><p>Evidencia y cambios del sistema</p></div></div>
        <div class="timeline">
          @for (item of store.activity(); track item.id) {
            <div class="timeline-item">
              <i [class]="item.tone"></i>
              <div><strong>{{ item.title }}</strong><p>{{ item.detail }}</p><small>{{ item.timestamp }}</small></div>
            </div>
          }
        </div>
      </article>
    </section>

    <section class="panel incident-strip">
      <div class="incident-marker"><span>!</span></div>
      <div class="incident-copy"><span class="severity critical">CRITICA</span><strong>{{ criticalIncident()?.title }}</strong><p>{{ criticalIncident()?.summary }}</p></div>
      <div class="incident-meta"><small>INICIADA</small><strong>hace 18 min</strong></div>
      <a class="button" routerLink="/incidents">Investigar</a>
    </section>
  `,
})
export class Overview {
  readonly store = inject(SentinelStore);
  readonly activeCount = computed(() => this.store.applications().filter((item) => item.active).length);
  readonly criticalIncident = computed(() => this.store.incidents().find((item) => item.severity === 'critical'));

  statusLabel(status: string): string {
    return ({ healthy: 'Operativo', degraded: 'Degradado', down: 'Caido', unknown: 'Sin datos' } as Record<string, string>)[status];
  }
}
