import { crearClienteApi } from '../clienteApi.js';

export function crearRepositorioSolicitudes(cliente = crearClienteApi()) {
  return {
    async crear(datos) {
      try {
        await cliente.post('/solicitudes-recuperacion', datos);
        return { ok: true, mensaje: 'Solicitud enviada.' };
      } catch (error) {
        return {
          ok: false,
          mensaje: error.status === 0
            ? 'No se pudo conectar con el servidor.'
            : error.message || 'No se pudo enviar la solicitud.'
        };
      }
    }
  };
}
