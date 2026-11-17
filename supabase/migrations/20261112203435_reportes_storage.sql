-- Persistencia de los campos privados del reporte y bucket privado para fotografías.
alter table public.reporte
  add column if not exists hora time,
  add column if not exists detalle_privado text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'reportes',
  'reportes',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;