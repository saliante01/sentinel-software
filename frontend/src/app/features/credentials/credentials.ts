import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SentinelStore } from '../../core/sentinel.store';

@Component({
  selector: 'app-credentials',
  imports: [RouterLink],
  template: `
    <header class="page-heading"><div><p class="eyebrow">Configuracion segura</p><h1>Credenciales</h1><p>Estado real de autenticacion de las aplicaciones registradas.</p></div><a class="button primary" routerLink="/applications/new">Registrar aplicacion</a></header>
    <aside class="security-banner"><span>SEC</span><div><strong>Sentinel no expone nombres ni valores secretos</strong><p>Las referencias se configuran al registrar la aplicacion y sus valores se resuelven exclusivamente en el entorno del backend.</p></div></aside>
    <section class="credential-grid">
      @for (credential of store.credentials(); track credential.id) {
        <article class="credential-card"><div class="credential-head"><span class="key-icon">K</span><span class="status healthy"><i></i>Configurada</span></div><h2>{{ credential.name }}</h2><p>{{ credential.type === 'BEARER' ? 'Bearer token' : credential.type }}</p><div class="credential-apps"><span>USADA POR</span>@for (id of credential.applicationIds; track id) { <strong>{{ store.applicationById(id)?.name }}</strong> }</div><footer><span>Resuelta por Spring Environment</span><a class="row-action" [routerLink]="['/applications', credential.applicationIds[0]]">Ver aplicacion</a></footer></article>
      } @empty {
        <div class="empty-state"><h2>No hay credenciales configuradas</h2><p>Registra una aplicacion con autenticacion Bearer y una referencia disponible en el entorno del backend.</p></div>
      }
    </section>
  `,
})
export class Credentials { readonly store = inject(SentinelStore); }
