import { crearSolicitudesRecuperacion } from '../solicitudesRecuperacion.js';

describe('persistencia de solicitudes de recuperación', () => {
  it('resuelve una solicitud usando la función transaccional del repositorio', async () => {
    const rpc = jest.fn(async () => ({ error: null }));
    const supabase = { rpc };
    const repositorio = crearSolicitudesRecuperacion(supabase);

    await expect(repositorio.resolverPendiente({
      solicitudId: 12,
      accion: 'VALIDAR_PROPIETARIO',
      administrativoId: 3
    })).resolves.toEqual({ id: 12, accion: 'VALIDAR_PROPIETARIO' });

    expect(rpc).toHaveBeenCalledWith('resolver_solicitud_recuperacion', {
      p_solicitud_id: 12,
      p_accion: 'VALIDAR_PROPIETARIO',
      p_administrativo_id: 3
    });
  });

  it('obtiene el ID del administrador autenticado para registrar la resolución', async () => {
    const consulta = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(async () => ({ data: { id: 3 }, error: null }))
    };
    const supabase = { from: jest.fn(() => consulta) };

    await expect(crearSolicitudesRecuperacion(supabase).obtenerIdAdministrador('auth-admin'))
      .resolves.toBe(3);

    expect(supabase.from).toHaveBeenCalledWith('usuario');
    expect(consulta.eq).toHaveBeenNthCalledWith(1, 'auth_uid', 'auth-admin');
    expect(consulta.eq).toHaveBeenNthCalledWith(2, 'rol', 'ADMINISTRATIVO');
  });

  it('obtiene el detalle de una solicitud pendiente con datos privados y del reporte', async () => {
    const consulta = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(async () => ({
        data: {
          id: 12,
          reporte_id: 7,
          lugar_estimado: 'Cafetería',
          fecha_estimada: '2026-11-14',
          caracteristica_privada: 'Sticker de estrella',
          estado: 'PENDIENTE',
          solicitante: {
            nombre: 'Nicole Herbas',
            correo_institucional: 'estudiante@ucb.edu.bo'
          },
          reporte: {
            fecha: '2026-10-02',
            hora: '09:40:00',
            lugar: 'Biblioteca',
            detalle_privado: 'Marca en el estuche',
            estado: 'APROBADO',
            objeto: {
              nombre: 'Audífonos blancos',
              categoria: 'Electrónica',
              descripcion: 'Audífonos en su estuche.',
              foto: 'audifonos.jpg'
            }
          }
        },
        error: null
      }))
    };
    const supabase = { from: jest.fn(() => consulta) };

    const detalle = await crearSolicitudesRecuperacion(supabase).obtenerDetallePendiente(12);

    expect(detalle).toEqual({
      id: 12,
      reporteId: 7,
      estado: 'PENDIENTE',
      solicitante: 'Nicole Herbas',
      correoSolicitante: 'estudiante@ucb.edu.bo',
      lugarEstimado: 'Cafetería',
      fechaEstimada: '2026-11-14',
      caracteristicaPrivada: 'Sticker de estrella',
      titulo: 'Audífonos blancos',
      categoria: 'Electrónica',
      descripcion: 'Audífonos en su estuche.',
      imagen: 'audifonos.jpg',
      lugarReporte: 'Biblioteca',
      fechaReporte: '2026-10-02',
      horaReporte: '09:40',
      detallePrivadoReporte: 'Marca en el estuche'
    });
    expect(supabase.from).toHaveBeenCalledWith('solicitud_recuperacion');
    expect(consulta.eq).toHaveBeenNthCalledWith(1, 'id', 12);
    expect(consulta.eq).toHaveBeenNthCalledWith(2, 'estado', 'PENDIENTE');
    expect(consulta.select.mock.calls[0][0]).toContain('detalle_privado');
  });

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
