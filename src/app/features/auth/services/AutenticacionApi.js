export class AutenticacionApi {
  constructor(solicitar = globalThis.fetch, almacenamientoSesion = globalThis.sessionStorage) {
    this.solicitar = solicitar;
    this.almacenamientoSesion = almacenamientoSesion;
  }

  async iniciarSesion(correo, contrasena) {
    try {
      const respuesta = await this.solicitar('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });
      const resultado = await respuesta.json();

      if (!respuesta.ok) return { ok: false, mensaje: resultado.mensaje };

      this.almacenamientoSesion.setItem('catofind_sesion', JSON.stringify({
        ...resultado.usuario,
        accessToken: resultado.accessToken
      }));

      return { ok: true, mensaje: 'Inicio de sesión correcto.', usuario: resultado.usuario };
    } catch {
      return { ok: false, mensaje: 'No se pudo conectar con el servidor.' };
    }
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
      const respuesta = await this.solicitar('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correo,
          contrasena: datos.contrasena
        })
      });
      const resultado = await respuesta.json();

      if (!respuesta.ok) return { ok: false, mensaje: resultado.mensaje };

      return { ok: true, mensaje: 'Cuenta creada correctamente.' };
    } catch {
      return { ok: false, mensaje: 'No se pudo conectar con el servidor.' };
    }
  }

  async migrarCuentaAnterior(correo, contrasena, almacenamiento = globalThis.localStorage) {
    let usuarios;

    try {
      usuarios = JSON.parse(almacenamiento.getItem('catofind_usuarios') || '[]');
    } catch {
      return null;
    }

    if (!Array.isArray(usuarios)) return null;

    const correoNormalizado = String(correo ?? '').trim().toLowerCase();
    const usuarioAnterior = usuarios.find(usuario =>
      usuario.correo?.trim().toLowerCase() === correoNormalizado &&
      usuario.contrasena === contrasena &&
      usuario.rol !== 'ADMIN' &&
      usuario.rol !== 'ADMINISTRATIVO'
    );

    if (!usuarioAnterior) return null;

    const registro = await this.registrarEstudiante({
      nombre: usuarioAnterior.nombre,
      apellido: usuarioAnterior.apellido,
      correo: usuarioAnterior.correo,
      contrasena,
      confirmarContrasena: contrasena
    });

    if (!registro.ok) return null;

    const sesion = await this.iniciarSesion(correoNormalizado, contrasena);
    if (!sesion.ok) return null;

    try {
      almacenamiento.setItem('catofind_usuarios', JSON.stringify(
        usuarios.filter(usuario => usuario !== usuarioAnterior)
      ));
    } catch {}

    return sesion;
  }
}
