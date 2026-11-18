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
    },

    async obtenerSesionAdministrador() {
      const resultado = await cliente.get('/admin/sesion');
      return resultado.usuario;
    },

    async cerrarSesion() {
      await cliente.post('/auth/logout', {});
    },

    async registrarEstudiante(datos) {
      const nombre = [datos.nombre, datos.apellido]
        .map((parte) => String(parte ?? '').trim())
        .filter(Boolean)
        .join(' ');
      const correo = String(datos.correo ?? '').trim().toLowerCase();

      if (!nombre || !/^[^\s@]+@ucb\.edu\.bo$/.test(correo) || !datos.contrasena) {
        return { ok: false, mensaje: 'Completa los datos con un correo institucional UCB.' };
      }

      if (datos.confirmarContrasena !== undefined && datos.contrasena !== datos.confirmarContrasena) {
        return { ok: false, mensaje: 'Las contraseñas no coinciden.' };
      }

      try {
        await cliente.post('/auth/registro', {
          nombre,
          correo,
          contrasena: datos.contrasena
        });
        return { ok: true, mensaje: 'Cuenta creada correctamente.' };
      } catch (error) {
        return {
          ok: false,
          mensaje: error.status === 0
            ? 'No se pudo conectar con el servidor.'
            : error.message
        };
      }
    },

    async obtenerPerfil() {
      const resultado = await cliente.get('/auth/perfil');
      return resultado.perfil;
    },

    async actualizarPerfil(datos) {
      const resultado = await cliente.patch('/auth/perfil', {
        nombre: datos.nombre,
        carrera: datos.carrera
      });
      return resultado.perfil;
    }
  };
}
