export function esCorreoInstitucional(correo) {
  return typeof correo === 'string' && /^[^\s@]+@ucb\.edu\.bo$/i.test(correo.trim());
}

export function mensajeRecuperacion() {
  return 'Te enviaríamos un enlace de recuperación a tu correo ';
}

export function obtenerRutaPostLogin(resultado) {
  if (!resultado?.ok) return null;
  return resultado.usuario?.rol === 'ADMIN'
    ? '../../../admin/pages/panel/panel.html'
    : '../../../inicio/pages/inicio/inicio.html';
}
