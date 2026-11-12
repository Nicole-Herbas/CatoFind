export function crearControladorAutenticacion(servicio) {
  return {
    async registrar(solicitud, respuesta) {
      try {
        const usuario = await servicio.registrarEstudiante(solicitud.body);
        return respuesta.status(201).json({ usuario });
      } catch (error) {
        const esValidacion = error.codigo === 'VALIDACION';
        return respuesta.status(esValidacion ? 400 : 500).json({
          mensaje: esValidacion ? error.message : 'No se pudo crear la cuenta.'
        });
      }
    },

    async iniciarSesion(solicitud, respuesta) {
      try {
        return respuesta.json(await servicio.iniciarSesion(solicitud.body));
      } catch (error) {
        const credencialesInvalidas = error.codigo === 'CREDENCIALES';
        const esValidacion = error.codigo === 'VALIDACION';
        return respuesta.status(esValidacion ? 400 : credencialesInvalidas ? 401 : 500).json({
          mensaje: esValidacion || credencialesInvalidas ? error.message : 'No se pudo iniciar sesión.'
        });
      }
    }
  };
}
