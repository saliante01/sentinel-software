import { Component, computed, inject, signal } from '@angular/core';
import { SentinelStore } from '../../core/sentinel.store';

@Component({
  selector: 'app-incidents',
  template: `
    <header class="page-heading">
      <div><p class="eyebrow">Investigacion</p><h1>Incidencias</h1><p>Evidencia, impacto y progreso de resolucion.</p></div>
    </header>
    <section class="incident-layout">
      <div>
        <div class="tab-bar">
          <button [class.active]="filter() === 'active'" (click)="filter.set('active')">Activas <span>{{ store.activeIncidents().length }}</span></button>
          <button [class.active]="filter() === 'resolved'" (click)="filter.set('resolved')">Resueltas</button>
          <button [class.active]="filter() === 'all'" (click)="filter.set('all')">Todas</button>
        </div>
        <div class="incident-list">
          @for (incident of filtered(); track incident.id) {
            <button class="incident-card" [class.selected]="selectedId() === incident.id" (click)="selectedId.set(incident.id)">
              <span class="severity-bar" [class]="incident.severity"></span>
              <div class="incident-card-main"><div><span class="incident-id">{{ incident.id }}</span><span class="severity" [class]="incident.severity">{{ severityLabel(incident.severity) }}</span></div><strong>{{ incident.title }}</strong><p>{{ incident.summary }}</p><footer><span>{{ incident.affectedApplicationIds.length }} servicios afectados</span><span>{{ relativeTime(incident.startedAt) }}</span></footer></div>
            </button>
          } @empty { <div class="empty-state"><h2>No hay incidencias</h2><p>Las incidencias persistidas apareceran aqui.</p></div> }
        </div>
      </div>
      @if (selected(); as incident) {
        <aside class="incident-detail panel">
          <div class="detail-top"><span class="incident-id">{{ incident.id }}</span><span class="status investigating"><i></i>{{ statusLabel(incident.status) }}</span></div>
          <h2>{{ incident.title }}</h2><p>{{ incident.summary }}</p>
          <h3>Servicios afectados</h3>
          <div class="affected-list">@for (id of incident.affectedApplicationIds; track id) { @if (store.applicationById(id); as app) { <div><span class="service-code small" [class]="'service-code small ' + app.status">{{ app.code }}</span><strong>{{ app.name }}</strong><span class="status" [class]="app.status"><i></i></span></div> } }</div>
          <h3>Linea de tiempo</h3>
          <div class="evidence-list">@for (evidence of incident.evidence; track evidence.id) { <div><i [class.hypothesis]="!evidence.factual"></i><span><small>{{ formatTime(evidence.occurredAt) }} · {{ evidence.factual ? 'EVIDENCIA' : 'HIPOTESIS' }}</small><p>{{ evidence.description }}</p></span></div> }</div>
        </aside>
      }
    </section>
  `,
})
export class Incidents {
  readonly store = inject(SentinelStore);
  readonly filter = signal<'active' | 'resolved' | 'all'>('active');
  readonly selectedId = signal('');
  readonly filtered = computed(() => this.store.incidents().filter((item) => this.filter() === 'all' || (this.filter() === 'active' ? item.status !== 'resolved' : item.status === 'resolved')));
  readonly selected = computed(() => this.store.incidents().find((item) => item.id === this.selectedId()) ?? this.filtered()[0]);
  severityLabel(value: string): string { return ({ critical: 'Critica', high: 'Alta', medium: 'Media', low: 'Baja' } as Record<string, string>)[value]; }
  statusLabel(value: string): string { return ({ open: 'Abierta', investigating: 'Investigando', resolved: 'Resuelta' } as Record<string, string>)[value]; }
  relativeTime(value: string): string { return new Date(value).toLocaleDateString('es', { day: '2-digit', month: 'short' }); }
  formatTime(value: string): string { return new Date(value).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }); }
}
