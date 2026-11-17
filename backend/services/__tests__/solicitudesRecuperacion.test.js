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
});
