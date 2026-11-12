export function crearSolicitudesRecuperacion(supabase) {
  return {
    async obtenerEstudiante(authUid) {
      const { data, error } = await supabase
        .from('usuario')
        .select('id,rol')
        .eq('auth_uid', authUid)
        .single();

      if (error) throw error;
      return data;
    },

    async esReporteEncontrado(reporteId) {
      const { data, error } = await supabase
        .from('reporte')
        .select('id')
        .eq('id', reporteId)
        .eq('tipo', 'ENCONTRADO')
        .eq('estado', 'APROBADO')
        .maybeSingle();

      if (error) throw error;
      return Boolean(data);
    },

    async crear(solicitud) {
      const { data, error } = await supabase
        .from('solicitud_recuperacion')
        .insert({
          reporte_id: solicitud.reporteId,
          solicitante_id: solicitud.solicitanteId,
          lugar_estimado: solicitud.lugarEstimado,
          fecha_estimada: solicitud.fechaEstimada,
          caracteristica_privada: solicitud.caracteristicaPrivada
        })
        .select('id')
        .single();

      if (error) throw error;
      return data;
    }
  };
}
