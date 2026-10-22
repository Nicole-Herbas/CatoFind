import Validador from './recoveryRequest.js';

const formulario = document.querySelector('.recoveryForm');
const campoDescripcion = document.getElementById('extraDescriptionObject');
const mensajeError = document.getElementById('extraDescriptionError');

if (!formulario || !campoDescripcion || !mensajeError) {
  throw new Error('No se encontraron los elementos requeridos del formulario de recuperación.');
}

formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if(!Validador.validarCampos()){
        mostrarMensaje('Campos_Vacios');
        return;
    }

    limpiarMensaje();
});

campoDescripcion.addEventListener('input', () => {
  limpiarSiFormularioValido();
});

document.getElementById('locations').addEventListener('change', limpiarSiFormularioValido);
document.getElementById('dateLost').addEventListener('input', limpiarSiFormularioValido);

function mostrarMensaje(tipoError) {
  mensajeError.textContent = Validador.Message(tipoError);
  mensajeError.hidden = false;
}

function limpiarMensaje() {
  mensajeError.textContent = '';
  mensajeError.hidden = true;
  campoDescripcion.removeAttribute('aria-invalid');
}

function limpiarSiFormularioValido() {
  if (Validador.validarCampos()) {
    limpiarMensaje();
  }
}
