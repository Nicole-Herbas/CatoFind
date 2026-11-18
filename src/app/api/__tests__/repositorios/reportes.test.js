import { jest } from '@jest/globals';
import { crearRepositorioReportes } from '../../repositorios/reportes.js';

describe('repositorio de reportes del frontend', () => {
  it('carga opciones de reporte y crea un reporte con sesión', async () => {
    const opciones = { categorias: ['Accesorios'], lugares: ['Biblioteca'] };
    const reporte = { id: 21, estado: 'PENDIENTE' };
    const cliente = {
      get: jest.fn().mockResolvedValue({ opciones }),
      post: jest.fn().mockResolvedValue({ reporte })
    };
    const repositorio = crearRepositorioReportes(cliente);

    await expect(repositorio.obtenerOpciones()).resolves.toEqual(opciones);
    await expect(repositorio.crear({ titulo: 'Mochila negra' })).resolves.toEqual(reporte);
    expect(cliente.get).toHaveBeenCalledWith('/reportes/opciones');
    expect(cliente.post).toHaveBeenCalledWith('/reportes', {
      titulo: 'Mochila negra'
    });
  });
});
