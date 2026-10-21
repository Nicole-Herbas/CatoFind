
import { iniciarSesion, mensajeRecuperacion } from './login.js';

const formulario = document.getElementById('login-form');
const correo = document.getElementById('correo');
const contrasena = document.getElementById('contrasena');
const mensaje = document.getElementById('mensaje-error');

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

    const resultado = iniciarSesion(
    correo.value,
    contrasena.value,
    localStorage,
    sessionStorage
  );

  mensaje.textContent = resultado.mensaje;
  mensaje.style.color = resultado.ok ? '#16803d' : '#c62828';
});

const recuperar = document.getElementById('recuperar-contrasena');
const notificacion = document.getElementById('mensaje-recuperacion');

let temporizadorNotificacion;

recuperar.addEventListener('click', () => {
  notificacion.textContent = mensajeRecuperacion();
  notificacion.hidden = false;

  clearTimeout(temporizadorNotificacion);

  temporizadorNotificacion = setTimeout(() => {
    notificacion.hidden = true;
  }, 4000);
});