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
});
