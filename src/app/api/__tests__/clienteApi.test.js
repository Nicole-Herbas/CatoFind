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

  it('convierte errores HTTP en un error común con código y mensaje del servidor', async () => {
    const solicitar = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ mensaje: 'Datos inválidos.', codigo: 'VALIDACION' })
    });
    const cliente = crearClienteApi({ solicitar });

    await expect(cliente.get('/objetos')).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      codigo: 'VALIDACION',
      message: 'Datos inválidos.'
    });
  });

  it('envía actualizaciones PATCH con cuerpo JSON', async () => {
    const cambios = { nombre: 'Ana', carrera: 'Informática' };
    const solicitar = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => cambios
    });
    const cliente = crearClienteApi({ solicitar });

    await expect(cliente.patch('/auth/perfil', cambios)).resolves.toEqual(cambios);
    expect(solicitar).toHaveBeenCalledWith('/api/auth/perfil', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios)
    });
  });

  it('acepta respuestas 204 sin intentar leer un cuerpo JSON', async () => {
    const json = jest.fn();
    const solicitar = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json
    });
    const cliente = crearClienteApi({ solicitar });

    await expect(cliente.post('/auth/logout')).resolves.toBeNull();
    expect(json).not.toHaveBeenCalled();
  });

  it('normaliza fallos de conexión sin ocultarlos como respuestas correctas', async () => {
    const solicitar = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const cliente = crearClienteApi({ solicitar });

    await expect(cliente.get('/objetos')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'No se pudo conectar con el servidor.'
    });
  });
});
