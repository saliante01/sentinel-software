import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SentinelStore } from '../../core/sentinel.store';

@Component({
  selector: 'app-application-detail',
  imports: [RouterLink],
  template: `
    @if (application(); as app) {
      <header class="page-heading detail-heading">
        <div><a class="back-link" routerLink="/applications">← Aplicaciones</a><div class="title-with-code"><span class="service-code large" [class]="'service-code large ' + app.status">{{ app.code }}</span><div><h1>{{ app.name }}</h1><p class="mono">{{ app.url }}</p></div></div></div>
        <div class="heading-actions"><button class="button">Editar</button><button class="button primary" [disabled]="checking" (click)="runCheck()">{{ checking ? 'Ejecutando...' : 'Ejecutar check' }}</button></div>
      </header>
      <section class="detail-metrics">
        <article><span>Estado actual</span><strong class="status large" [class]="app.status"><i></i>{{ statusLabel(app.status) }}</strong></article>
        <article><span>Latencia</span><strong>{{ app.responseTimeMs ? app.responseTimeMs + ' ms' : '--' }}</strong><small>Ultimo check</small></article>
        <article><span>Disponibilidad</span><strong>{{ app.uptime ?? '--' }}%</strong><small>Ultimos 30 dias</small></article>
        <article><span>Incidencias</span><strong>{{ incidents().length }}</strong><small>Relacionadas</small></article>
      </section>
      <section class="detail-grid">
        <article class="panel">
          <div class="panel-heading"><div><h2>Actividad de latencia</h2><p>Datos simulados de las ultimas 12 horas</p></div></div>
          <div class="latency-chart">
            <div class="chart-labels"><span>1200 ms</span><span>600 ms</span><span>0 ms</span></div>
            <svg viewBox="0 0 700 190" preserveAspectRatio="none" aria-label="Grafico de latencia">
              <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#638cff" stop-opacity=".28"/><stop offset="1" stop-color="#638cff" stop-opacity="0"/></linearGradient></defs>
              <path class="area" d="M0,146 L60,136 L120,142 L180,120 L240,128 L300,117 L360,122 L420,88 L480,105 L540,42 L600,73 L650,54 L700,65 L700,190 L0,190 Z" />
              <path class="line" d="M0,146 L60,136 L120,142 L180,120 L240,128 L300,117 L360,122 L420,88 L480,105 L540,42 L600,73 L650,54 L700,65" />
            </svg>
          </div>
        </article>
        <article class="panel metadata">
          <div class="panel-heading"><div><h2>Configuracion</h2><p>Informacion del monitor</p></div></div>
          <dl><div><dt>Entorno</dt><dd>{{ app.environment }}</dd></div><div><dt>Autenticacion</dt><dd>{{ app.authType }}</dd></div><div><dt>Credencial</dt><dd class="mono">{{ app.credentialRef ?? 'No requerida' }}</dd></div><div><dt>Registro</dt><dd>{{ formatDate(app.createdAt) }}</dd></div><div><dt>Etiquetas</dt><dd>@for (tag of app.tags; track tag) { <span class="tag">{{ tag }}</span> }</dd></div></dl>
        </article>
      </section>
    } @else {
      <section class="empty-state"><span>404</span><h1>Aplicacion no encontrada</h1><a class="button" routerLink="/applications">Volver al inventario</a></section>
    }
  `,
})
export class ApplicationDetail {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(SentinelStore);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly application = computed(() => this.store.applicationById(this.id));
  readonly incidents = computed(() => this.store.incidents().filter((item) => item.affectedApplicationIds.includes(this.id)));
  checking = false;
  runCheck(): void {
    this.checking = true;
    this.store.runApplicationCheck(this.id).subscribe({ next: () => this.checking = false, error: () => this.checking = false });
  }
  statusLabel(status: string): string { return ({ healthy: 'Operativo', degraded: 'Degradado', down: 'Caido', unknown: 'Sin datos' } as Record<string, string>)[status]; }
  formatDate(value: string): string { return new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(value)); }
}
