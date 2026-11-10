
import {
  iniciarSesion,
  mensajeRecuperacion,
  crearAdministradorDemo,
  obtenerRutaPostLogin
} from './login.js';


crearAdministradorDemo(localStorage);
const formularioLogin = document.getElementById('login-form');
const campoCorreo = document.getElementById('correo');
const campoContrasena = document.getElementById('contrasena');
const elementoMensajeLogin = document.getElementById('mensaje-error');

formularioLogin.addEventListener('submit', (eventoEnvioFormulario) => {
  eventoEnvioFormulario.preventDefault();

    const resultadoInicioSesion = iniciarSesion(
    campoCorreo.value,
    campoContrasena.value,
    localStorage,
    sessionStorage
  );

  elementoMensajeLogin.textContent = resultadoInicioSesion.mensaje;
  elementoMensajeLogin.style.color = resultadoInicioSesion.ok ? '#16803d' : '#c62828';

  const rutaDestinoPostLogin = obtenerRutaPostLogin(resultadoInicioSesion);

if (rutaDestinoPostLogin) {
  window.location.assign(rutaDestinoPostLogin);
}
});

const botonRecuperarContrasena = document.getElementById('recuperar-contrasena');
const notificacionRecuperacion = document.getElementById('mensaje-recuperacion');

let temporizadorOcultarNotificacion;

botonRecuperarContrasena.addEventListener('click', () => {
  notificacionRecuperacion.textContent = mensajeRecuperacion();
  notificacionRecuperacion.hidden = false;

  clearTimeout(temporizadorOcultarNotificacion);

  temporizadorOcultarNotificacion = setTimeout(() => {
    notificacionRecuperacion.hidden = true;
  }, 4000);
});
