import {
  ActivityItem,
  CredentialReference,
  Incident,
  MonitoredApplication,
  ServiceDependency,
} from './models';

export const MOCK_APPLICATIONS: MonitoredApplication[] = [
  { id: 1, name: 'Portal de clientes', code: 'WEB', url: 'https://app.northstar.io/health', active: true, status: 'healthy', authType: 'NONE', credentialConfigured: false, environment: 'Produccion', tags: ['web', 'clientes'], responseTimeMs: 184, uptime: 99.98, createdAt: '2026-09-12T11:20:00Z' },
  { id: 2, name: 'API Gateway', code: 'API', url: 'https://api.northstar.io/health', active: true, status: 'degraded', authType: 'BEARER', credentialRef: 'GATEWAY_HEALTH_TOKEN', credentialConfigured: true, environment: 'Produccion', tags: ['core', 'api'], responseTimeMs: 892, uptime: 98.72, createdAt: '2026-09-12T11:22:00Z' },
  { id: 3, name: 'Servicio de pagos', code: 'PAY', url: 'https://payments.northstar.io/status', active: true, status: 'down', authType: 'BEARER', credentialRef: 'PAYMENTS_MONITOR_TOKEN', credentialConfigured: true, environment: 'Produccion', tags: ['pagos', 'critico'], responseTimeMs: 0, uptime: 97.31, createdAt: '2026-09-18T08:10:00Z' },
  { id: 4, name: 'Base de datos principal', code: 'DB', url: 'https://db-probe.northstar.io/health', active: true, status: 'healthy', authType: 'BEARER', credentialRef: 'INFRA_PROBE_TOKEN', credentialConfigured: true, environment: 'Produccion', tags: ['datos', 'infra'], responseTimeMs: 42, uptime: 99.99, createdAt: '2026-09-19T14:45:00Z' },
  { id: 5, name: 'Servicio de identidad', code: 'ID', url: 'https://identity.northstar.io/health', active: true, status: 'healthy', authType: 'NONE', credentialConfigured: false, environment: 'Produccion', tags: ['auth', 'core'], responseTimeMs: 126, uptime: 99.96, createdAt: '2026-09-21T09:30:00Z' },
  { id: 6, name: 'Notificaciones', code: 'NTF', url: 'https://notify.northstar.io/health', active: true, status: 'degraded', authType: 'BEARER', credentialRef: 'NOTIFY_HEALTH_TOKEN', credentialConfigured: false, environment: 'Staging', tags: ['email', 'eventos'], responseTimeMs: 1240, uptime: 96.82, createdAt: '2026-10-02T17:05:00Z' },
  { id: 7, name: 'Motor antifraude', code: 'FRD', url: 'https://risk.northstar.io/health', active: false, status: 'unknown', authType: 'BEARER', credentialRef: 'RISK_API_TOKEN', credentialConfigured: true, environment: 'Desarrollo', tags: ['riesgo'], uptime: 99.4, createdAt: '2026-10-08T13:40:00Z' },
];

export const MOCK_INCIDENTS: Incident[] = [
  { id: 'INC-2048', title: 'Fallos al procesar pagos', summary: 'El endpoint de pagos responde 503 de forma sostenida. El gateway muestra un aumento correlacionado de latencia.', status: 'investigating', severity: 'critical', startedAt: '2026-10-22T13:42:00Z', affectedApplicationIds: [2, 3], evidence: [
    { id: 'ev-1', type: 'http-error', occurredAt: '2026-10-22T13:42:00Z', description: 'HTTP 503 detectado en Servicio de pagos', factual: true },
    { id: 'ev-2', type: 'latency', occurredAt: '2026-10-22T13:39:00Z', description: 'Latencia del API Gateway supero 800 ms', factual: true },
    { id: 'ev-3', type: 'note', occurredAt: '2026-10-22T14:01:00Z', description: 'Posible saturacion del proveedor externo; pendiente de confirmar.', factual: false },
  ] },
  { id: 'INC-2047', title: 'Latencia elevada en notificaciones', summary: 'Los checks de staging exceden el umbral de un segundo desde el ultimo despliegue.', status: 'open', severity: 'medium', startedAt: '2026-10-22T11:18:00Z', affectedApplicationIds: [6], evidence: [
    { id: 'ev-4', type: 'latency', occurredAt: '2026-10-22T11:18:00Z', description: 'Tiempo de respuesta de 1.240 ms', factual: true },
  ] },
  { id: 'INC-2046', title: 'Intermitencia en identidad', summary: 'Dos comprobaciones fallaron durante una ventana de mantenimiento.', status: 'resolved', severity: 'low', startedAt: '2026-10-21T22:04:00Z', resolvedAt: '2026-10-21T22:19:00Z', affectedApplicationIds: [5], evidence: [
    { id: 'ev-5', type: 'health-check', occurredAt: '2026-10-21T22:19:00Z', description: 'El servicio recupero su disponibilidad', factual: true },
  ] },
];

export const MOCK_DEPENDENCIES: ServiceDependency[] = [
  { id: 'dep-1', sourceApplicationId: 1, targetApplicationId: 2, type: 'calls' },
  { id: 'dep-2', sourceApplicationId: 2, targetApplicationId: 3, type: 'calls' },
  { id: 'dep-3', sourceApplicationId: 2, targetApplicationId: 4, type: 'depends-on' },
  { id: 'dep-4', sourceApplicationId: 2, targetApplicationId: 5, type: 'depends-on' },
  { id: 'dep-5', sourceApplicationId: 3, targetApplicationId: 4, type: 'depends-on' },
  { id: 'dep-6', sourceApplicationId: 2, targetApplicationId: 6, type: 'calls' },
  { id: 'dep-7', sourceApplicationId: 3, targetApplicationId: 7, type: 'calls' },
];

export const MOCK_CREDENTIALS: CredentialReference[] = [
  { id: 'cred-1', name: 'GATEWAY_HEALTH_TOKEN', type: 'BEARER', configured: true, applicationIds: [2], lastValidatedAt: '2026-10-22T14:08:00Z' },
  { id: 'cred-2', name: 'PAYMENTS_MONITOR_TOKEN', type: 'BEARER', configured: true, applicationIds: [3], lastValidatedAt: '2026-10-22T13:42:00Z' },
  { id: 'cred-3', name: 'INFRA_PROBE_TOKEN', type: 'BEARER', configured: true, applicationIds: [4], lastValidatedAt: '2026-10-22T14:10:00Z' },
  { id: 'cred-4', name: 'NOTIFY_HEALTH_TOKEN', type: 'BEARER', configured: false, applicationIds: [6] },
  { id: 'cred-5', name: 'RISK_API_TOKEN', type: 'BEARER', configured: true, applicationIds: [7], lastValidatedAt: '2026-10-20T09:12:00Z' },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'act-1', title: 'Incidente critico detectado', detail: 'Servicio de pagos devuelve HTTP 503', timestamp: 'Hace 8 min', tone: 'danger' },
  { id: 'act-2', title: 'Umbral de latencia superado', detail: 'API Gateway alcanzo 892 ms', timestamp: 'Hace 11 min', tone: 'warning' },
  { id: 'act-3', title: 'Servicio recuperado', detail: 'Identidad responde con normalidad', timestamp: 'Ayer, 22:19', tone: 'success' },
  { id: 'act-4', title: 'Aplicacion registrada', detail: 'Motor antifraude se agrego a Desarrollo', timestamp: '14 oct, 13:40', tone: 'neutral' },
];
