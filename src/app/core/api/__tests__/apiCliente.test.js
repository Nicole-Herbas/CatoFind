import { crearApiCliente } from '../apiCliente.js';

function respuesta({ status = 200, statusText = 'OK', cuerpo = '' } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: async () => cuerpo
  };
}

describe('cliente HTTP común', () => {
  it('usa la base /api, envía cookies y serializa JSON', async () => {
    const solicitar = jest.fn().mockResolvedValue(respuesta({ cuerpo: '{"id":7}' }));
    const api = crearApiCliente(solicitar);

    await expect(api.solicitar('/objetos', {
      method: 'POST',
      body: { titulo: 'Mochila' }
    })).resolves.toEqual({ id: 7 });

    expect(solicitar).toHaveBeenCalledWith('/api/objetos', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: '{"titulo":"Mochila"}'
    });
  });

  it('convierte los errores de red en un error estable para la interfaz', async () => {
    const api = crearApiCliente(jest.fn().mockRejectedValue(new TypeError('offline')));

    await expect(api.solicitar('/objetos'))
      .rejects.toThrow('No se pudo conectar con el servidor.');
  });

  it('normaliza tambien errores de red al leer la respuesta', async () => {
    const response = respuesta();
    response.text = jest.fn().mockRejectedValue(new TypeError('stream disconnected'));
    const api = crearApiCliente(jest.fn().mockResolvedValue(response));

    await expect(api.solicitar('/objetos'))
      .rejects.toThrow('No se pudo conectar con el servidor.');
  });

  it('conserva el estado HTTP y el mensaje devuelto por el backend', async () => {
    const api = crearApiCliente(jest.fn().mockResolvedValue(respuesta({
      status: 401,
      statusText: 'Unauthorized',
      cuerpo: '{"mensaje":"Inicia sesión para continuar."}'
    })));

    await expect(api.solicitar('/auth/sesion')).rejects.toMatchObject({
      status: 401,
      message: 'Inicia sesión para continuar.'
    });
  });

  it('acepta respuestas sin cuerpo como 204', async () => {
    const api = crearApiCliente(jest.fn().mockResolvedValue(respuesta({
      status: 204,
      statusText: 'No Content'
    })));

    await expect(api.solicitar('/auth/logout', { method: 'POST' })).resolves.toBeNull();
  });

  it('preserva encabezados propios y fuerza cookies del mismo origen', async () => {
    const solicitar = jest.fn().mockResolvedValue(respuesta({ cuerpo: '{"ok":true}' }));
    const api = crearApiCliente(solicitar);

    await api.solicitar('/objetos', {
      credentials: 'omit',
      headers: { Accept: 'application/json' }
    });

    expect(solicitar).toHaveBeenCalledWith('/api/objetos', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    });
  });
});
