import { AutenticacionApi } from '../../../../api/autenticacion.js';
import { crearServicioInicio } from '../../services/inicioService.js';
import { mostrarError, renderFiltros, renderTarjetas } from './inicioVista.js';

const RUTA_BUSCAR = '../../../buscar/pages/buscar/buscar.html';
const RUTA_LOGIN = '../../../auth/pages/login/login.html';
const RUTA_REPORTAR = '../../../reportar/pages/reportar/reportar.html';

export async function iniciarInicio(documento = globalThis.document, opciones = {}) {
  const {
    servicio = crearServicioInicio(),
    autenticacion = new AutenticacionApi(),
    navegar = ruta => { globalThis.location.href = ruta; }
  } = opciones;

  let categoriaActual = 'Todos';
  let catalogoObjetos = [];
  let revisionSolicitud = 0;
  const filtroCategorias = documento.getElementById('filtros-lista');
  const formularioBusqueda = documento.getElementById('form-buscar');
  const campoBusqueda = documento.getElementById('input-buscar');

  async function cargarResultados() {
    const revisionActual = ++revisionSolicitud;

    try {
      const objetos = await servicio.filtrar({
        categoria: categoriaActual,
        texto: campoBusqueda.value.trim()
      });
      if (revisionActual !== revisionSolicitud) {
        return;
      }

      renderTarjetas(documento, objetos);
    } catch {
      if (revisionActual === revisionSolicitud) {
        mostrarError(documento);
      }
    }
  }

  filtroCategorias.addEventListener('click', evento => {
    const boton = evento.target.closest('.filtro-btn');
    if (!boton) {
      return;
    }

    categoriaActual = boton.dataset.categoria;
    renderFiltros(documento, catalogoObjetos, categoriaActual);
    cargarResultados();
  });
  campoBusqueda.addEventListener('input', cargarResultados);
  formularioBusqueda.addEventListener('submit', evento => {
    evento.preventDefault();
    const texto = campoBusqueda.value.trim();
    navegar(`${RUTA_BUSCAR}${texto ? `?q=${encodeURIComponent(texto)}` : ''}`);
  });

  documento.getElementById('btn-logout')?.addEventListener('click', () => {
    autenticacion.cerrarSesion().finally(() => navegar(RUTA_LOGIN));
  });
  documento.getElementById('btn-reportar-fab')?.addEventListener('click', () => {
    navegar(RUTA_REPORTAR);
  });

  try {
    catalogoObjetos = await servicio.obtenerRecientes();
    renderFiltros(documento, catalogoObjetos, categoriaActual);
    if (revisionSolicitud === 0) {
      renderTarjetas(documento, catalogoObjetos);
    }
  } catch {
    mostrarError(documento);
  }
}

if (typeof document !== 'undefined' && document.getElementById('form-buscar')) {
  document.addEventListener('DOMContentLoaded', () => iniciarInicio());
}
