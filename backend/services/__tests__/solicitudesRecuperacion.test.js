import { crearSolicitudesRecuperacion } from '../solicitudesRecuperacion.js';

describe('solicitudes de recuperación', () => {
  it.each([
    ['VALIDAR_PROPIETARIO', 'CERRADO'],
    ['RECHAZAR', 'sin cambio']
  ])('resuelve la solicitud con la acción %s', async (accion) => {
    const supabase = {
      auth: {
        getUser: jest.fn(async () => ({
          data: { user: { id: 'auth-admin' } },
          error: null
        }))
      }
    };
    const repositorio = {
      obtenerIdAdministrador: jest.fn(async () => 3),
      resolverPendiente: jest.fn(async ({ solicitudId, accion: accionResolucion }) => ({
        id: solicitudId,
        accion: accionResolucion
      }))
    };
    const autenticacion = {
      obtenerSesionAdministrador: jest.fn(async () => ({ usuario: { rol: 'ADMIN' } }))
    };
    const servicio = crearSolicitudesRecuperacion(supabase, repositorio, autenticacion);

    await expect(servicio.resolverPendiente({
      id: '12',
      accion,
      token: 'token-admin'
    })).resolves.toEqual({ id: 12, accion });

    expect(repositorio.obtenerIdAdministrador).toHaveBeenCalledWith('auth-admin');
    expect(repositorio.resolverPendiente).toHaveBeenCalledWith({
      solicitudId: 12,
      accion,
      administrativoId: 3
    });
  });

  it('rechaza acciones inválidas antes de llamar la función transaccional', async () => {
    const autenticacion = {
      obtenerSesionAdministrador: jest.fn(async () => ({ usuario: { rol: 'ADMIN' } }))
    };
    const repositorio = { resolverPendiente: jest.fn() };
    const servicio = crearSolicitudesRecuperacion({}, repositorio, autenticacion);

    await expect(servicio.resolverPendiente({
      id: '12',
      accion: 'SOLICITAR_MAS_INFORMACION',
      token: 'token-admin'
    })).rejects.toMatchObject({ codigo: 'VALIDACION' });
    expect(repositorio.resolverPendiente).not.toHaveBeenCalled();
  });

  it('propaga conflicto cuando el reporte ya no puede marcarse como recuperado', async () => {
    const supabase = {
      auth: {
        getUser: jest.fn(async () => ({
          data: { user: { id: 'auth-admin' } },
          error: null
        }))
      }
    };
    const repositorio = {
      obtenerIdAdministrador: jest.fn(async () => 3),
      resolverPendiente: jest.fn(async () => {
        throw Object.assign(new Error('Reporte no disponible.'), { code: 'P0001' });
      })
    };
    const autenticacion = {
      obtenerSesionAdministrador: jest.fn(async () => ({ usuario: { rol: 'ADMIN' } }))
    };
    const servicio = crearSolicitudesRecuperacion(supabase, repositorio, autenticacion);

    await expect(servicio.resolverPendiente({
      id: '12',
      accion: 'VALIDAR_PROPIETARIO',
      token: 'token-admin'
    })).rejects.toMatchObject({ codigo: 'REPORTE_NO_DISPONIBLE' });
  });

  it('identifica cuando Supabase aún no tiene publicada la función RPC', async () => {
    const supabase = {
      auth: {
        getUser: jest.fn(async () => ({
          data: { user: { id: 'auth-admin' } },
          error: null
        }))
      }
    };
    const repositorio = {
      obtenerIdAdministrador: jest.fn(async () => 3),
      resolverPendiente: jest.fn(async () => {
        throw Object.assign(new Error('RPC missing'), { code: 'PGRST202' });
      })
    };
    const autenticacion = {
      obtenerSesionAdministrador: jest.fn(async () => ({ usuario: { rol: 'ADMIN' } }))
    };
    const servicio = crearSolicitudesRecuperacion(supabase, repositorio, autenticacion);

    await expect(servicio.resolverPendiente({
      id: '12',
      accion: 'RECHAZAR',
      token: 'token-admin'
    })).rejects.toMatchObject({
      codigo: 'MIGRACION_PENDIENTE',
      message: 'Falta aplicar la migración de resolución de solicitudes en Supabase.'
    });
  });

  it('permite a un administrador obtener el detalle pendiente y firma la foto', async () => {
    const detalle = {
      id: 12,
      titulo: 'Audífonos blancos',
      imagen: 'audifonos.jpg',
      detallePrivadoReporte: 'Marca en el estuche'
    };
    const supabase = {
      storage: {
        from: jest.fn(() => ({
          createSignedUrl: jest.fn(async () => ({
            data: { signedUrl: 'https://storage.test/audifonos?token=firmado' },
            error: null
          }))
        }))
      }
    };
    const repositorio = {
      obtenerDetallePendiente: jest.fn(async () => detalle)
    };
    const autenticacion = {
      obtenerSesionAdministrador: jest.fn(async token => {
        expect(token).toBe('token-admin');
      })
    };
    const servicio = crearSolicitudesRecuperacion(supabase, repositorio, autenticacion);

    await expect(servicio.obtenerDetallePendiente({ id: '12', token: 'token-admin' }))
      .resolves.toEqual({
        ...detalle,
        imagen: 'https://storage.test/audifonos?token=firmado'
      });
    expect(repositorio.obtenerDetallePendiente).toHaveBeenCalledWith(12);
  });

  it('no consulta el detalle si la sesión no es administrativa', async () => {
    const repositorio = { obtenerDetallePendiente: jest.fn() };
    const autenticacion = {
      obtenerSesionAdministrador: jest.fn(async () => {
        throw Object.assign(new Error('No tienes permisos.'), { codigo: 'SIN_PERMISOS' });
      })
    };
    const servicio = crearSolicitudesRecuperacion({}, repositorio, autenticacion);

    await expect(servicio.obtenerDetallePendiente({ id: '12', token: 'token-estudiante' }))
      .rejects.toMatchObject({ codigo: 'SIN_PERMISOS' });
    expect(repositorio.obtenerDetallePendiente).not.toHaveBeenCalled();
  });

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
