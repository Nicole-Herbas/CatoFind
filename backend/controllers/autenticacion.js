export function crearControladorAutenticacion(servicio) {
  const cookie = (res, token, maxAge) => res.cookie('catofind_sesion', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge
  });
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
        const sesion = await servicio.iniciarSesion(solicitud.body);
        cookie(respuesta, sesion.accessToken, 60 * 60 * 1000);
        return respuesta.json({ usuario: sesion.usuario });
      } catch (error) {
        const credencialesInvalidas = error.codigo === 'CREDENCIALES';
        const esValidacion = error.codigo === 'VALIDACION';
        return respuesta.status(esValidacion ? 400 : credencialesInvalidas ? 401 : 500).json({
          mensaje: esValidacion || credencialesInvalidas ? error.message : 'No se pudo iniciar sesión.'
        });
      }
    },

    async obtenerSesion(solicitud, respuesta) {
      try {
        return respuesta.json(await servicio.obtenerSesion(solicitud.cookies?.catofind_sesion));
      } catch (error) {
        return respuesta.status(401).json({ mensaje: error.message });
      }
    },

    async obtenerSesionAdministrador(solicitud, respuesta) {
      try {
        return respuesta.json(await servicio.obtenerSesionAdministrador(solicitud.cookies?.catofind_sesion));
      } catch (error) {
        const estado = error.codigo === 'SIN_PERMISOS' ? 403 : 401;
        return respuesta.status(estado).json({ mensaje: error.message });
      }
    },

    async cerrarSesion(_solicitud, respuesta) {
      cookie(respuesta, '', 0);
      return respuesta.status(204).end();
    }
  };
}
