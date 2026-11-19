import { jest } from '@jest/globals';
import { crearRepositorioSolicitudes } from '../../repositorios/solicitudes.js';

describe('repositorio de solicitudes del frontend', () => {
  it('envía la solicitud de recuperación y devuelve confirmación', async () => {
    const datos = {
      reporteId: '14',
      lugarEstimado: 'biblioteca',
      fechaEstimada: '2026-11-17',
      caracteristicaPrivada: 'Costura en la manga'
    };
    const cliente = { post: jest.fn().mockResolvedValue({ id: 12 }) };
    const repositorio = crearRepositorioSolicitudes(cliente);

    await expect(repositorio.crear(datos)).resolves.toEqual({
      ok: true,
      mensaje: 'Solicitud enviada.'
    });
    expect(cliente.post).toHaveBeenCalledWith('/solicitudes-recuperacion', datos);
  });

  it('devuelve el mensaje del servidor cuando rechaza la solicitud', async () => {
    const cliente = {
      post: jest.fn().mockRejectedValue(new Error('Inicia sesión para enviar una solicitud.'))
    };
    const repositorio = crearRepositorioSolicitudes(cliente);

    await expect(repositorio.crear({ reporteId: '14' })).resolves.toEqual({
      ok: false,
      mensaje: 'Inicia sesión para enviar una solicitud.'
    });
  });
});
