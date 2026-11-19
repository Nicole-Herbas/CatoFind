create or replace function public.resolver_solicitud_recuperacion(
  p_solicitud_id integer,
  p_accion text,
  p_administrativo_id integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reporte_id integer;
begin
  if p_administrativo_id is null then
    raise exception using
      errcode = '22023',
      message = 'ADMINISTRADOR_INVALIDO';
  end if;

  select solicitud.reporte_id
    into v_reporte_id
    from public.solicitud_recuperacion as solicitud
    join public.reporte as reporte on reporte.id = solicitud.reporte_id
   where solicitud.id = p_solicitud_id
     and solicitud.estado = 'PENDIENTE'
   for update of solicitud, reporte;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'SOLICITUD_NO_ENCONTRADA';
  end if;

  if p_accion = 'VALIDAR_PROPIETARIO' then
    update public.reporte
       set estado = 'CERRADO',
           administrativo_id = p_administrativo_id,
           fecha_revision = current_date
     where id = v_reporte_id
       and estado = 'APROBADO';

    if not found then
      raise exception using
        errcode = 'P0001',
        message = 'REPORTE_NO_DISPONIBLE';
    end if;
  elsif p_accion = 'RECHAZAR' then
    null;
  else
    raise exception using
      errcode = '22023',
      message = 'ACCION_INVALIDA';
  end if;

  delete from public.solicitud_recuperacion
   where id = p_solicitud_id;
end;
$$;

revoke all on function public.resolver_solicitud_recuperacion(integer, text, integer)
  from public, anon, authenticated;
grant execute on function public.resolver_solicitud_recuperacion(integer, text, integer)
  to service_role;

notify pgrst, 'reload schema';
