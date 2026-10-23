import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SentinelStore } from '../../core/sentinel.store';

@Component({
  selector: 'app-credentials',
  imports: [FormsModule],
  template: `
    <header class="page-heading">
      <div><p class="eyebrow">Configuracion segura</p><h1>Credenciales</h1><p>Referencias utilizadas para autenticar comprobaciones privadas.</p></div>
      <button class="button primary" (click)="dialogOpen.set(true)">+ Nueva referencia</button>
    </header>
    <aside class="security-banner"><span>SEC</span><div><strong>Los secretos no se almacenan en el navegador</strong><p>Sentinel solo guarda el nombre de la variable configurada en el entorno del backend.</p></div></aside>
    <section class="credential-grid">
      @for (credential of store.credentials(); track credential.id) {
        <article class="credential-card">
          <div class="credential-head"><span class="key-icon">K</span><span class="status" [class]="credential.configured ? 'healthy' : 'down'"><i></i>{{ credential.configured ? 'Configurada' : 'Pendiente' }}</span></div>
          <h2>{{ credential.name }}</h2><p>Bearer token</p>
          <div class="credential-apps"><span>USADA POR</span>@for (id of credential.applicationIds; track id) { <strong>{{ store.applicationById(id)?.name }}</strong> }</div>
          <footer><span>{{ credential.lastValidatedAt ? 'Validada ' + formatDate(credential.lastValidatedAt) : 'Sin validar' }}</span><button>Revisar</button></footer>
        </article>
      }
    </section>
    @if (dialogOpen()) {
      <div class="dialog-backdrop" (click)="dialogOpen.set(false)">
        <section class="dialog" (click)="$event.stopPropagation()"><div class="dialog-heading"><div><p class="eyebrow">Nueva referencia</p><h2>Registrar credencial</h2></div><button (click)="dialogOpen.set(false)">×</button></div><label class="field"><span>Nombre de variable</span><input [(ngModel)]="credentialName" class="mono" placeholder="SERVICE_HEALTH_TOKEN" /></label><p class="dialog-help">Configura esta misma variable en el entorno donde se ejecuta Sentinel. No introduzcas aqui el valor secreto.</p><footer><button class="button" (click)="dialogOpen.set(false)">Cancelar</button><button class="button primary" (click)="dialogOpen.set(false)">Guardar referencia</button></footer></section>
      </div>
    }
  `,
})
export class Credentials {
  readonly store = inject(SentinelStore);
  readonly dialogOpen = signal(false);
  readonly credentialName = signal('');
  formatDate(value: string): string { return new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(value)); }
}
