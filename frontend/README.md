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
- Recorridos web deshabilitados hasta disponer de un worker Playwright real
- Inspeccion de ejecuciones HTTP y evidencia sanitizada
- Investigacion de incidencias y evidencia
- Referencias de credenciales para endpoints privados

El cliente y los contratos HTTP se encuentran en `src/app/core`. Los secretos
no se guardan en el frontend; los formularios solo manejan la referencia que
debe resolver el entorno del backend.

## Estado operativo

Aplicaciones, checks, monitores, descubrimiento OpenAPI/HAR, ejecuciones,
incidencias, dependencias, mapa y referencias de credenciales utilizan la API
real. Sentinel no carga fixtures ni presenta resultados de red inventados.

`BROWSER_JOURNEY` permanece visible como contrato futuro, pero no genera datos:
devuelve `501` hasta que se despliegue un worker real basado en Playwright.

El scheduler ejecuta automaticamente monitores HTTP activos `GET`/`HEAD`. Cada
monitor puede definir `intervalSeconds`, `expectedStatus` o
`expectedStatuses`. El intervalo minimo predeterminado es de 60 segundos.
