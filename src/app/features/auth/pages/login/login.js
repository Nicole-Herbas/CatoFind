export function esCorreoInstitucional(correo) {
  return typeof correo === 'string' && /^[^\s@]+@ucb\.edu\.bo$/i.test(correo.trim());
}

export function obtenerSesion(almacenamientoSesion) {
  try {
    const datos = almacenamientoSesion.getItem('catofind_sesion');
    if (!datos) return null;

    const usuario = JSON.parse(datos);
    if (!usuario || !esCorreoInstitucional(usuario.correo)) return null;

    return {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol === 'ADMIN' ? 'ADMIN' : 'ESTUDIANTE'
    };
  } catch {
    return null;
  }
}

export function cerrarSesion(almacenamientoSesion) {
  almacenamientoSesion.removeItem('catofind_sesion');
}

export function mensajeRecuperacion() {
  return 'Te enviaríamos un enlace de recuperación a tu correo ';
}

export function verificarAccesoAdministrador(almacenamientoSesion) {
  const usuario = obtenerSesion(almacenamientoSesion);

  if (!usuario) {
    return {
      permitido: false,
      mensaje: 'Debes iniciar sesión para acceder al panel administrativo.'
    };
  }

  if (usuario.rol !== 'ADMIN') {
    return {
      permitido: false,
      mensaje: 'No tienes permisos para acceder al panel administrativo.'
    };
  }

  return { permitido: true, mensaje: '' };
}

export function obtenerRutaPostLogin(resultado) {
  if (!resultado?.ok) return null;
  return resultado.usuario?.rol === 'ADMIN'
    ? '../../../admin/pages/panel/panel.html'
    : '../../../inicio/pages/inicio/inicio.html';
}
