import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SentinelStore } from '../../core/sentinel.store';
import { AuthType, MonitoredApplication } from '../../core/models';

@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <header class="page-heading compact">
      <div><a class="back-link" routerLink="/applications">← Aplicaciones</a><h1>Registrar aplicacion</h1><p>Configura un endpoint HTTP para comenzar a supervisarlo.</p></div>
    </header>
    <form class="form-layout" [formGroup]="form" (ngSubmit)="submit()">
      <section class="form-card">
        <div class="section-heading"><span>01</span><div><h2>Identificacion</h2><p>Informacion visible en el inventario y el mapa.</p></div></div>
        <div class="field-grid two">
          <label class="field"><span>Nombre de la aplicacion</span><input formControlName="name" placeholder="Ej. API de facturacion" />@if (showError('name')) { <small>Introduce un nombre de al menos 3 caracteres.</small> }</label>
          <label class="field"><span>Entorno</span><select formControlName="environment"><option>Produccion</option><option>Staging</option><option>Desarrollo</option></select></label>
        </div>
        <label class="field"><span>URL de comprobacion</span><input class="mono" formControlName="url" placeholder="https://api.example.com/health" />@if (showError('url')) { <small>Debe ser una URL HTTP o HTTPS valida.</small> }</label>
        <label class="field"><span>Etiquetas <em>separadas por comas</em></span><input formControlName="tags" placeholder="core, pagos, critico" /></label>
      </section>

      <section class="form-card">
        <div class="section-heading"><span>02</span><div><h2>Credenciales</h2><p>Sentinel utiliza referencias seguras; nunca almacena el secreto en esta interfaz.</p></div></div>
        <div class="auth-options">
          <label [class.selected]="form.controls.authType.value === 'NONE'"><input type="radio" formControlName="authType" value="NONE" /><span><strong>Sin autenticacion</strong><small>El endpoint es accesible publicamente.</small></span></label>
          <label [class.selected]="form.controls.authType.value === 'BEARER'"><input type="radio" formControlName="authType" value="BEARER" /><span><strong>Bearer token</strong><small>El token se resuelve desde el entorno del backend.</small></span></label>
        </div>
        @if (form.controls.authType.value === 'BEARER') {
          <label class="field"><span>Referencia de credencial</span><input class="mono" formControlName="credentialRef" placeholder="BILLING_HEALTH_TOKEN" /><small class="hint">Introduce el nombre de la variable, no el token.</small></label>
        }
        <aside class="notice"><strong>Politica de destinos</strong><p>Las URLs locales, privadas o fuera de la lista permitida pueden ser rechazadas por Sentinel.</p></aside>
      </section>

      <footer class="form-actions"><a class="button" routerLink="/applications">Cancelar</a><button class="button primary" type="submit">Registrar y continuar</button></footer>
    </form>
  `,
})
export class ApplicationForm {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(SentinelStore);
  private readonly router = inject(Router);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/\S+$/)]],
    environment: ['Produccion' as MonitoredApplication['environment'], Validators.required],
    tags: [''],
    authType: ['NONE' as AuthType, Validators.required],
    credentialRef: [''],
  });

  showError(name: 'name' | 'url'): boolean { const control = this.form.controls[name]; return control.invalid && (control.dirty || control.touched); }

  submit(): void {
    if (this.form.invalid || (this.form.controls.authType.value === 'BEARER' && !this.form.controls.credentialRef.value.trim())) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.store.addApplication({ ...value, credentialRef: value.credentialRef.trim() || undefined, tags: value.tags.split(',').map((tag) => tag.trim()).filter(Boolean) }).subscribe({
      next: (application) => void this.router.navigate(['/applications', application.id]),
      error: () => this.form.setErrors({ api: true }),
    });
  }
}
