
import {
  obtenerBusquedaInicial,
  datosTarjeta,
  datosDetalle
} from './buscar.js';
import { crearRepositorioObjetos } from '../../../../api/repositorios/objetos.js';


let objetosPublicados = [];
const repositorioObjetos = crearRepositorioObjetos();
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
  const cantidad = objetosPublicados.length;
  mensaje.textContent = cantidad === 1 ? '1 resultado encontrado'
    : cantidad ? `${cantidad} resultados encontrados` : 'No se encontró ningún objeto';
  resultados.replaceChildren(...objetosPublicados.map(dibujarTarjeta));
}

function mostrarDetalle(datos) {
  const solicitar = crearElemento('a', 'detalle__solicitar', 'Solicitar objeto');
  solicitar.href = datos.rutaSolicitud;

  const cerrar = crearElemento('button', 'detalle__cerrar', 'Cerrar');
  cerrar.type = 'button';
  cerrar.addEventListener('click', () => {
    detalle.hidden = true;
  });

  const contenido = [crearElemento('h2', 'detalle__titulo', datos.titulo)];
  if (datos.imagen) {
    const imagen = crearElemento('img', 'detalle__imagen');
    imagen.src = datos.imagen;
    imagen.alt = datos.titulo;
    contenido.push(imagen);
  }
  contenido.push(crearElemento('p', 'detalle__descripcion', datos.descripcion));

  detalle.replaceChildren(
    ...contenido,
    ...datos.lineas.map((linea) => crearElemento('p', 'detalle__dato', linea)),
    solicitar,
    cerrar
  );
  detalle.hidden = false;
}


for (const filtro of [buscador, filtroCategoria, filtroLugar, filtroFecha]) {
  filtro.addEventListener('input', cargarObjetos);
  filtro.addEventListener('change', cargarObjetos);
}
resultados.addEventListener('click', async (evento) => {
  const id = evento.target.closest('.tarjeta')?.dataset.id;
  const objeto = objetosPublicados.find(item => String(item.id) === id);
  if (!objeto) return;
  mostrarDetalle({
    ...datosDetalle(objeto),
    rutaSolicitud: objeto.reporteId
      ? `../../../recoveryRequest/pages/recoveryRequest.html?reporteId=${encodeURIComponent(objeto.reporteId)}`
      : '../../../recoveryRequest/pages/recoveryRequest.html'
  });
});

buscador.value = obtenerBusquedaInicial(window.location.search);
mensaje.textContent = 'Cargando objetos...';

async function cargarObjetos() {
  try {
    objetosPublicados = await repositorioObjetos.listar({
      texto: buscador.value,
      categoria: filtroCategoria.value,
      lugar: filtroLugar.value,
      fecha: filtroFecha.value
    });
    mostrarResultados();
  } catch {
    mensaje.textContent = 'No se pudieron cargar los objetos.';
  }
}

repositorioObjetos.listar().then(objetos => {
  llenarSelect(filtroCategoria, ['Todos', ...new Set(objetos.map(item => item.categoria))]);
  llenarSelect(filtroLugar, ['Todas', ...new Set(objetos.map(item => item.lugar))]);
}).catch(() => {
  mensaje.textContent = 'No se pudieron cargar los objetos.';
});

cargarObjetos();
