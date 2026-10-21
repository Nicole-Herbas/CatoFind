
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

recuperar.addEventListener('click', () => {
  mensaje.textContent = mensajeRecuperacion();
  mensaje.style.color = '#16803d';
});