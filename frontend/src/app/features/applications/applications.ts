import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SentinelStore } from '../../core/sentinel.store';

@Component({
  selector: 'app-applications',
  imports: [FormsModule, RouterLink],
  template: `
    <header class="page-heading">
      <div><p class="eyebrow">Inventario</p><h1>Aplicaciones</h1><p>Endpoints registrados y su estado operativo mas reciente.</p></div>
      <a class="button primary" routerLink="/applications/new">+ Registrar aplicacion</a>
    </header>
    <section class="toolbar panel-flat">
      <label class="search"><span>/</span><input [(ngModel)]="query" placeholder="Buscar por nombre, URL o etiqueta" /></label>
      <div class="filter-group">
        @for (filter of filters; track filter.value) {
          <button [class.active]="statusFilter() === filter.value" (click)="statusFilter.set(filter.value)">{{ filter.label }}</button>
        }
      </div>
      <span class="result-count">{{ filtered().length }} resultados</span>
    </section>
    <section class="table-panel">
      <table>
        <thead><tr><th>Aplicacion</th><th>Entorno</th><th>Estado</th><th>Latencia</th><th>Uptime 30d</th><th>Autenticacion</th><th></th></tr></thead>
        <tbody>
          @for (application of filtered(); track application.id) {
            <tr>
              <td><a class="application-cell" [routerLink]="['/applications', application.id]"><span class="service-code" [class]="'service-code ' + application.status">{{ application.code }}</span><span><strong>{{ application.name }}</strong><small>{{ application.url }}</small></span></a></td>
              <td><span class="environment">{{ application.environment }}</span></td>
              <td><span class="status" [class]="application.status"><i></i>{{ statusLabel(application.status) }}</span></td>
              <td class="mono">{{ application.responseTimeMs ? application.responseTimeMs + ' ms' : '--' }}</td>
              <td><span class="uptime">{{ application.uptime ?? '--' }}{{ application.uptime ? '%' : '' }}</span></td>
              <td><span class="auth-type">{{ application.authType }}</span></td>
              <td><a class="row-action" [routerLink]="['/applications', application.id]">Abrir</a></td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="empty">No hay aplicaciones que coincidan con los filtros.</td></tr>
          }
        </tbody>
      </table>
    </section>
  `,
})
export class Applications {
  readonly store = inject(SentinelStore);
  readonly query = signal('');
  readonly statusFilter = signal('all');
  readonly filters = [{ label: 'Todos', value: 'all' }, { label: 'Operativos', value: 'healthy' }, { label: 'Con problemas', value: 'problem' }, { label: 'Sin datos', value: 'unknown' }];
  readonly filtered = computed(() => {
    const term = this.query().toLowerCase().trim();
    return this.store.applications().filter((item) => {
      const matchesText = !term || `${item.name} ${item.url} ${item.tags.join(' ')}`.toLowerCase().includes(term);
      const filter = this.statusFilter();
      const matchesStatus = filter === 'all' || item.status === filter || (filter === 'problem' && ['down', 'degraded'].includes(item.status));
      return matchesText && matchesStatus;
    });
  });
  statusLabel(status: string): string { return ({ healthy: 'Operativo', degraded: 'Degradado', down: 'Caido', unknown: 'Sin datos' } as Record<string, string>)[status]; }
}
