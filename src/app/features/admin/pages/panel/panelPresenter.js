
import {
  verificarAccesoAdministrador,
  obtenerSesion,
  cerrarSesion
} from '../../../auth/pages/login/login.js';

export function iniciarPanel(documento, almacenamientoSesion, acciones) {

  const acceso = verificarAccesoAdministrador(almacenamientoSesion);

  if (!acceso.permitido) {
    acciones.avisar(acceso.mensaje);
    acciones.irAlLogin();
    return;
  }

  const usuario = obtenerSesion(almacenamientoSesion);

  documento.getElementById('nombre-admin').textContent =
    usuario.nombre;

  documento.getElementById('panel-contenido').hidden = false;

  documento.getElementById('cerrar-sesion')
    .addEventListener('click', () => {
      cerrarSesion(almacenamientoSesion);
      acciones.irAlLogin();
    });
}

// Ejecucion en el navegador
if (
  typeof document !== 'undefined' &&
  document.getElementById('panel-contenido')
) {
  iniciarPanel(document, sessionStorage, {
    avisar: texto => window.alert(texto),
    irAlLogin: () => window.location.assign('../../../auth/pages/login/login.html')
  });
}
