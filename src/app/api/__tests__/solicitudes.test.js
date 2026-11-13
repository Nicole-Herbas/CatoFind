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

  it('usa un mensaje entendible cuando el backend rechaza sin enviar detalle', async () => {
    const solicitar = jest.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }));

    await expect(new SolicitudesApi(solicitar).crear({ reporteId: 14 })).resolves.toEqual({
      ok: false,
      mensaje: 'No se pudo enviar la solicitud.'
    });
  });

  it('mantiene el mensaje de conexion que espera el formulario ante error de red', async () => {
    const solicitar = jest.fn().mockRejectedValue(new TypeError('offline'));

    await expect(new SolicitudesApi(solicitar).crear({ reporteId: 14 })).resolves.toEqual({
      ok: false,
      mensaje: 'No se pudo conectar con el servidor.'
    });
  });
});
