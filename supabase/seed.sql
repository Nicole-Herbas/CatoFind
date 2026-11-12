-- Datos de demostración derivados de src/app/core/data/datosIniciales.js.
-- Los perfiles no tienen credenciales de Supabase Auth y sirven solo como
-- autores/revisores de estos reportes de ejemplo.

insert into public.usuario (nombre, correo_institucional, rol)
select 'Estudiante de demostración', 'estudiante.demo@ucb.edu.bo', 'ESTUDIANTE'
where not exists (
  select 1 from public.usuario where lower(correo_institucional) = 'estudiante.demo@ucb.edu.bo'
);

insert into public.usuario (nombre, correo_institucional, rol)
select 'Administrativo de demostración', 'administrativo.demo@ucb.edu.bo', 'ADMINISTRATIVO'
where not exists (
  select 1 from public.usuario where lower(correo_institucional) = 'administrativo.demo@ucb.edu.bo'
);

with ejemplos (nombre, categoria, fecha, lugar, imagen, estado) as (
  values
    ('Mochila negra', 'Accesorios', date '2026-10-08', 'Biblioteca', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', 'APROBADO'::public.estado_reporte),
    ('Chompa azul', 'Ropa', date '2026-10-05', 'Cafetería', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80', 'APROBADO'::public.estado_reporte),
    ('Cuaderno verde', 'Documentos', date '2026-09-30', 'Laboratorio', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80', 'APROBADO'::public.estado_reporte),
    ('Audífonos Sony', 'Electrónica', date '2026-10-12', 'Bloque A', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', 'APROBADO'::public.estado_reporte),
    ('Carnet universitario', 'Documentos', date '2026-10-15', 'Bloque B', 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400&q=80', 'APROBADO'::public.estado_reporte),
    ('Calculadora científica', 'Electrónica', date '2026-10-18', 'Bloque A', '', 'PENDIENTE'::public.estado_reporte)
)
insert into public.objeto (nombre, categoria, foto)
select e.nombre, e.categoria, e.imagen
from ejemplos e
where not exists (
  select 1 from public.objeto o
  where o.nombre = e.nombre and o.categoria = e.categoria
);

with ejemplos (nombre, categoria, fecha, lugar, estado) as (
  values
    ('Mochila negra', 'Accesorios', date '2026-10-08', 'Biblioteca', 'APROBADO'::public.estado_reporte),
    ('Chompa azul', 'Ropa', date '2026-10-05', 'Cafetería', 'APROBADO'::public.estado_reporte),
    ('Cuaderno verde', 'Documentos', date '2026-09-30', 'Laboratorio', 'APROBADO'::public.estado_reporte),
    ('Audífonos Sony', 'Electrónica', date '2026-10-12', 'Bloque A', 'APROBADO'::public.estado_reporte),
    ('Carnet universitario', 'Documentos', date '2026-10-15', 'Bloque B', 'APROBADO'::public.estado_reporte),
    ('Calculadora científica', 'Electrónica', date '2026-10-18', 'Bloque A', 'PENDIENTE'::public.estado_reporte)
)
insert into public.reporte (
  tipo, fecha, lugar, contacto, estado, fecha_revision,
  estudiante_id, administrativo_id, objeto_id
)
select
  'ENCONTRADO', e.fecha, e.lugar, estudiante.correo_institucional, e.estado,
  case when e.estado = 'APROBADO' then current_date else null end,
  estudiante.id,
  case when e.estado = 'APROBADO' then administrativo.id else null end,
  objeto.id
from ejemplos e
join public.objeto objeto on objeto.nombre = e.nombre and objeto.categoria = e.categoria
join public.usuario estudiante on estudiante.correo_institucional = 'estudiante.demo@ucb.edu.bo'
join public.usuario administrativo on administrativo.correo_institucional = 'administrativo.demo@ucb.edu.bo'
where not exists (
  select 1 from public.reporte reporte where reporte.objeto_id = objeto.id
);
