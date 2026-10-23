import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DiscoveryCandidate, MonitorType } from '../../core/models';
import { SentinelStore } from '../../core/sentinel.store';

const SAMPLE_OPENAPI = `{
  "openapi": "3.0.0",
  "servers": [{ "url": "https://api.northstar.io" }],
  "paths": {
    "/v1/customers": { "get": { "summary": "Listar clientes" } },
    "/v1/orders/{id}": { "get": { "summary": "Consultar pedido" } },
    "/v1/payments": { "post": { "summary": "Crear pago" } }
  }
}`;

@Component({
  selector: 'app-monitor-create',
  imports: [FormsModule, RouterLink],
  template: `
    <header class="page-heading compact"><div><a class="back-link" routerLink="/monitors">← Monitores</a><p class="eyebrow">Asistente</p><h1>Crear supervision</h1><p>Descubre solicitudes automaticamente y elige solo las que importan.</p></div></header>
    <div class="wizard-steps"><span [class.active]="step() >= 1"><i>1</i>Origen</span><b></b><span [class.active]="step() >= 2"><i>2</i>Descubrimiento</span><b></b><span [class.active]="step() >= 3"><i>3</i>Seleccion</span><b></b><span [class.active]="step() >= 4"><i>4</i>Confirmar</span></div>

    @if (step() === 1) {
      <section class="wizard-card">
        <div class="section-heading"><span>01</span><div><h2>¿Que quieres supervisar?</h2><p>No necesitas registrar cada URL manualmente.</p></div></div>
        <div class="source-options">
          <button [class.selected]="type() === 'HEALTH_CHECK'" (click)="selectType('HEALTH_CHECK')"><span class="source-icon">HC</span><strong>Health check</strong><p>Una URL critica de disponibilidad.</p><small>Configuracion rapida</small></button>
          <button [class.selected]="type() === 'API_ENDPOINT'" (click)="selectType('API_ENDPOINT')"><span class="source-icon">API</span><strong>Importar API</strong><p>Descubre endpoints desde OpenAPI o HAR.</p><small>Recomendado para APIs</small></button>
          <button [class.selected]="type() === 'BROWSER_JOURNEY'" (click)="selectType('BROWSER_JOURNEY')"><span class="source-icon">WEB</span><strong>Recorrido web</strong><p>Captura las solicitudes de una sesion real.</p><small>Requiere worker Playwright</small></button>
        </div>
        <label class="field app-select"><span>Aplicacion</span><select [(ngModel)]="applicationId">@for (app of store.applications(); track app.id) { <option [ngValue]="app.id">{{ app.name }} · {{ app.environment }}</option> }</select></label>
        <footer class="wizard-actions"><span></span><button class="button primary" (click)="step.set(2)">Continuar</button></footer>
      </section>
    }

    @if (step() === 2 && type() === 'API_ENDPOINT') {
      <section class="wizard-card import-layout">
        <div class="section-heading"><span>02</span><div><h2>Importar definicion</h2><p>Pega un documento OpenAPI JSON o carga un HAR exportado desde Network.</p></div></div>
        <div class="import-tabs"><button [class.active]="format() === 'OPENAPI'" (click)="format.set('OPENAPI')">OpenAPI JSON</button><button [class.active]="format() === 'HAR'" (click)="format.set('HAR')">Archivo HAR</button></div>
        @if (format() === 'OPENAPI') { <label class="field"><span>Documento</span><textarea [(ngModel)]="sourceDocument" class="code-input" spellcheck="false"></textarea></label> }
        @else { <label class="drop-zone"><input type="file" accept=".har,.json,application/json" (change)="readFile($event)" /><span>HAR</span><strong>{{ fileName() || 'Seleccionar archivo .har' }}</strong><small>Exportalo desde DevTools → Network → Save all as HAR</small></label> }
        @if (parseError()) { <p class="form-error">{{ parseError() }}</p> }
        <aside class="prototype-note"><strong>Prototipo backend disponible</strong><p>POST /api/monitor-discovery procesa OpenAPI y HAR JSON. Las referencias y OpenAPI avanzado quedan para la siguiente iteracion.</p></aside>
        <footer class="wizard-actions"><button class="button" (click)="step.set(1)">Atras</button><button class="button primary" (click)="discoverApi()">Descubrir endpoints</button></footer>
      </section>
    }

    @if (step() === 2 && type() === 'HEALTH_CHECK') {
      <section class="wizard-card"><div class="section-heading"><span>02</span><div><h2>Configurar health check</h2><p>Utilizaremos las credenciales heredadas de la aplicacion.</p></div></div><label class="field"><span>Nombre</span><input [(ngModel)]="healthName" /></label><label class="field"><span>URL</span><input [(ngModel)]="healthUrl" class="mono" /></label><footer class="wizard-actions"><button class="button" (click)="step.set(1)">Atras</button><button class="button primary" (click)="prepareHealth()">Revisar monitor</button></footer></section>
    }

    @if (step() === 2 && type() === 'BROWSER_JOURNEY') {
      <section class="wizard-card"><div class="section-heading"><span>02</span><div><h2>Definir recorrido</h2><p>El worker abrira un navegador aislado y registrara la red durante estas acciones.</p></div></div><label class="field"><span>URL inicial</span><input [(ngModel)]="journeyUrl" class="mono" /></label><div class="journey-steps"><div><i>1</i><span><strong>Abrir pagina</strong><small>{{ journeyUrl }}</small></span></div><div><i>2</i><span><strong>Iniciar sesion</strong><small>Usar credencial de la aplicacion</small></span></div><div><i>3</i><span><strong>Esperar actividad de red</strong><small>Capturar XHR, fetch, recursos y errores</small></span></div><button>+ Agregar accion</button></div><aside class="worker-warning"><strong>Worker pendiente</strong><p>El recorrido se puede guardar ahora, pero su ejecucion real necesitara el worker Playwright. La interfaz mostrara datos demostrativos hasta entonces.</p></aside><footer class="wizard-actions"><button class="button" (click)="step.set(1)">Atras</button><button class="button primary" (click)="prepareJourney()">Guardar recorrido</button></footer></section>
    }

    @if (step() === 3) {
      <section class="wizard-card wide"><div class="section-heading"><span>03</span><div><h2>Seleccionar solicitudes</h2><p>Se descubrieron {{ candidates().length }} candidatos. Activa solo operaciones estables y relevantes.</p></div></div>
        <div class="selection-toolbar"><label><input type="checkbox" [checked]="allSelected()" (change)="toggleAll()" /> Seleccionar todos</label><span>{{ selectedCount() }} seleccionados</span></div>
        <div class="candidate-list">@for (candidate of candidates(); track candidate.id) { <label><input type="checkbox" [checked]="candidate.selected" (change)="toggleCandidate(candidate.id)" /><span class="method" [class.post]="candidate.method === 'POST'">{{ candidate.method }}</span><span><strong>{{ candidate.name }}</strong><small class="mono">{{ candidate.url }}</small></span><em>{{ candidate.source }}</em></label> }</div>
        <footer class="wizard-actions"><button class="button" (click)="step.set(2)">Atras</button><button class="button primary" [disabled]="selectedCount() === 0" (click)="step.set(4)">Revisar seleccion</button></footer>
      </section>
    }

    @if (step() === 4) {
      <section class="wizard-card confirmation"><span class="confirmation-mark">{{ selectedCount() || 1 }}</span><h2>{{ type() === 'API_ENDPOINT' ? 'monitores listos para crear' : 'monitor listo para crear' }}</h2><p>Heredaran el entorno y la referencia de credencial de <strong>{{ selectedApplication()?.name }}</strong>.</p><dl><div><dt>Tipo</dt><dd>{{ typeLabel() }}</dd></div><div><dt>Frecuencia</dt><dd>Cada 5 minutos</dd></div><div><dt>Origen</dt><dd>{{ format() }}</dd></div></dl><footer class="wizard-actions"><button class="button" (click)="step.set(type() === 'API_ENDPOINT' ? 3 : 2)">Atras</button><button class="button primary" (click)="create()">Crear monitores</button></footer></section>
    }
  `,
})
export class MonitorCreate {
  readonly store = inject(SentinelStore);
  private readonly router = inject(Router);
  readonly step = signal(1);
  readonly type = signal<MonitorType>('API_ENDPOINT');
  readonly format = signal<'OPENAPI' | 'HAR' | 'BROWSER'>('OPENAPI');
  readonly candidates = signal<DiscoveryCandidate[]>([]);
  readonly parseError = signal('');
  readonly fileName = signal('');
  applicationId = this.store.applications()[1].id;
  sourceDocument = SAMPLE_OPENAPI;
  healthName = 'Disponibilidad principal';
  healthUrl = 'https://api.northstar.io/health';
  journeyUrl = 'https://app.northstar.io';
  readonly selectedApplication = computed(() => this.store.applicationById(this.applicationId));
  readonly selectedCount = computed(() => this.candidates().filter((item) => item.selected).length);
  readonly allSelected = computed(() => this.candidates().length > 0 && this.candidates().every((item) => item.selected));

