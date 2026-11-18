import { crearClienteApi } from '../clienteApi.js';

export function crearRepositorioUsuarios(cliente = crearClienteApi()) {
  return {
    async iniciarSesion(correo, contrasena) {
      try {
        const resultado = await cliente.post('/auth/login', { correo, contrasena });
        return {
          ok: true,
          mensaje: 'Inicio de sesión correcto.',
          usuario: resultado.usuario
        };
      } catch (error) {
        return {
          ok: false,
          mensaje: error.status === 0
            ? 'No se pudo conectar con el servidor.'
            : error.message
        };
      }
    },

    async obtenerSesion() {
      const resultado = await cliente.get('/auth/sesion');
      return resultado.usuario;
    }
  };
}
