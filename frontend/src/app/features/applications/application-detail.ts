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
        <article><span>Comprobaciones</span><strong>{{ store.checksFor(app.id).length }}</strong><small>Historial cargado</small></article>
        <article><span>Incidencias</span><strong>{{ incidents().length }}</strong><small>Relacionadas</small></article>
      </section>
      <section class="detail-grid">
        <article class="panel">
          <div class="panel-heading"><div><h2>Historial de comprobaciones</h2><p>Ultimos resultados almacenados por Sentinel</p></div></div>
          <div class="check-history">@for (check of store.checksFor(app.id); track check.id) { <div><span class="status" [class]="check.available ? 'healthy' : 'down'"><i></i>{{ check.available ? 'Correcto' : 'Fallido' }}</span><span class="mono">HTTP {{ check.httpStatus ?? '--' }}</span><span class="mono">{{ check.responseTimeMs }} ms</span><span>{{ formatDateTime(check.checkedAt) }}</span></div> } @empty { <div class="empty">Ejecuta el primer check para generar historial real.</div> }</div>
        </article>
        <article class="panel metadata">
          <div class="panel-heading"><div><h2>Configuracion</h2><p>Informacion del monitor</p></div></div>
          <dl><div><dt>Autenticacion</dt><dd>{{ app.authType }}</dd></div><div><dt>Credencial</dt><dd>{{ app.credentialConfigured ? 'Configurada en backend' : 'No requerida' }}</dd></div><div><dt>Registro</dt><dd>{{ formatDate(app.createdAt) }}</dd></div><div><dt>Monitor activo</dt><dd>{{ app.active ? 'Si' : 'No' }}</dd></div></dl>
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
  formatDateTime(value: string): string { return new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }
}
