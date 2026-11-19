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

  it('lista reportes pendientes y actualiza su estado por el endpoint administrativo', async () => {
    const reportes = [{ id: 8, titulo: 'Cuaderno' }];
    const reporte = { id: 8, estado: 'APROBADO' };
    const cliente = {
      get: jest.fn().mockResolvedValue({ reportes }),
      patch: jest.fn().mockResolvedValue({ reporte })
    };
    const repositorio = crearRepositorioReportes(cliente);

    await expect(repositorio.listarPendientes()).resolves.toEqual(reportes);
    await expect(repositorio.actualizarEstado('8', 'APROBADO')).resolves.toEqual(reporte);
    expect(cliente.get).toHaveBeenCalledWith('/admin/reportes?estado=PENDIENTE');
    expect(cliente.patch).toHaveBeenCalledWith('/admin/reportes/8', {
      estado: 'APROBADO'
    });
  });
});
