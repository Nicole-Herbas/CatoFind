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
    expect(solicitar).toHaveBeenCalledWith('/api/reportes/opciones', {
      method: 'GET', credentials: 'same-origin', headers: {}
    });
  });

  it('conserva el mensaje y estado HTTP del backend', async () => {
    const solicitar = jest.fn(async () => ({
      ok: false,
      status: 409,
      json: async () => ({ mensaje: 'El reporte ya fue revisado.' })
    }));

    await expect(crearApiReportes(solicitar).obtenerOpciones()).rejects.toMatchObject({
      status: 409,
      message: 'El reporte ya fue revisado.'
    });
  });

  it('lista reportes pendientes con la cookie del mismo origen', async () => {
    const reportes = [{ id: 8, estado: 'PENDIENTE' }];
    const solicitar = jest.fn(async () => ({ ok: true, json: async () => ({ reportes }) }));

    await expect(crearApiReportes(solicitar).listarPendientes()).resolves.toEqual(reportes);
    expect(solicitar).toHaveBeenCalledWith('/api/admin/reportes?estado=PENDIENTE',
      expect.objectContaining({ credentials: 'same-origin' }));
  });

  it('actualiza el estado del reporte y devuelve el reporte actualizado', async () => {
    const reporte = { id: 8, estado: 'APROBADO' };
    const solicitar = jest.fn(async () => ({ ok: true, json: async () => ({ reporte }) }));

    await expect(crearApiReportes(solicitar).actualizarEstado('8', 'APROBADO'))
      .resolves.toEqual(reporte);
    expect(solicitar).toHaveBeenCalledWith('/api/admin/reportes/8', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ estado: 'APROBADO' }),
      credentials: 'same-origin'
    }));
  });

  it('usa el mensaje predeterminado y conserva el estado ante un error sin detalle', async () => {
    const solicitar = jest.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }));

    await expect(crearApiReportes(solicitar).crear({ titulo: 'Mochila' }))
      .rejects.toMatchObject({ status: 503, message: 'No se pudo guardar el reporte.' });
  });
});
