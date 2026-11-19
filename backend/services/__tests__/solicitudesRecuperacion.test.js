import { crearSolicitudesRecuperacion } from '../solicitudesRecuperacion.js';

describe('solicitudes de recuperación', () => {
  it('guarda los datos con el estudiante autenticado y el reporte encontrado', async () => {
    const supabase = {
      auth: { getUser: jest.fn(async () => ({
        data: { user: { id: 'auth-1' } }, error: null
      })) }
    };
    const repositorio = {
      obtenerEstudiante: jest.fn(async () => ({ id: 7, rol: 'ESTUDIANTE' })),
      esReporteEncontrado: jest.fn(async () => true),
      crear: jest.fn(async solicitud => ({ id: 12, ...solicitud }))
    };
    const servicio = crearSolicitudesRecuperacion(supabase, repositorio);

    const solicitud = await servicio.crear({
      token: 'token-valido',
      reporteId: 4,
      lugarEstimado: 'biblioteca',
      fechaEstimada: '2026-10-20',
      caracteristicaPrivada: 'Costura en la manga'
    });

    expect(repositorio.crear).toHaveBeenCalledWith({
      reporteId: 4,
      solicitanteId: 7,
      lugarEstimado: 'biblioteca',
      fechaEstimada: '2026-10-20',
      caracteristicaPrivada: 'Costura en la manga'
    });
    expect(solicitud.id).toBe(12);
  });

  it('rechaza solicitudes sin una sesión válida', async () => {
    const supabase = { auth: { getUser: jest.fn(async () => ({ data: { user: null }, error: new Error() })) } };
    const repositorio = { crear: jest.fn() };

    await expect(crearSolicitudesRecuperacion(supabase, repositorio).crear({
      token: '', reporteId: 4, lugarEstimado: 'biblioteca',
      fechaEstimada: '2026-10-20', caracteristicaPrivada: 'marca'
    })).rejects.toMatchObject({ codigo: 'NO_AUTORIZADO' });
    expect(repositorio.crear).not.toHaveBeenCalled();
  });

  it('solo permite a estudiantes solicitar un reporte encontrado', async () => {
    const supabase = { auth: { getUser: jest.fn(async () => ({ data: { user: { id: 'auth-1' } } })) } };
    const repositorio = {
      obtenerEstudiante: jest.fn(async () => ({ id: 7, rol: 'ESTUDIANTE' })),
      esReporteEncontrado: jest.fn(async () => false),
      crear: jest.fn()
    };

    await expect(crearSolicitudesRecuperacion(supabase, repositorio).crear({
      token: 'token-valido', reporteId: 4, lugarEstimado: 'biblioteca',
      fechaEstimada: '2026-10-20', caracteristicaPrivada: 'marca'
    })).rejects.toMatchObject({ codigo: 'REPORTE_INVALIDO' });
    expect(repositorio.crear).not.toHaveBeenCalled();
  });

  it('rechaza datos incompletos antes de consultar el almacenamiento', async () => {
    const supabase = { auth: { getUser: jest.fn() } };
    const repositorio = { crear: jest.fn() };

    await expect(crearSolicitudesRecuperacion(supabase, repositorio).crear({
      token: 'token-valido', reporteId: 4, lugarEstimado: '',
      fechaEstimada: '', caracteristicaPrivada: ''
    })).rejects.toMatchObject({ codigo: 'VALIDACION' });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it('rechaza fechas que no existen en el calendario', async () => {
    const supabase = { auth: { getUser: jest.fn() } };
    const repositorio = { crear: jest.fn() };

    await expect(crearSolicitudesRecuperacion(supabase, repositorio).crear({
      token: 'token-valido', reporteId: 4, lugarEstimado: 'biblioteca',
      fechaEstimada: '2026-02-30', caracteristicaPrivada: 'marca'
    })).rejects.toMatchObject({ codigo: 'VALIDACION' });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it('lista por el identificador persistido de cada estudiante autenticado', async () => {
    const estudiantes = new Map([
      ['auth-ana', { id: 7, rol: 'ESTUDIANTE' }],
      ['auth-luis', { id: 8, rol: 'ESTUDIANTE' }]
    ]);
    const supabase = {
      auth: {
        getUser: jest.fn(async token => ({
          data: { user: { id: token === 'token-ana' ? 'auth-ana' : 'auth-luis' } },
          error: null
        }))
      }
    };
    const solicitudesPorEstudiante = new Map([
      [7, [{
        id: 31, fecha_solicitud: '2026-11-18T00:00:00.000Z', estado: 'PENDIENTE',
        motivo_rechazo: null, reporte: { objeto: { nombre: 'Mochila' } }
      }]],
      [8, [{
        id: 42, fecha_solicitud: '2026-11-17T00:00:00.000Z', estado: 'APROBADA',
        motivo_rechazo: null, reporte: { objeto: { nombre: 'Cuaderno' } }
      }]]
    ]);
    const repositorio = {
      obtenerEstudiante: jest.fn(async authUid => estudiantes.get(authUid)),
      listarPorSolicitante: jest.fn(async solicitanteId =>
        solicitudesPorEstudiante.get(solicitanteId))
    };
    const servicio = crearSolicitudesRecuperacion(supabase, repositorio);

    const solicitudesAna = await servicio.listarMisSolicitudes({ token: 'token-ana' });
    const solicitudesLuis = await servicio.listarMisSolicitudes({ token: 'token-luis' });

    expect(solicitudesAna).toEqual([{
      id: 31, nombreObjeto: 'Mochila', fechaSolicitud: '2026-11-18T00:00:00.000Z',
      estado: 'PENDIENTE', motivoRechazo: null
    }]);
    expect(solicitudesLuis).toEqual([{
      id: 42, nombreObjeto: 'Cuaderno', fechaSolicitud: '2026-11-17T00:00:00.000Z',
      estado: 'APROBADA', motivoRechazo: null
    }]);
    expect(repositorio.listarPorSolicitante).toHaveBeenNthCalledWith(1, 7);
    expect(repositorio.listarPorSolicitante).toHaveBeenNthCalledWith(2, 8);
  });

  it('no consulta solicitudes con una sesión ausente o inválida', async () => {
    const supabase = {
      auth: {
        getUser: jest.fn(async () => ({ data: { user: null }, error: new Error('Invalid JWT') }))
      }
    };
    const repositorio = {
      obtenerEstudiante: jest.fn(),
      listarPorSolicitante: jest.fn()
    };
    const servicio = crearSolicitudesRecuperacion(supabase, repositorio);

    await expect(servicio.listarMisSolicitudes({ token: '' }))
      .rejects.toMatchObject({ codigo: 'NO_AUTORIZADO' });
    await expect(servicio.listarMisSolicitudes({ token: 'token-invalido' }))
      .rejects.toMatchObject({ codigo: 'NO_AUTORIZADO' });
    expect(repositorio.listarPorSolicitante).not.toHaveBeenCalled();
  });
});
