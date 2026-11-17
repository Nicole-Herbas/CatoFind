import { obtenerObjetos } from '../objetos.js';

describe('API de objetos publicados', () => {
  it('consulta al backend los filtros y devuelve los objetos recibidos', async () => {
    const objetos = [{ id: 10, titulo: 'Mochila azul' }];
    const solicitar = jest.fn(async () => ({ ok: true, json: async () => objetos }));

    await expect(obtenerObjetos({ texto: 'mochila', categoria: 'Todos' }, solicitar))
      .resolves.toEqual(objetos);
    expect(solicitar).toHaveBeenCalledWith(
      '/api/objetos?texto=mochila&categoria=Todos',
      { credentials: 'same-origin' }
    );
  });

  it('muestra error cuando el backend no puede cargar los objetos', async () => {
    const solicitar = jest.fn(async () => ({ ok: false }));
    await expect(obtenerObjetos({}, solicitar))
      .rejects.toThrow('No se pudieron cargar los objetos.');
  });
});