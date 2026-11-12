# CatoFind

Aplicación para consultar objetos publicados y gestionar solicitudes de recuperación dentro de la comunidad UCB.

## Requisitos

- Node.js con soporte para `--env-file-if-exists`.
- PostgreSQL en Supabase.

## Instalación y configuración

```sh
npm install
```

Copia `.env.example` a `.env` y configura `SUPABASE_URL` y `SUPABASE_SECRET_KEY` con los valores del proyecto. La clave secreta se usa solo en el backend; no la incluyas en el frontend ni en Git. `PORT` es opcional y usa `3000` por defecto.

## Base de datos

El esquema versionado está en `supabase/migrations/202611120001_initial_schema.sql` y los datos demostrativos en `supabase/seed.sql`. Ambos se aplicaron al proyecto Supabase de pruebas autorizado.

El seed crea un perfil estudiantil y uno administrativo sin credenciales de Auth, además de seis ejemplos del catálogo: cinco aprobados y uno pendiente. Son solo datos de demostración; los perfiles no sirven para iniciar sesión. El registro público crea estudiantes mediante Supabase Auth. Las cuentas administrativas se provisionan por separado en un proceso protegido.

## Ejecución

Abre dos terminales desde la raíz del proyecto. Inicia la API:

```sh
npm run start:backend
```

En la otra terminal, inicia la aplicación web:

```sh
npm start
```

Parcel reenvía `/api` al backend en `http://localhost:3000`.
En PowerShell, si `.env` fija `PORT=3000`, inicia el frontend en otra terminal con
`$env:PORT = '1234'` y después `npm.cmd start`; abre `http://localhost:1234`.
Reinicia el backend tras cambiar su código para cargar la versión nueva.

## Pruebas

```sh
npm test
```

## Datos y autenticación

- `GET /api/objetos` devuelve reportes aprobados con el estado visible `Publicado`.
- El registro y el inicio de sesión aceptan correos `@ucb.edu.bo`.
- El inicio de sesión consulta Supabase Auth y el perfil en `usuario`. El navegador conserva únicamente el token y el perfil de la sesión activa.
- Las solicitudes de recuperación requieren una sesión y se asocian al reporte encontrado y al estudiante autenticado.
- Inicio y búsqueda muestran objetos de `GET /api/objetos`; si la API falla, muestran un error en vez de datos locales.

## Estado de la conexión local

El backend requiere `.env` para conectarse. Si `npm run start:backend` indica que falta `SUPABASE_URL` o `SUPABASE_SECRET_KEY`, configura esas variables localmente. No guardes la clave secreta en el repositorio.
