import { crearApiCliente } from '../core/api/apiCliente.js';

export function crearApiReportes(fetchImpl) {
  const cliente = crearApiCliente(fetchImpl);

  async function solicitar(ruta, opciones, mensajePredeterminado) {
    try {
      return await cliente.solicitar(ruta, opciones);
    } catch (error) {
      error.message ||= mensajePredeterminado;
      throw error;
    }
  }

  return {
    async obtenerOpciones() {
      const resultado = await solicitar('/reportes/opciones', undefined,
        'No se pudieron cargar las opciones del reporte.');
      return resultado.opciones;
    },

    async crear(datos) {
      const resultado = await solicitar('/reportes', { method: 'POST', body: datos },
        'No se pudo guardar el reporte.');
      return resultado.reporte;
    },

    async listarPendientes() {
      const resultado = await solicitar('/admin/reportes?estado=PENDIENTE', undefined,
        'No se pudieron cargar los reportes.');
      return resultado.reportes;
    },

    async actualizarEstado(id, estado) {
      const resultado = await solicitar(`/admin/reportes/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { estado }
      }, 'No se pudo actualizar el reporte.');
      return resultado.reporte;
    }
  };
}
