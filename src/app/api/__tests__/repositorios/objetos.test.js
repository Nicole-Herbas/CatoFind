import { jest } from '@jest/globals';
import { crearRepositorioObjetos } from '../../repositorios/objetos.js';

describe('repositorio de objetos del frontend', () => {
  it('lista objetos enviando los filtros serializados al cliente común', async () => {
    const objetos = [{ id: 1, titulo: 'Mochila negra' }];
    const cliente = { get: jest.fn().mockResolvedValue(objetos) };
    const repositorio = crearRepositorioObjetos(cliente);

    await expect(repositorio.listar({
      texto: 'mochila negra',
      categoria: 'Accesorios'
    })).resolves.toEqual(objetos);
    expect(cliente.get).toHaveBeenCalledWith(
      '/objetos?texto=mochila+negra&categoria=Accesorios'
    );
  });
});
