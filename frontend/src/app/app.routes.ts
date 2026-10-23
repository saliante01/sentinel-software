import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'overview', loadComponent: () => import('./features/overview/overview').then((m) => m.Overview) },
  { path: 'map', loadComponent: () => import('./features/topology/topology').then((m) => m.Topology) },
  { path: 'applications', loadComponent: () => import('./features/applications/applications').then((m) => m.Applications) },
  { path: 'applications/new', loadComponent: () => import('./features/applications/application-form').then((m) => m.ApplicationForm) },
  { path: 'applications/:id', loadComponent: () => import('./features/applications/application-detail').then((m) => m.ApplicationDetail) },
  { path: 'incidents', loadComponent: () => import('./features/incidents/incidents').then((m) => m.Incidents) },
  { path: 'credentials', loadComponent: () => import('./features/credentials/credentials').then((m) => m.Credentials) },
  { path: 'monitors', loadComponent: () => import('./features/monitors/monitors').then((m) => m.Monitors) },
  { path: 'monitors/new', loadComponent: () => import('./features/monitors/monitor-create').then((m) => m.MonitorCreate) },
  { path: 'monitors/:id', loadComponent: () => import('./features/monitors/monitor-detail').then((m) => m.MonitorDetail) },
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  { path: '**', redirectTo: 'overview' },
];
