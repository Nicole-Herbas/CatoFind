import { obtenerObjetos } from '../objetos.js';

describe('API de objetos publicados', () => {
  it('consulta al backend los filtros y devuelve los objetos recibidos', async () => {
    const objetos = [{ id: 10, titulo: 'Mochila azul' }];
    const solicitar = jest.fn(async () => ({ ok: true, json: async () => objetos }));

    await expect(obtenerObjetos({ texto: 'mochila', categoria: 'Todos' }, solicitar))
      .resolves.toEqual(objetos);
    expect(solicitar).toHaveBeenCalledWith(
      '/api/objetos?texto=mochila&categoria=Todos',
      { method: 'GET', credentials: 'same-origin', headers: {} }
    );
  });

  it('muestra error cuando el backend no puede cargar los objetos', async () => {
    const solicitar = jest.fn(async () => ({ ok: false }));
    await expect(obtenerObjetos({}, solicitar))
      .rejects.toThrow('No se pudieron cargar los objetos.');
  });

  it('conserva el estado y mensaje de un error HTTP del backend', async () => {
    const solicitar = jest.fn(async () => ({
      ok: false,
      status: 403,
      json: async () => ({ mensaje: 'No tienes permiso para ver estos objetos.' })
    }));

    await expect(obtenerObjetos({}, solicitar)).rejects.toMatchObject({
      status: 403,
      message: 'No tienes permiso para ver estos objetos.'
    });
  });

  it('muestra el mensaje de red que usan las pantallas al fallar el fetch', async () => {
    const solicitar = jest.fn().mockRejectedValue(new TypeError('offline'));

    await expect(obtenerObjetos({}, solicitar))
      .rejects.toThrow('No se pudo conectar con el servidor.');
  });

  it('codifica los filtros en la consulta del repositorio', async () => {
    const solicitar = jest.fn(async () => ({ ok: true, json: async () => [] }));

    await obtenerObjetos({ lugar: 'Biblioteca Central' }, solicitar);

    expect(solicitar.mock.calls[0][0]).toBe('/api/objetos?lugar=Biblioteca+Central');
  });
});
