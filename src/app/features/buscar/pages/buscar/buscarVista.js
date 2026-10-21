import { CATEGORIAS, LUGARES } from '../../../../core/data/datosIniciales.js';

function crearElemento(documento, etiqueta, clase, texto = '') {
  const elemento = documento.createElement(etiqueta);
  elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

export function llenarSelect(select, opciones) {
  select.innerHTML = '';
  opciones.forEach((opcion) => {
    const option = select.ownerDocument.createElement('option');
    option.value = opcion;
    option.textContent = opcion;
    select.appendChild(option);
  });
}

export function crearTarjeta(documento, objeto) {
  const tarjeta = crearElemento(documento, 'article', 'tarjeta');
  tarjeta.dataset.id = objeto.id;

  if (objeto.imagen) {
    const imagen = crearElemento(documento, 'img', 'tarjeta__imagen');
    imagen.src = objeto.imagen;
    imagen.alt = objeto.titulo;
    tarjeta.appendChild(imagen);
  }

  tarjeta.appendChild(crearElemento(documento, 'span', 'tarjeta__estado', objeto.estado));
  tarjeta.appendChild(crearElemento(documento, 'h3', 'tarjeta__titulo', objeto.titulo));
  tarjeta.appendChild(crearElemento(documento, 'p', 'tarjeta__dato', objeto.categoria));
  tarjeta.appendChild(crearElemento(documento, 'p', 'tarjeta__dato', objeto.lugar));
  tarjeta.appendChild(crearElemento(documento, 'p', 'tarjeta__dato', objeto.fecha));
  return tarjeta;
}

export function iniciarBuscador(documento, service, hoy = new Date()) {
  const buscador = documento.querySelector('#buscador');
  const filtroCategoria = documento.querySelector('#filtro-categoria');
  const filtroLugar = documento.querySelector('#filtro-lugar');
  const filtroFecha = documento.querySelector('#filtro-fecha');
  const mensaje = documento.querySelector('#mensaje-resultados');
  const resultados = documento.querySelector('#resultados');
  const detalle = documento.querySelector('#detalle');

  llenarSelect(filtroCategoria, CATEGORIAS);
  llenarSelect(filtroLugar, LUGARES);

  function actualizar() {
    const encontrados = service.buscar(
      {
        texto: buscador.value,
        categoria: filtroCategoria.value,
        lugar: filtroLugar.value,
        fecha: filtroFecha.value,
      },
      hoy
    );

    mensaje.textContent = service.mensajeResultados(encontrados);
    resultados.replaceChildren(...encontrados.map((objeto) => crearTarjeta(documento, objeto)));
  }

    function mostrarDetalle(objeto) {
    const solicitar = crearElemento(documento, 'button', 'detalle__solicitar', 'Solicitar objeto');
    const cerrar = crearElemento(documento, 'button', 'detalle__cerrar', 'Cerrar');
    solicitar.type = 'button';
    cerrar.type = 'button';
    cerrar.addEventListener('click', () => {
      detalle.hidden = true;
    });

    detalle.replaceChildren(
      crearElemento(documento, 'h2', 'detalle__titulo', objeto.titulo),
      crearElemento(documento, 'p', 'detalle__dato', `Categoría: ${objeto.categoria}`),
      crearElemento(documento, 'p', 'detalle__dato', `Lugar: ${objeto.lugar}`),
      crearElemento(documento, 'p', 'detalle__dato', `Fecha: ${objeto.fecha}`),
      solicitar,
      cerrar
    );
    detalle.hidden = false;
  }

  resultados.addEventListener('click', (evento) => {
    const tarjeta = evento.target.closest('.tarjeta');
    if (!tarjeta) return;

    const objeto = service.obtenerDetalle(Number(tarjeta.dataset.id));
    if (objeto) mostrarDetalle(objeto);
  });

  buscador.addEventListener('input', actualizar);
  [filtroCategoria, filtroLugar, filtroFecha].forEach((filtro) =>
    filtro.addEventListener('change', actualizar)
  );

  actualizar();
}