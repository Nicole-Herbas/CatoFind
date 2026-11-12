async function obtenerResultado(respuesta, mensajePredeterminado) {
  const resultado = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(resultado.mensaje || mensajePredeterminado);
  }
  return resultado;
}

export function crearApiReportes(solicitar = globalThis.fetch.bind(globalThis)) {
  return {
    async obtenerOpciones() {
      const respuesta = await solicitar('/api/reportes/opciones');
      const resultado = await obtenerResultado(
        respuesta,
        'No se pudieron cargar las opciones del reporte.'
      );
      return resultado.opciones;
    },

    async crear(datos) {
      const respuesta = await solicitar('/api/reportes', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const resultado = await obtenerResultado(respuesta, 'No se pudo guardar el reporte.');
      return resultado.reporte;
    },

    async listarPendientes() {
      const respuesta = await solicitar('/api/admin/reportes?estado=PENDIENTE', {
        credentials: 'same-origin'
      });
      const resultado = await obtenerResultado(respuesta, 'No se pudieron cargar los reportes.');
      return resultado.reportes;
    },

    async actualizarEstado(id, estado) {
      const respuesta = await solicitar(`/api/admin/reportes/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      });
      const resultado = await obtenerResultado(respuesta, 'No se pudo actualizar el reporte.');
      return resultado.reporte;
    }
  };
}