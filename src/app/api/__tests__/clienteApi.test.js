import { jest } from '@jest/globals';
import { crearClienteApi } from '../clienteApi.js';

describe('cliente HTTP común', () => {
  it('envía consultas GET a la base /api usando la sesión del mismo origen', async () => {
    const datos = [{ id: 1 }];
    const solicitar = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => datos
    });
    const cliente = crearClienteApi({ solicitar });

    await expect(cliente.get('/objetos')).resolves.toEqual(datos);
    expect(solicitar).toHaveBeenCalledWith('/api/objetos', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {}
    });
  });
});
