# Sentinel frontend

Interfaz web de escritorio para explorar el producto Sentinel antes de conectar
los contratos definitivos del backend. Actualmente utiliza datos simulados en
memoria.

## Requisitos

- Node.js 22.22 o superior compatible con Angular 21
- npm 10

## Desarrollo

```bash
npm install
npm start
```

La aplicacion queda disponible en `http://localhost:4200`.

## Verificacion

```bash
npm run build
npm test -- --watch=false
```

## Secciones

- Resumen operativo
- Mapa de dependencias e incidencias
- Inventario y registro de aplicaciones
- Investigacion de incidencias y evidencia
- Referencias de credenciales para endpoints privados

Los mocks y contratos provisionales se encuentran en `src/app/core`. Los
secretos no se guardan en el frontend; los formularios solo manejan la
referencia que debe resolver el entorno del backend.
