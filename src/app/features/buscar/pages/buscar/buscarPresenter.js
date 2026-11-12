
import {
  crearBuscador,
  opcionesDeFiltros,
  obtenerBusquedaInicial,
  obtenerResultados,
  datosTarjeta,
  datosDetalle
} from './buscar.js';


let servicio = crearBuscador();
const buscador = document.getElementById('buscador');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroLugar = document.getElementById('filtro-lugar');
const filtroFecha = document.getElementById('filtro-fecha');
const mensaje = document.getElementById('mensaje-resultados');
const resultados = document.getElementById('resultados');
const detalle = document.getElementById('detalle');


function crearElemento(etiqueta, clase, texto = '') {
  const elemento = document.createElement(etiqueta);
  elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

function llenarSelect(select, opciones) {
  select.replaceChildren();
  opciones.forEach((opcion) => {
    const option = document.createElement('option');
    option.value = opcion;
    option.textContent = opcion;
    select.appendChild(option);
  });
}

function dibujarTarjeta(objeto) {
  const datos = datosTarjeta(objeto);
  const tarjeta = crearElemento('article', 'tarjeta');
  tarjeta.dataset.id = datos.id;

  if (datos.imagen) {
    const imagen = crearElemento('img', 'tarjeta__imagen');
    imagen.src = datos.imagen;
    imagen.alt = datos.titulo;
    tarjeta.appendChild(imagen);
  }

  tarjeta.appendChild(crearElemento('span', 'tarjeta__estado', datos.estado));
  tarjeta.appendChild(crearElemento('h3', 'tarjeta__titulo', datos.titulo));
  datos.datos.forEach((dato) => {
    tarjeta.appendChild(crearElemento('p', 'tarjeta__dato', dato));
  });

  return tarjeta;
}

function mostrarResultados() {
  const resultado = obtenerResultados(servicio, {
    texto: buscador.value,
    categoria: filtroCategoria.value,
    lugar: filtroLugar.value,
    fecha: filtroFecha.value
  });

  mensaje.textContent = resultado.mensaje;
  resultados.replaceChildren(...resultado.objetos.map(dibujarTarjeta));
}

function mostrarDetalle(datos) {
  const solicitar = crearElemento('a', 'detalle__solicitar', 'Solicitar objeto');
  solicitar.href = datos.rutaSolicitud;

  const cerrar = crearElemento('button', 'detalle__cerrar', 'Cerrar');
  cerrar.type = 'button';
  cerrar.addEventListener('click', () => {
    detalle.hidden = true;
  });

  detalle.replaceChildren(
    crearElemento('h2', 'detalle__titulo', datos.titulo),
    ...datos.lineas.map((linea) => crearElemento('p', 'detalle__dato', linea)),
    solicitar,
    cerrar
  );
  detalle.hidden = false;
}


const opciones = opcionesDeFiltros();
llenarSelect(filtroCategoria, opciones.categorias);
llenarSelect(filtroLugar, opciones.lugares);

buscador.addEventListener('input', mostrarResultados);
filtroCategoria.addEventListener('change', mostrarResultados);
filtroLugar.addEventListener('change', mostrarResultados);
filtroFecha.addEventListener('change', mostrarResultados);

resultados.addEventListener('click', (evento) => {
  const tarjeta = evento.target.closest('.tarjeta');

  if (!tarjeta) {
    return;
  }

  const datos = datosDetalle(servicio, tarjeta.dataset.id);

  if (datos) {
    mostrarDetalle(datos);
  }
});

buscador.value = obtenerBusquedaInicial(window.location.search);
mensaje.textContent = 'Cargando objetos...';

async function cargarObjetos() {
  try {
    const respuesta = await fetch('/api/objetos');
    if (!respuesta.ok) throw new Error('No se pudieron cargar los objetos.');

    servicio = crearBuscador(await respuesta.json());
    const filtros = opcionesDeFiltros(servicio.obtenerPublicados());
    llenarSelect(filtroCategoria, filtros.categorias);
    llenarSelect(filtroLugar, filtros.lugares);
    mostrarResultados();
  } catch {
    mensaje.textContent = 'No se pudieron cargar los objetos.';
  }
}

cargarObjetos();
