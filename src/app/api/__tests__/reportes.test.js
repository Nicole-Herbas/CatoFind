import { crearApiReportes } from '../reportes.js';

describe('API de reportes', () => {
  it('envía el formulario al backend con la cookie de sesión', async () => {
    const reporte = { id: 21, estado: 'PENDIENTE' };
    const solicitar = jest.fn(async () => ({
      ok: true,
      status: 201,
      json: async () => ({ reporte })
    }));
    const api = crearApiReportes(solicitar);

    await expect(api.crear({ titulo: 'Mochila negra' })).resolves.toEqual(reporte);
    expect(solicitar).toHaveBeenCalledWith('/api/reportes', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({ titulo: 'Mochila negra' })
    }));
  });

  it('obtiene categorías y lugares autorizados desde el backend', async () => {
    const opciones = { categorias: ['Accesorios'], lugares: ['Biblioteca'] };
    const solicitar = jest.fn(async () => ({ ok: true, json: async () => ({ opciones }) }));

    await expect(crearApiReportes(solicitar).obtenerOpciones()).resolves.toEqual(opciones);
    expect(solicitar).toHaveBeenCalledWith('/api/reportes/opciones');
  });
});
