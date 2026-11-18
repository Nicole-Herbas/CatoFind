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

  it('envía datos JSON en POST y conserva las credenciales de sesión', async () => {
    const datos = { id: 3 };
    const solicitud = { titulo: 'Mochila negra' };
    const solicitar = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => datos
    });
    const cliente = crearClienteApi({ solicitar });

    await expect(cliente.post('/reportes', solicitud)).resolves.toEqual(datos);
    expect(solicitar).toHaveBeenCalledWith('/api/reportes', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solicitud)
    });
  });
});
