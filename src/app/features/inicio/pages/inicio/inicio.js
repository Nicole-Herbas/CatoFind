import { obtenerObjetos } from '../../../../api/objetos.js';
import { AutenticacionApi } from '../../../../api/autenticacion.js';

const IMAGEN_RESPALDO = 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&q=80';

function formatFecha(fecha) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-BO', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function crearIcono(documento, tipo) {
  const svg = documento.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('aria-hidden', 'true');

  const figura = documento.createElementNS('http://www.w3.org/2000/svg', 'path');
  figura.setAttribute('d', tipo === 'lugar'
    ? 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'
    : 'M3 10h18M8 2v4m8-4v4M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z');
  svg.appendChild(figura);

  if (tipo === 'lugar') {
    const punto = documento.createElementNS('http://www.w3.org/2000/svg', 'circle');
    punto.setAttribute('cx', '12');
    punto.setAttribute('cy', '10');
    punto.setAttribute('r', '3');
    svg.appendChild(punto);
  }
  return svg;
}

function crearTextoConIcono(documento, clase, texto, tipo) {
  const elemento = documento.createElement('span');
  elemento.className = clase;
  elemento.append(crearIcono(documento, tipo), documento.createTextNode(texto));
  return elemento;
}

function crearTarjeta(documento, objeto) {
  const tarjeta = documento.createElement('li');
  tarjeta.className = 'tarjeta';
  tarjeta.tabIndex = 0;
  tarjeta.setAttribute('aria-label', `Objeto encontrado: ${objeto.titulo}`);
  tarjeta.dataset.id = objeto.id;

  const imagenContenedor = documento.createElement('div');
  imagenContenedor.className = 'tarjeta__img-wrap';
  const imagen = documento.createElement('img');
  imagen.className = 'tarjeta__img';
  imagen.src = objeto.imagen || IMAGEN_RESPALDO;
  imagen.alt = objeto.titulo;
  imagen.loading = 'lazy';
  imagen.addEventListener('error', () => {
    imagen.src = IMAGEN_RESPALDO;
  }, { once: true });

  const estado = documento.createElement('span');
  estado.className = 'tarjeta__estado';
  estado.textContent = objeto.estado;
  imagenContenedor.append(imagen, estado);

  const cuerpo = documento.createElement('div');
  cuerpo.className = 'tarjeta__body';
  const titulo = documento.createElement('p');
  titulo.className = 'tarjeta__titulo';
  titulo.textContent = objeto.titulo;
  const meta = documento.createElement('div');
  meta.className = 'tarjeta__meta';
  meta.append(
    crearTextoConIcono(documento, 'tarjeta__meta-item', objeto.lugar, 'lugar'),
    crearTextoConIcono(documento, 'tarjeta__meta-item', formatFecha(objeto.fecha), 'fecha')
  );
  const categoria = documento.createElement('span');
  categoria.className = 'tarjeta__categoria';
  categoria.textContent = objeto.categoria;
  cuerpo.append(titulo, meta, categoria);
  tarjeta.append(imagenContenedor, cuerpo);
  return tarjeta;
}

function renderTarjetas(documento, objetos) {
  const grid = documento.getElementById('objetos-grid');
  const avisoVacio = documento.getElementById('objetos-empty');
  grid.replaceChildren(...objetos.map(objeto => crearTarjeta(documento, objeto)));
  avisoVacio.hidden = objetos.length > 0;
}

function renderFiltros(documento, categorias, categoriaActual) {
  const lista = documento.getElementById('filtros-lista');
  const botones = ['Todos', ...new Set(categorias.map(objeto => objeto.categoria))]
    .map(categoria => {
      const elementoLista = documento.createElement('li');
      const boton = documento.createElement('button');
      boton.type = 'button';
      boton.textContent = categoria;
      boton.className = `filtro-btn${categoria === categoriaActual ? ' filtro-btn--active' : ''}`;
      boton.id = `filtro-${categoria.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      boton.setAttribute('aria-pressed', String(categoria === categoriaActual));
      boton.dataset.categoria = categoria;
      elementoLista.appendChild(boton);
      return elementoLista;
    });
  lista.replaceChildren(...botones);
}

export function iniciarInicio(documento = globalThis.document, apiObjetos = obtenerObjetos) {
  const autenticacion = new AutenticacionApi();
  let categoriaActual = 'Todos';
  let catalogoObjetos = [];
  let revisionSolicitud = 0;
  const filtroCategorias = documento.getElementById('filtros-lista');
  const formularioBusqueda = documento.getElementById('form-buscar');
  const campoBusqueda = documento.getElementById('input-buscar');

  const cargarResultados = async () => {
    const revisionActual = ++revisionSolicitud;
    try {
      const objetos = await apiObjetos({
        categoria: categoriaActual,
        texto: campoBusqueda.value.trim()
      });
      if (revisionActual !== revisionSolicitud) return;
      renderTarjetas(documento, objetos);
    } catch {
      if (revisionActual !== revisionSolicitud) return;
      const aviso = documento.getElementById('objetos-empty');
      aviso.textContent = 'No se pudieron cargar los objetos.';
      aviso.hidden = false;
    }
  };

  apiObjetos().then(objetos => {
    catalogoObjetos = objetos;
    renderFiltros(documento, catalogoObjetos, categoriaActual);
    if (revisionSolicitud === 0) renderTarjetas(documento, catalogoObjetos);
  }).catch(() => {
    const aviso = documento.getElementById('objetos-empty');
    aviso.textContent = 'No se pudieron cargar los objetos.';
    aviso.hidden = false;
  });

  filtroCategorias.addEventListener('click', evento => {
    const boton = evento.target.closest('.filtro-btn');
    if (!boton) return;
    categoriaActual = boton.dataset.categoria;
    renderFiltros(documento, catalogoObjetos, categoriaActual);
    cargarResultados();
  });
  campoBusqueda.addEventListener('input', cargarResultados);
  formularioBusqueda.addEventListener('submit', evento => {
    evento.preventDefault();
    const texto = campoBusqueda.value.trim();
    const destino = '../../../buscar/pages/buscar/buscar.html'
      + (texto ? `?q=${encodeURIComponent(texto)}` : '');
    globalThis.location.href = destino;
  });

  documento.getElementById('btn-logout')?.addEventListener('click', () => {
    autenticacion.cerrarSesion()
      .finally(() => { globalThis.location.href = '../../../auth/pages/login/login.html'; });
  });
  documento.getElementById('btn-reportar-fab')?.addEventListener('click', () => {
    globalThis.location.href = '../../../reportar/pages/reportar/reportar.html';
  });
}

document.addEventListener('DOMContentLoaded', () => iniciarInicio());
