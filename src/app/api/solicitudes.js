import { crearApiCliente } from '../core/api/apiCliente.js';

export class SolicitudesApi {
  constructor(fetchImpl) {
    this.solicitar = crearApiCliente(fetchImpl).solicitar;
  }

  async crear(datos) {
    try {
      await this.solicitar('/solicitudes-recuperacion', {
        method: 'POST',
        body: datos
      });
      return { ok: true, mensaje: 'Solicitud enviada.' };
    } catch (error) {
      return { ok: false, mensaje: error.message || 'No se pudo enviar la solicitud.' };
    }
  }
}
