import { SolicitudesApi } from '../SolicitudesApi.js';

describe('API de solicitudes de recuperación', () => {
  it('envía los datos del formulario con el token de la sesión', async () => {
    const solicitar = jest.fn(async () => ({ ok: true, json: async () => ({ id: 12 }) }));
    const sesion = { getItem: () => JSON.stringify({ accessToken: 'token-estudiante' }) };
    const api = new SolicitudesApi(solicitar, sesion);

    await expect(api.crear({
      reporteId: '14', lugarEstimado: 'biblioteca',
      fechaEstimada: '2026-10-20', caracteristicaPrivada: 'Costura en la manga'
    })).resolves.toEqual({ ok: true, mensaje: 'Solicitud enviada.' });

    expect(solicitar).toHaveBeenCalledWith('/api/solicitudes-recuperacion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-estudiante'
      },
      body: JSON.stringify({
        reporteId: '14', lugarEstimado: 'biblioteca',
        fechaEstimada: '2026-10-20', caracteristicaPrivada: 'Costura en la manga'
      })
    });
  });

  it('pide iniciar sesión y no envía una solicitud sin token', async () => {
    const solicitar = jest.fn();
    const api = new SolicitudesApi(solicitar, { getItem: () => null });

    await expect(api.crear({ reporteId: 14 })).resolves.toEqual({
      ok: false, mensaje: 'Inicia sesión para enviar una solicitud.'
    });
    expect(solicitar).not.toHaveBeenCalled();
  });
});
