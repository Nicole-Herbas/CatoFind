export function crearControladorObjetos(servicio) {
  return {
    async listarPublicados(_solicitud, respuesta) {
      try {
        const objetos = await servicio.listarPublicados();
        return respuesta.json(objetos);
      } catch {
        return respuesta.status(500).json({
          mensaje: 'No se pudieron cargar los objetos.'
        });
      }
    }
  };
}
