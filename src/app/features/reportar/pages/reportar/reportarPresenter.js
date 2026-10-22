
import {
  CATEGORIAS,
  LUGARES
} from '../../../../core/data/datosIniciales.js';

import {
  validarInformacion,
  registrarReporte
} from './reportar.js';

import {
  validarArchivoImagen,
  convertirImagen
} from './imagen.js';

const CAMPOS = [
  'categoria',
  'titulo',
  'lugar',
  'fecha',
  'hora',
  'descripcion',
  'detallePrivado'
];

const PASOS = [
  'informacion',
  'foto',
  'confirmacion'
];

export function iniciarFormularioReporte(
  documento,
  almacenamiento,
  opciones = {}
) {

  const {
    procesarImagen = convertirImagen,
    ahora = () => new Date()
  } = opciones;

  const elemento = id => documento.getElementById(id);

  let fotografia = '';
  let procesandoFoto = false;
  let enviado = false;
  let versionFoto = 0;

  function cargarOpciones(id, opcionesLista, excluir) {
    const select = elemento(id);

    opcionesLista
      .filter(valor => valor !== excluir)
      .forEach(valor => {
        const opcion = documento.createElement('option');

        opcion.value = valor;
        opcion.textContent = valor;

        select.appendChild(opcion);
      });
  }

  cargarOpciones('categoria', CATEGORIAS, 'Todos');
  cargarOpciones('lugar', LUGARES, 'Todas');

  function obtenerDatos() {
    const datos = {};

    CAMPOS.forEach(campo => {
      datos[campo] = elemento(campo).value;
    });

    return {
      ...datos,
      imagen: fotografia
    };
  }

  function mostrarPaso(nombre) {
    PASOS.forEach(paso => {
      elemento(`paso-${paso}`).hidden = paso !== nombre;
    });

    const numeroPaso = PASOS.indexOf(nombre) + 1;

    documento.querySelectorAll('.pasos li').forEach(indicador => {
      const activo =
        Number(indicador.dataset.paso) === numeroPaso;

      indicador.classList.toggle('pasos__activo', activo);

      if (activo) {
        indicador.setAttribute('aria-current', 'step');
      } else {
        indicador.removeAttribute('aria-current');
      }
    });
  }

  function mostrarErrores(errores) {
    CAMPOS.filter(campo => campo !== 'detallePrivado')
      .forEach(campo => {
        const mensaje = errores[campo] || '';

        elemento(`error-${campo}`).textContent = mensaje;

        if (mensaje) {
          elemento(campo).setAttribute('aria-invalid', 'true');
        } else {
          elemento(campo).removeAttribute('aria-invalid');
        }
      });
  }

  function validarPasoInformacion() {
    const resultado = validarInformacion(
      obtenerDatos(),
      ahora()
    );

    mostrarErrores(resultado.errores);

    return resultado.valido;
  }

  function mostrarAviso(texto) {
    const aviso = elemento('aviso-foto');

    aviso.textContent = texto;
    aviso.hidden = false;
  }

  function ocultarAviso() {
    elemento('aviso-foto').hidden = true;
  }

  elemento('siguiente-informacion')
    .addEventListener('click', () => {

      if (!validarPasoInformacion()) {
        return;
      }

      mostrarPaso('foto');
    });

  elemento('volver-informacion')
    .addEventListener('click', () => {
      mostrarPaso('informacion');
    });

  async function cargarFotografia(archivo) {
    if (!archivo) return;

    const versionActual = ++versionFoto;

    fotografia = '';
    procesandoFoto = false;

    elemento('foto-preview').hidden = true;

    const validacion = validarArchivoImagen(archivo);

    if (!validacion.valido) {
      mostrarAviso(validacion.error);
      return;
    }

    procesandoFoto = true;
    ocultarAviso();

    try {
      const resultado = await procesarImagen(archivo);

      if (versionActual !== versionFoto) {
        return;
      }

      if (
        typeof resultado !== 'string' ||
        !/^data:image\/(jpeg|png|webp);base64,/.test(resultado)
      ) {
        throw new Error('La fotografía procesada no es válida.');
      }

      fotografia = resultado;

      const vista = elemento('foto-preview');

      vista.src = fotografia;
      vista.hidden = false;

      ocultarAviso();

    } catch (error) {

      if (versionActual !== versionFoto) {
        return;
      }

      fotografia = '';

      mostrarAviso(
        error.message || 'No se pudo cargar la fotografía.'
      );

    } finally {
      if (versionActual === versionFoto) {
        procesandoFoto = false;
      }
    }
  }

  ['foto-archivo', 'foto-camara'].forEach(id => {
    elemento(id).addEventListener('change', evento => {
      cargarFotografia(evento.target.files?.[0]);
    });
  });

  const zona = documento.querySelector('.zona-foto');

  zona.addEventListener('dragover', evento => {
    evento.preventDefault();

    zona.classList.add('zona-foto--arrastrando');
  });

  zona.addEventListener('dragleave', () => {
    zona.classList.remove('zona-foto--arrastrando');
  });

  zona.addEventListener('drop', evento => {
    evento.preventDefault();

    zona.classList.remove('zona-foto--arrastrando');

    cargarFotografia(evento.dataTransfer?.files?.[0]);
  });

  function mostrarResumen() {
    const datos = obtenerDatos();

    [
      'titulo',
      'descripcion',
      'categoria',
      'lugar',
      'fecha',
      'hora'
    ].forEach(campo => {
      elemento(`confirm-${campo}`).textContent = datos[campo];
    });

    const imagenResumen = elemento('confirm-imagen');

    imagenResumen.src = fotografia;
    imagenResumen.hidden = false;

    elemento('confirm-privado').hidden =
      !datos.detallePrivado.trim();
  }

  elemento('siguiente-foto')
    .addEventListener('click', () => {

      if (procesandoFoto) {
        mostrarAviso('Se está procesando la fotografía.');
        return;
      }

      if (!fotografia) {
        mostrarAviso('Agrega una fotografía para continuar.');
        return;
      }

      ocultarAviso();

      mostrarResumen();

      mostrarPaso('confirmacion');
    });

  elemento('volver-foto')
    .addEventListener('click', () => {
      mostrarPaso('foto');
    });

  elemento('form-reportar')
    .addEventListener('submit', evento => {

      evento.preventDefault();

      if (enviado) {
        return;
      }

      if (!validarPasoInformacion()) {
        mostrarPaso('informacion');
        return;
      }

      if (!fotografia) {
        mostrarPaso('foto');

        mostrarAviso('Agrega una fotografía para continuar.');
        return;
      }

      const estado = elemento('estado-reporte');

      try {
        const resultado = registrarReporte(
          obtenerDatos(),
          almacenamiento,
          ahora()
        );

        if (!resultado.ok) {

          mostrarErrores(resultado.errores);

          if (resultado.errores.imagen) {
            mostrarPaso('foto');
            mostrarAviso(resultado.errores.imagen);
          } else {
            mostrarPaso('informacion');
          }

          return;
        }

        enviado = true;

        documento.querySelectorAll('.paso').forEach(paso => {
          paso.hidden = true;
        });

        estado.classList.remove('reporte-exito--error');

        estado.textContent =
          `Reporte #${resultado.reporte.id} enviado correctamente. ` +
          'Estado: Pendiente de revisión por Bienestar Estudiantil.';

        estado.hidden = false;

        elemento('enviar-reporte').disabled = true;

      } catch (error) {

        estado.classList.add('reporte-exito--error');

        estado.textContent =
          'No se pudo guardar el reporte. ' +
          'Verifica el espacio disponible e inténtalo nuevamente.';

        estado.hidden = false;
      }
    });

  mostrarPaso('informacion');
}

if (
  typeof document !== 'undefined' &&
  document.getElementById('form-reportar')
) {
  iniciarFormularioReporte(document, localStorage);
}
