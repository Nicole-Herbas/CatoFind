
import { registrarEstudiante } from './registro.js';

const formulario = document.getElementById('registro-form');
const mensaje = document.getElementById('registro-mensaje');

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const datos = {
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    correo: document.getElementById('correo-registro').value,
    contrasena: document.getElementById('contrasena-registro').value,
    confirmarContrasena: document.getElementById('confirmar-contrasena').value
  };

  const resultado = registrarEstudiante(datos, localStorage);

  mensaje.textContent = resultado.mensaje;
  mensaje.style.color = resultado.ok ? '#16803d' : '#c62828';

  if (resultado.ok) {
    formulario.reset();
  }
});
