# Inventario MVP

Sistema web de inventario para un pequeno negocio que combina restaurante y venta de granos basicos. El proyecto esta pensado como MVP funcional y desplegable, con una base clara para crecer despues.

## Documentacion disponible

- Vista general del proyecto: `README.md`
- Reglas del negocio para personas no tecnicas: [README_NEGOCIO.md](/Users/andreetorres/Desktop/inventario-mvp/README_NEGOCIO.md)
- Manual tecnico de estructura, operacion y cambios: [README_TECNICO.md](/Users/andreetorres/Desktop/inventario-mvp/README_TECNICO.md)

## Stack elegido

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: PostgreSQL
- Autenticacion: JWT con roles

## Estructura del proyecto

```text
inventario-mvp/
├── backend/
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── layout/
│       ├── pages/
│       ├── styles/
│       └── utils/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── .env.example
└── package.json
```

## Modulos incluidos

- Login con roles `administrador`, `vendedor` y `encargado de inventario`
- Productos y categorias
- Proveedores
- Inventario y movimientos
- Compras con actualizacion automatica de stock
- Ventas con validacion de stock
- Recetas para comida preparada con descuento automatico de ingredientes
- Alertas de bajo stock, recetas sin ingredientes y productos sin movimiento
- Reportes basicos
- Dashboard

## Reglas de negocio implementadas

- No permite vender productos normales si no hay stock suficiente
- Si el producto vendido tiene receta, valida ingredientes antes de vender
- Al vender comida preparada, descuenta ingredientes del inventario
- Todas las compras generan movimientos de inventario
- Los ajustes manuales, consumos internos y mermas quedan en historial
- Los productos manejan estado `active/inactive` en lugar de borrado fisico

## Variables de entorno

Copia `.env.example` a `.env`.

```env
BACKEND_PORT=4000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventario_mvp
VITE_API_URL=http://localhost:4000/api
```

## Instalacion local

### 1. Crear la base de datos

```sql
CREATE DATABASE inventario_mvp;
```

### 2. Ejecutar esquema y datos de prueba

```bash
psql -U postgres -d inventario_mvp -f database/schema.sql
psql -U postgres -d inventario_mvp -f database/seed.sql
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Iniciar backend

```bash
npm run dev:backend
```

### 5. Iniciar frontend

En otra terminal:

```bash
npm run dev:frontend
```

### 6. Accesos de prueba

- Administrador: `admin@inventario.local` / `password123`
- Vendedor: `vendedor@inventario.local` / `password123`
- Inventario: `inventario@inventario.local` / `password123`

## Endpoints principales

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET|POST|PUT /api/products`
- `GET|POST|PUT /api/catalog/categories`
- `GET|POST|PUT /api/catalog/suppliers`
- `GET|POST /api/inventory/movements`
- `GET /api/inventory/alerts`
- `GET|POST /api/purchases`
- `GET|POST /api/sales`
- `GET|POST|PUT /api/recipes`
- `GET /api/reports/*`
- `GET /api/dashboard`

## Deploy sugerido

### Opcion 1: Render + Neon/Supabase

- Subir este repositorio a GitHub
- Crear una base PostgreSQL en Neon o Supabase
- Crear un servicio web para el backend
- Configurar variables:
  - `BACKEND_PORT`
  - `FRONTEND_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `DATABASE_URL`
- Build backend: `npm install`
- Start backend: `npm run start --workspace backend`
- Crear un sitio estatico para el frontend
- Build frontend: `npm install && npm run build --workspace frontend`
- Publicar carpeta `frontend/dist`
- Configurar `VITE_API_URL` con la URL publica del backend

### Opcion 2: Railway

- Crear proyecto nuevo
- Conectar repositorio
- Agregar servicio PostgreSQL
- Definir las mismas variables de entorno
- Backend:
  - Start command: `npm run start --workspace backend`
- Frontend:
  - Build command: `npm install && npm run build --workspace frontend`

## Notas tecnicas

- El frontend es responsive y oculta modulos segun rol
- El backend usa transacciones para compras, ventas y recetas
- Los scripts SQL estan separados para facilitar instalacion, pruebas y despliegue
- Si luego quieres crecer el proyecto, el siguiente paso razonable es introducir ORM, pruebas automatizadas y paginacion
