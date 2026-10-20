import Validador from './recoveryRequest.js';

const formulario = document.querySelector('.recoveryForm');
const campoDescripcion = document.getElementById('extraDescriptionObject');
const mensajeError = document.getElementById('extraDescriptionError');

if (!formulario || !campoDescripcion || !mensajeError) {
  throw new Error('No se encontraron los elementos requeridos del formulario de recuperación.');
}

formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if(!Validador.validarLugar()){
        mostrarMensaje('Lugar_invalido');
        return;
    }

    if(!Validador.validarAreaTexto()){
        campoDescripcion.setAttribute('aria-invalid', 'true');
        mostrarMensaje('Area_Vacia');
        return;
    }

    limpiarMensaje();
});

campoDescripcion.addEventListener('input', () => {
  if (Validador.validarAreaTexto()) {
    limpiarMensaje();
  }
});

function mostrarMensaje(tipoError) {
  mensajeError.textContent = Validador.Message(tipoError);
  mensajeError.hidden = false;
}

function limpiarMensaje() {
  mensajeError.textContent = '';
  mensajeError.hidden = true;
  campoDescripcion.removeAttribute('aria-invalid');
}
