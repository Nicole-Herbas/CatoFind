import { UsuarioService } from '../../services/UsuarioService.js';


export function esCorreoInstitucional(correo) {
  return /^[^\s@]+@ucb\.edu\.bo$/i.test(correo.trim());
}


export function iniciarSesion(correo, contrasena, almacenamiento) {

  const correoNormalizado = String(correo ?? '').trim().toLowerCase();
  const clave = String(contrasena ?? '');

  if (!correoNormalizado || !clave) {
    return {
      ok: false,
      mensaje: 'Completa el correo y la contraseña.'
    };
  }

  if (!esCorreoInstitucional(correoNormalizado)) {
    return {
      ok: false,
      mensaje: 'Ingresa con tu cuenta académica @ucb.edu.bo.'
    };
  }

  const servicio = new UsuarioService(almacenamiento);
  const usuarios = servicio.obtenerUsuarios();

  const usuario = usuarios.find(estudiante =>
    typeof estudiante.correo === 'string' &&
    estudiante.correo.trim().toLowerCase() === correoNormalizado &&
    estudiante.contrasena === clave
  );

  if (!usuario) {
    return {
      ok: false,
      mensaje: 'Correo o contraseña incorrectos.'
    };
  }

  return {
    ok: true,
    mensaje: 'Inicio de sesión correcto.',
    usuario: {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo
    }
  };
}
