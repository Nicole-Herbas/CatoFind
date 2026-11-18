import { crearRepositorioUsuarios } from '../../../../api/repositorios/usuarios.js';
import { crearRepositorioReportes } from '../../../../api/repositorios/reportes.js';
import { iniciarRevisionReportes } from './revisionReportesPresenter.js';

export async function iniciarPanel(
  documento,
  acciones,
  autenticacion = crearRepositorioUsuarios(),
  apiReportes = crearRepositorioReportes()
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
}

if (typeof document !== 'undefined' && document.getElementById('panel-contenido')) {
  iniciarPanel(document, {
    avisar: texto => window.alert(texto),
    irAlLogin: () => window.location.assign('../../../auth/pages/login/login.html')
  });
}
