import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SentinelStore } from '../../core/sentinel.store';
import { MonitorType } from '../../core/models';

@Component({
  selector: 'app-monitors',
  imports: [RouterLink],
  template: `
    <header class="page-heading">
      <div><p class="eyebrow">Supervision</p><h1>Monitores</h1><p>Health checks, endpoints descubiertos y recorridos completos.</p></div>
      <a class="button primary" routerLink="/monitors/new">+ Crear monitor</a>
    </header>
    <section class="monitor-summary">
      <article><span>TOTAL</span><strong>{{ store.monitors().length }}</strong></article>
      <article><span>ENDPOINTS API</span><strong>{{ count('API_ENDPOINT') }}</strong></article>
      <article><span>RECORRIDOS WEB</span><strong>{{ count('BROWSER_JOURNEY') }}</strong></article>
      <article><span>CON PROBLEMAS</span><strong class="danger-text">{{ problems() }}</strong></article>
    </section>
    <section class="table-panel">
      <table><thead><tr><th>Monitor</th><th>Aplicacion</th><th>Tipo</th><th>Ultimo estado</th><th>Duracion</th><th>Ultima ejecucion</th><th></th></tr></thead>
      <tbody>@for (monitor of store.monitors(); track monitor.id) {
        <tr>
          <td><a class="monitor-name" [routerLink]="['/monitors', monitor.id]"><span class="method" [class.browser]="monitor.type === 'BROWSER_JOURNEY'">{{ monitor.method }}</span><span><strong>{{ monitor.name }}</strong><small class="mono">{{ monitor.url }}</small></span></a></td>
          <td>{{ store.applicationById(monitor.applicationId)?.name }}</td>
          <td><span class="monitor-type">{{ typeLabel(monitor.type) }}</span></td>
          <td><span class="status" [class]="monitor.lastStatus"><i></i>{{ statusLabel(monitor.lastStatus) }}</span></td>
          <td class="mono">{{ monitor.responseTimeMs ? monitor.responseTimeMs + ' ms' : '--' }}</td>
          <td class="mono">{{ monitor.lastRunAt ? formatTime(monitor.lastRunAt) : 'Sin ejecutar' }}</td>
          <td><a class="row-action" [routerLink]="['/monitors', monitor.id]">Inspeccionar</a></td>
        </tr>
      }</tbody></table>
    </section>
  `,
})
export class Monitors {
  readonly store = inject(SentinelStore);
  readonly problems = computed(() => this.store.monitors().filter((item) => ['down', 'degraded'].includes(item.lastStatus)).length);
  count(type: MonitorType): number { return this.store.monitors().filter((item) => item.type === type).length; }
  typeLabel(type: MonitorType): string { return ({ HEALTH_CHECK: 'Health check', API_ENDPOINT: 'Endpoint API', BROWSER_JOURNEY: 'Recorrido web' } as Record<MonitorType, string>)[type]; }
  statusLabel(status: string): string { return ({ healthy: 'Correcto', degraded: 'Degradado', down: 'Fallido', unknown: 'Sin datos' } as Record<string, string>)[status]; }
  formatTime(value: string): string { return new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }).format(new Date(value)); }
}
