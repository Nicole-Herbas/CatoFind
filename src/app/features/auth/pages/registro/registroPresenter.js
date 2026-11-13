
import { AutenticacionApi } from '../../../../api/autenticacion.js';

const formulario = document.getElementById('registro-form');
const mensaje = document.getElementById('registro-mensaje');
const autenticacion = new AutenticacionApi();

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const datos = {
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    correo: document.getElementById('correo-registro').value,
    contrasena: document.getElementById('contrasena-registro').value,
    confirmarContrasena: document.getElementById('confirmar-contrasena').value
  };

  const resultado = await autenticacion.registrarEstudiante(datos);

  mensaje.textContent = resultado.mensaje;
  mensaje.style.color = resultado.ok ? '#16803d' : '#c62828';

  if (resultado.ok) {
    formulario.reset();
    window.location.href = '../login/login.html';
  }
});
