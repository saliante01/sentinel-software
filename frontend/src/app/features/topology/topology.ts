import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SentinelStore } from '../../core/sentinel.store';

interface GraphNode { id: number; x: number; y: number; }

@Component({
  selector: 'app-topology',
  imports: [RouterLink],
  template: `
    <header class="page-heading map-heading">
      <div><p class="eyebrow">Topologia operativa</p><h1>Mapa de incidencias</h1><p>Dependencias e impacto en tiempo real.</p></div>
      <div class="map-controls"><button [class.active]="showHealthy()" (click)="showHealthy.set(!showHealthy())">Servicios sanos</button><button class="active">Incidencias</button></div>
    </header>
    <section class="graph-shell">
      <div class="graph-toolbar"><span><i class="healthy"></i>Operativo</span><span><i class="degraded"></i>Degradado</span><span><i class="down"></i>Incidencia</span><span class="graph-help">Selecciona un nodo para inspeccionarlo</span></div>
      <div class="graph-stage">
        <svg viewBox="0 0 1150 650" role="img" aria-label="Grafo de dependencias entre aplicaciones">
          <defs>
            <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#313744" opacity=".42" /></pattern>
            <filter id="glow-red"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#353e50" /></marker>
          </defs>
          <rect width="1150" height="650" fill="url(#grid)" />
          @for (edge of edges(); track edge.id) {
            <line [attr.x1]="edge.x1" [attr.y1]="edge.y1" [attr.x2]="edge.x2" [attr.y2]="edge.y2" class="graph-edge" marker-end="url(#arrow)" />
          }
          <g class="incident-zone"><circle cx="580" cy="340" r="150"/><text x="470" y="505">INC-2048 · IMPACTO CRITICO</text></g>
          @for (node of visibleNodes(); track node.id) {
            @if (store.applicationById(node.id); as app) {
              <g class="graph-node" [class.selected]="selectedId() === app.id" [class.down]="app.status === 'down'" [attr.transform]="'translate(' + node.x + ' ' + node.y + ')'" (click)="selectedId.set(app.id)" role="button" tabindex="0">
                @if (app.status === 'down') { <circle r="53" class="node-pulse" /> }
                <circle r="35" class="node-body" [class]="'node-body ' + app.status" />
                <text class="node-code" text-anchor="middle" y="5">{{ app.code }}</text>
                <text class="node-name" text-anchor="middle" y="61">{{ app.name }}</text>
                @if (app.responseTimeMs) { <text class="node-latency" text-anchor="middle" y="78">{{ app.responseTimeMs }} ms</text> }
              </g>
            }
          }
        </svg>
        <div class="zoom-controls"><button>+</button><button>−</button><button>FIT</button></div>
        @if (selected(); as app) {
          <aside class="node-inspector">
            <div class="inspector-head"><span class="service-code" [class]="'service-code ' + app.status">{{ app.code }}</span><button (click)="selectedId.set(null)">×</button></div>
            <span class="status" [class]="app.status"><i></i>{{ statusLabel(app.status) }}</span>
            <h2>{{ app.name }}</h2><p class="mono">{{ app.url }}</p>
            <div class="inspector-stats"><div><span>LATENCIA</span><strong>{{ app.responseTimeMs || '--' }} ms</strong></div><div><span>UPTIME</span><strong>{{ app.uptime }}%</strong></div></div>
            @if (relatedIncident(app.id); as incident) { <div class="linked-incident"><span>{{ incident.id }}</span><strong>{{ incident.title }}</strong><small>Incidencia vinculada</small></div> }
            <a class="button primary block" [routerLink]="['/applications', app.id]">Abrir aplicacion</a>
          </aside>
        }
      </div>
    </section>
  `,
})
export class Topology {
  readonly store = inject(SentinelStore);
  readonly selectedId = signal<number | null>(3);
  readonly showHealthy = signal(true);
  readonly nodes: GraphNode[] = [
    { id: 1, x: 160, y: 190 }, { id: 2, x: 395, y: 275 }, { id: 3, x: 620, y: 350 },
    { id: 4, x: 855, y: 210 }, { id: 5, x: 780, y: 495 }, { id: 6, x: 390, y: 505 }, { id: 7, x: 1010, y: 410 },
  ];
  readonly visibleNodes = computed(() => this.nodes.filter((node) => this.showHealthy() || this.store.applicationById(node.id)?.status !== 'healthy'));
  readonly edges = computed(() => this.store.dependencies().map((dependency) => {
    const source = this.nodes.find((node) => node.id === dependency.sourceApplicationId)!;
    const target = this.nodes.find((node) => node.id === dependency.targetApplicationId)!;
    return { id: dependency.id, x1: source.x, y1: source.y, x2: target.x, y2: target.y };
  }).filter((edge) => this.visibleNodes().some((node) => node.x === edge.x1) && this.visibleNodes().some((node) => node.x === edge.x2)));
  readonly selected = computed(() => this.selectedId() ? this.store.applicationById(this.selectedId()!) : undefined);
  relatedIncident(id: number) { return this.store.incidents().find((item) => item.status !== 'resolved' && item.affectedApplicationIds.includes(id)); }
  statusLabel(status: string): string { return ({ healthy: 'Operativo', degraded: 'Degradado', down: 'Caido', unknown: 'Sin datos' } as Record<string, string>)[status]; }
}
