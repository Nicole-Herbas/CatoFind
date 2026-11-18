import { crearClienteApi } from '../clienteApi.js';

export function crearRepositorioReportes(cliente = crearClienteApi()) {
  return {
    async obtenerOpciones() {
      const resultado = await cliente.get('/reportes/opciones');
      return resultado.opciones;
    },

    async crear(datos) {
      const resultado = await cliente.post('/reportes', datos);
      return resultado.reporte;
    },

    async listarPendientes() {
      const resultado = await cliente.get('/admin/reportes?estado=PENDIENTE');
      return resultado.reportes;
    },

    async actualizarEstado(id, estado) {
      const resultado = await cliente.patch(
        `/admin/reportes/${encodeURIComponent(id)}`,
        { estado }
      );
      return resultado.reporte;
    }
  };
}
