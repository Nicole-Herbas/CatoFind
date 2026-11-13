import Validador from './recoveryRequest.js';
import { SolicitudesApi } from '../../../api/solicitudes.js';

const formulario = document.querySelector('.recoveryForm');
const campoDescripcion = document.getElementById('extraDescriptionObject');
const mensajeError = document.getElementById('extraDescriptionError');
const solicitudes = new SolicitudesApi();
const reporteId = new URLSearchParams(window.location.search).get('reporteId');
const avisoElegirObjeto = document.getElementById('elegir-objeto');
const botonEnviar = document.getElementById('sendRequest');

if (!formulario || !campoDescripcion || !mensajeError) {
  throw new Error('No se encontraron los elementos requeridos del formulario de recuperaciÃ³n.');
}

if (!reporteId) {
  avisoElegirObjeto.hidden = false;
  botonEnviar.disabled = true;
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (!reporteId) {
      avisoElegirObjeto.hidden = false;
      return;
    }

    if(!Validador.validarCampos()){
        mostrarMensaje('Campos_Vacios');
        return;
    }

    limpiarMensaje();
    const resultado = await solicitudes.crear({
      reporteId,
      lugarEstimado: document.getElementById('locations').value,
      fechaEstimada: document.getElementById('dateLost').value,
      caracteristicaPrivada: campoDescripcion.value
    });
    mensajeError.textContent = resultado.mensaje;
    mensajeError.hidden = false;
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
