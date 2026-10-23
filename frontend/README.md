# Sentinel frontend

Interfaz web de escritorio integrada con la API Spring Boot de Sentinel.

## Requisitos

- Node.js 22.22 o superior compatible con Angular 21
- npm 10

## Desarrollo

```bash
npm install
npm start
```

La aplicacion queda disponible en `http://localhost:4200`.
El servidor de desarrollo redirige `/api` hacia `http://localhost:8080` mediante
`proxy.conf.json`, por lo que el backend debe estar activo.

## Verificacion

```bash
npm run build
npm test -- --watch=false
```

## Secciones

- Resumen operativo
- Mapa de dependencias e incidencias
- Inventario y registro de aplicaciones
- Monitores de health check y endpoints API
- Importacion asistida de OpenAPI JSON y archivos HAR
- Recorridos web con contrato preparado para un worker Playwright
- Inspeccion de ejecuciones mediante waterfall de red
- Investigacion de incidencias y evidencia
- Referencias de credenciales para endpoints privados

El cliente y los contratos HTTP se encuentran en `src/app/core`. Los secretos
no se guardan en el frontend; los formularios solo manejan la referencia que
debe resolver el entorno del backend.

## Estado del prototipo

Aplicaciones, checks, monitores, descubrimiento OpenAPI/HAR, ejecuciones e
incidencias utilizan la API real. Los campos de entorno y etiquetas siguen
siendo locales porque el backend aun no los persiste.

Los recorridos web y su waterfall utilizan datos demostrativos. Sentinel no
simula esta capacidad en el backend: `BROWSER_JOURNEY` devuelve `501` hasta que
se despliegue un worker real basado en Playwright.

El mapa de topologia y el inventario de referencias de credenciales conservan
datos demostrativos hasta que sus contratos permitan relaciones entre
aplicaciones y administracion segura de secretos.
