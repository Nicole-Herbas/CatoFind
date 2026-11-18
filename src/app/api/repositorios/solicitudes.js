import { crearClienteApi } from '../clienteApi.js';

export function crearRepositorioSolicitudes(cliente = crearClienteApi()) {
  return {
    async crear(datos) {
      await cliente.post('/solicitudes-recuperacion', datos);
      return { ok: true, mensaje: 'Solicitud enviada.' };
    }
  };
}
