import { AutenticacionApi } from '../../../../api/autenticacion.js';
import { crearApiReportes } from '../../../../api/reportes.js';
import { iniciarRevisionReportes } from './revisionReportesPresenter.js';

export async function iniciarPanel(
  documento,
  acciones,
  autenticacion = new AutenticacionApi(),
  apiReportes = crearApiReportes()
) {
  let usuario;

  try {
    usuario = await autenticacion.obtenerSesionAdministrador();
  } catch (error) {
    acciones.avisar(error.message);
    acciones.irAlLogin();
    return;
  }

  documento.getElementById('nombre-admin').textContent = usuario.nombre;
  documento.getElementById('panel-contenido').hidden = false;
  await iniciarRevisionReportes(documento, apiReportes);

  documento.getElementById('cerrar-sesion').addEventListener('click', async () => {
    await autenticacion.cerrarSesion();
    acciones.irAlLogin();
  });
}

if (typeof document !== 'undefined' && document.getElementById('panel-contenido')) {
  iniciarPanel(document, {
    avisar: texto => window.alert(texto),
    irAlLogin: () => window.location.assign('../../../auth/pages/login/login.html')
  });
}