  selectType(type: MonitorType): void { this.type.set(type); this.format.set(type === 'BROWSER_JOURNEY' ? 'BROWSER' : 'OPENAPI'); }
  typeLabel(): string { return ({ HEALTH_CHECK: 'Health check', API_ENDPOINT: 'Endpoints API', BROWSER_JOURNEY: 'Recorrido web' } as Record<MonitorType, string>)[this.type()]; }
  readFile(event: Event): void { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; this.fileName.set(file.name); const reader = new FileReader(); reader.onload = () => this.sourceDocument = String(reader.result); reader.readAsText(file); }
  discoverApi(): void {
    this.parseError.set('');
    try {
      const document = JSON.parse(this.sourceDocument);
      const discovered = this.format() === 'HAR' ? this.fromHar(document) : this.fromOpenApi(document);
      if (!discovered.length) throw new Error('No se encontraron solicitudes compatibles.');
      this.candidates.set(discovered); this.step.set(3);
    } catch (error) { this.parseError.set(error instanceof Error ? error.message : 'Documento no valido.'); }
  }
  private fromOpenApi(document: any): DiscoveryCandidate[] {
    const base = document.servers?.[0]?.url ?? '';
    return Object.entries(document.paths ?? {}).flatMap(([path, operations]: [string, any]) => Object.entries(operations).filter(([method]) => ['get','post','put','patch','delete','head','options'].includes(method)).map(([method, operation]: [string, any], index) => ({ id: `${method}-${path}-${index}`, name: operation.summary ?? `${method.toUpperCase()} ${path}`, method: method.toUpperCase(), url: `${base}${path}`, source: 'OPENAPI' as const, selected: method === 'get' })));
  }
  private fromHar(document: any): DiscoveryCandidate[] { return (document.log?.entries ?? []).filter((entry: any) => ['fetch', 'xhr'].includes(entry._resourceType) || entry.request?.url).map((entry: any, index: number) => ({ id: `har-${index}`, name: `${entry.request.method} ${new URL(entry.request.url).pathname}`, method: entry.request.method, url: entry.request.url, source: 'HAR' as const, selected: ['GET','HEAD'].includes(entry.request.method) })); }
  toggleCandidate(id: string): void { this.candidates.update((items) => items.map((item) => item.id === id ? { ...item, selected: !item.selected } : item)); }
  toggleAll(): void { const selected = !this.allSelected(); this.candidates.update((items) => items.map((item) => ({ ...item, selected }))); }
  prepareHealth(): void { this.candidates.set([{ id: 'health', name: this.healthName, method: 'GET', url: this.healthUrl, source: 'OPENAPI', selected: true }]); this.step.set(4); }
  prepareJourney(): void { this.candidates.set([{ id: 'journey', name: 'Recorrido de usuario', method: 'BROWSER', url: this.journeyUrl, source: 'BROWSER', selected: true }]); this.step.set(4); }
  create(): void { const created = this.store.addMonitors(this.candidates().filter((item) => item.selected).map((item) => ({ applicationId: this.applicationId, name: item.name, type: this.type(), method: item.method, url: item.url, active: true, lastStatus: 'unknown', config: { source: item.source, prototype: this.type() === 'BROWSER_JOURNEY' } }))); void this.router.navigate(created.length === 1 ? ['/monitors', created[0].id] : ['/monitors']); }
}
