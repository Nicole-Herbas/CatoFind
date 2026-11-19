import { crearSolicitudesRecuperacion } from '../solicitudesRecuperacion.js';

describe('persistencia de solicitudes de recuperación', () => {
  it('guarda la solicitud asociada al reporte y al estudiante', async () => {
    const insert = jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(async () => ({ data: { id: 12 }, error: null }))
      }))
    }));
    const supabase = { from: jest.fn(() => ({ insert })) };

    await expect(crearSolicitudesRecuperacion(supabase).crear({
      reporteId: 4, solicitanteId: 7, lugarEstimado: 'biblioteca',
      fechaEstimada: '2026-10-20', caracteristicaPrivada: 'Costura en la manga'
    })).resolves.toEqual({ id: 12 });

    expect(supabase.from).toHaveBeenCalledWith('solicitud_recuperacion');
    expect(insert).toHaveBeenCalledWith({
      reporte_id: 4,
      solicitante_id: 7,
      lugar_estimado: 'biblioteca',
      fecha_estimada: '2026-10-20',
      caracteristica_privada: 'Costura en la manga'
    });
  });

  it('consulta solo las solicitudes del estudiante y devuelve los datos visibles', async () => {
    const solicitudes = [{
      id: 12,
      fecha_solicitud: '2026-11-18T00:00:00.000Z',
      estado: 'RECHAZADA',
      motivo_rechazo: 'El nombre no coincide.',
      reporte: { objeto: { nombre: 'Mochila' } }
    }];
    const consulta = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn(async () => ({ data: solicitudes, error: null }))
    };
    const supabase = { from: jest.fn(() => consulta) };

    await expect(crearSolicitudesRecuperacion(supabase).listarPorSolicitante(7))
      .resolves.toEqual(solicitudes);

    expect(supabase.from).toHaveBeenCalledWith('solicitud_recuperacion');
    expect(consulta.select).toHaveBeenCalledWith(
      'id,fecha_solicitud,estado,motivo_rechazo,reporte(objeto(nombre))'
    );
    expect(consulta.eq).toHaveBeenCalledWith('solicitante_id', 7);
    expect(consulta.order).toHaveBeenCalledWith('fecha_solicitud', { ascending: false });
  });
});
