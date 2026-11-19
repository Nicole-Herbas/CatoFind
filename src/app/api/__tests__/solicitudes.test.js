import { SolicitudesApi } from '../solicitudes.js';

describe('API de solicitudes de recuperación', () => {
  it('envía formulario con credenciales de cookie gestionadas por backend', async () => {
    const solicitar = jest.fn(async () => ({ ok: true, json: async () => ({ id: 12 }) }));
    const api = new SolicitudesApi(solicitar);
    const datos = {
      reporteId: '14', lugarEstimado: 'biblioteca',
      fechaEstimada: '2026-10-20', caracteristicaPrivada: 'Costura en la manga'
    };

    await expect(api.crear(datos)).resolves.toEqual({ ok: true, mensaje: 'Solicitud enviada.' });
    expect(solicitar).toHaveBeenCalledWith('/api/solicitudes-recuperacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(datos)
    });
  });

  it('muestra el rechazo del backend cuando no hay sesión', async () => {
    const solicitar = jest.fn(async () => ({
      ok: false, json: async () => ({ mensaje: 'Inicia sesión para enviar una solicitud.' })
    }));
    const api = new SolicitudesApi(solicitar);

    await expect(api.crear({ reporteId: 14 })).resolves.toEqual({
      ok: false, mensaje: 'Inicia sesión para enviar una solicitud.'
    });
  });

  it('obtiene el detalle de solicitud con las credenciales de administrador', async () => {
    const solicitud = { id: 12, titulo: 'Audífonos blancos' };
    const solicitar = jest.fn(async () => ({
      ok: true,
      json: async () => ({ solicitud })
    }));
    const api = new SolicitudesApi(solicitar);

    await expect(api.obtenerDetallePendiente('12')).resolves.toEqual(solicitud);
    expect(solicitar).toHaveBeenCalledWith('/api/admin/solicitudes-recuperacion/12', {
      credentials: 'same-origin'
    });
  });

  it('envía la acción administrativa para resolver una solicitud', async () => {
    const resultado = { id: 12, accion: 'VALIDAR_PROPIETARIO' };
    const solicitar = jest.fn(async () => ({
      ok: true,
      json: async () => ({ resultado })
    }));
    const api = new SolicitudesApi(solicitar);

    await expect(api.resolverPendiente('12', 'VALIDAR_PROPIETARIO')).resolves.toEqual(resultado);
    expect(solicitar).toHaveBeenCalledWith(
      '/api/admin/solicitudes-recuperacion/12/resolver',
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'VALIDAR_PROPIETARIO' })
      }
    );
  });
});
