import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SentinelStore } from '../../core/sentinel.store';

@Component({
  selector: 'app-topology',
  imports: [RouterLink],
  template: `
    <header class="page-heading map-heading"><div><p class="eyebrow">Topologia real</p><h1>Mapa de aplicaciones</h1><p>Aplicaciones registradas y dependencias declaradas en Sentinel.</p></div></header>
    <section class="graph-shell">
      <div class="graph-toolbar"><span><i class="healthy"></i>Operativo</span><span><i class="degraded"></i>Sin datos</span><span><i class="down"></i>Fallido</span><span class="graph-help">{{ store.applications().length }} aplicaciones · {{ store.dependencies().length }} dependencias</span></div>
      <div class="graph-stage">
        @if (store.applications().length) {
          <svg viewBox="0 0 1150 650" role="img" aria-label="Grafo de aplicaciones y dependencias">
            <defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#313744" opacity=".42" /></pattern><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#353e50" /></marker></defs>
            <rect width="1150" height="650" fill="url(#grid)" />
            @for (edge of edges(); track edge.id) { <line [attr.x1]="edge.x1" [attr.y1]="edge.y1" [attr.x2]="edge.x2" [attr.y2]="edge.y2" class="graph-edge" marker-end="url(#arrow)" /> }
            @for (node of applicationNodes(); track node.id) { @if (store.applicationById(node.id); as app) { <g class="graph-node" [class.selected]="selectedId() === app.id" [attr.transform]="'translate(' + node.x + ' ' + node.y + ')'" (click)="selectedId.set(app.id)"><circle r="35" [class]="'node-body ' + app.status"/><text class="node-code" text-anchor="middle" y="5">{{ app.code }}</text><text class="node-name" text-anchor="middle" y="61">{{ app.name }}</text><text class="node-latency" text-anchor="middle" y="78">{{ app.responseTimeMs != null ? app.responseTimeMs + ' ms' : 'sin checks' }}</text></g> } }
            @for (node of dependencyNodes(); track node.id) { <g [attr.transform]="'translate(' + node.x + ' ' + node.y + ')'" class="graph-node external"><circle r="25" class="node-body unknown"/><text class="node-code" text-anchor="middle" y="4">EXT</text><text class="node-name" text-anchor="middle" y="48">{{ node.name }}</text></g> }
          </svg>
          @if (selected(); as app) { <aside class="node-inspector"><div class="inspector-head"><span class="service-code" [class]="'service-code ' + app.status">{{ app.code }}</span><button (click)="selectedId.set(null)">×</button></div><span class="status" [class]="app.status"><i></i>{{ statusLabel(app.status) }}</span><h2>{{ app.name }}</h2><p class="mono">{{ app.url }}</p><div class="inspector-stats"><div><span>LATENCIA</span><strong>{{ app.responseTimeMs ?? '--' }} ms</strong></div><div><span>CHECKS</span><strong>{{ store.checksFor(app.id).length }}</strong></div></div><a class="button primary block" [routerLink]="['/applications', app.id]">Abrir aplicacion</a></aside> }
        } @else { <div class="empty-state"><h2>No hay aplicaciones registradas</h2><p>Registra una aplicacion para construir el mapa con datos reales.</p><a class="button primary" routerLink="/applications/new">Registrar aplicacion</a></div> }
      </div>
    </section>
  `,
})
export class Topology {
  readonly store = inject(SentinelStore);
  readonly selectedId = signal<number | null>(null);
  readonly applicationNodes = computed(() => this.store.applications().map((app, index) => ({ id: app.id, x: 170 + (index % 3) * 330, y: 150 + Math.floor(index / 3) * 230 })));
  readonly dependencyNodes = computed(() => this.store.dependencies().map((dep, index) => ({ id: dep.id, name: dep.name, applicationId: dep.applicationId, x: 300 + (index % 3) * 300, y: 260 + Math.floor(index / 3) * 210 })));
  readonly edges = computed(() => this.dependencyNodes().flatMap((dependency) => { const source = this.applicationNodes().find((node) => node.id === dependency.applicationId); return source ? [{ id: dependency.id, x1: source.x, y1: source.y, x2: dependency.x, y2: dependency.y }] : []; }));
  readonly selected = computed(() => this.selectedId() ? this.store.applicationById(this.selectedId()!) : undefined);
  statusLabel(status: string): string { return ({ healthy: 'Operativo', degraded: 'Degradado', down: 'Fallido', unknown: 'Sin checks' } as Record<string, string>)[status]; }
}
