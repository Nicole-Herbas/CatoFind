alter type public.estado_solicitud_recuperacion
  add value if not exists 'ENTREGADA';

alter table public.solicitud_recuperacion
  add column if not exists fecha_solicitud timestamptz;

alter table public.solicitud_recuperacion
  alter column fecha_solicitud set default now();

alter table public.solicitud_recuperacion
  add column if not exists motivo_rechazo text;
