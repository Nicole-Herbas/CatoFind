import { crearApiCliente } from '../core/api/apiCliente.js';

export class AutenticacionApi {
  constructor(fetchImpl) {
    this.solicitar = crearApiCliente(fetchImpl).solicitar;
  }

  async iniciarSesion(correo, contrasena) {
    try {
      const resultado = await this.solicitar('/auth/login', {
        method: 'POST',
        body: { correo, contrasena }
      });
      return { ok: true, mensaje: 'Inicio de sesión correcto.', usuario: resultado.usuario };
    } catch (error) {
      return { ok: false, mensaje: error.message || 'No se pudo conectar con el servidor.' };
    }
  }

  async obtenerSesion() {
    try {
      return (await this.solicitar('/auth/sesion')).usuario;
    } catch (error) {
      if (error.status !== null) return null;
      throw error;
    }
  }

  async obtenerSesionAdministrador() {
    const resultado = await this.solicitar('/admin/sesion');
    return resultado.usuario;
  }

  async obtenerPerfil() {
    const resultado = await this.solicitar('/auth/perfil');
    return resultado.perfil;
  }

  async actualizarPerfil(datos) {
    const resultado = await this.solicitar('/auth/perfil', {
      method: 'PATCH',
      body: { nombre: datos.nombre, carrera: datos.carrera }
    });
    return resultado.perfil;
  }

  async cerrarSesion() {
    await this.solicitar('/auth/logout', { method: 'POST' });
  }

  async registrarEstudiante(datos) {
    const nombre = [datos.nombre, datos.apellido].filter(Boolean).join(' ').trim();
    const correo = String(datos.correo ?? '').trim().toLowerCase();

    if (!nombre || !/^[^\s@]+@ucb\.edu\.bo$/.test(correo) || !datos.contrasena) {
      return { ok: false, mensaje: 'Completa los datos con un correo institucional UCB.' };
    }

    if (datos.confirmarContrasena !== undefined && datos.contrasena !== datos.confirmarContrasena) {
      return { ok: false, mensaje: 'Las contraseñas no coinciden.' };
    }

    try {
      await this.solicitar('/auth/registro', {
        method: 'POST',
        body: { nombre, correo, contrasena: datos.contrasena }
      });
      return { ok: true, mensaje: 'Cuenta creada correctamente.' };
    } catch (error) {
      return { ok: false, mensaje: error.message || 'No se pudo conectar con el servidor.' };
    }
  }
}
