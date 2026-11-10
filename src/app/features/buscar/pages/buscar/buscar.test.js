/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { Objeto } from '../../../../core/models/Objeto.js';
import { BuscadorService } from '../../services/BuscadorService.js';
import {
  RUTA_SOLICITUD,
  crearBuscador,
  opcionesDeFiltros,
  obtenerBusquedaInicial,
  obtenerResultados,
  datosTarjeta,
  datosDetalle,
} from './buscar.js';

const html = readFileSync('src/app/features/buscar/pages/buscar/buscar.html', 'utf8');
const hoy = new Date('2026-10-21T12:00:00');

function crearServicio() {
  return new BuscadorService([
    new Objeto({ id: 1, titulo: 'Mochila negra', categoria: 'Accesorios', lugar: 'Biblioteca',
      fecha: '2026-10-19', imagen: '', estado: 'Publicado' }),
    new Objeto({ id: 2, titulo: 'Chompa azul', categoria: 'Ropa', lugar: 'Cafetería',
      fecha: '2026-10-05', imagen: '', estado: 'Publicado' }),
    new Objeto({ id: 3, titulo: 'Calculadora', categoria: 'Electrónica', lugar: 'Bloque A',
      fecha: '2026-10-18', imagen: '', estado: 'En revisión' }),
  ]);
}

// ---------------------------------------------------------------------------
// Vista: estructura de buscar.html
// ---------------------------------------------------------------------------
describe('Página Buscar - estructura', () => {
  const pagina = new DOMParser().parseFromString(html, 'text/html');

  it('debe tener el buscador de texto', () => {
    expect(pagina.querySelector('#buscador')).not.toBeNull();
  });

  it('debe tener los filtros de categoría, lugar y fecha', () => {
    expect(pagina.querySelector('#filtro-categoria')).not.toBeNull();
    expect(pagina.querySelector('#filtro-lugar')).not.toBeNull();
    expect(pagina.querySelector('#filtro-fecha')).not.toBeNull();
  });

  it('debe tener el mensaje y el contenedor de resultados', () => {
    expect(pagina.querySelector('#mensaje-resultados')).not.toBeNull();
    expect(pagina.querySelector('#resultados')).not.toBeNull();
  });

  it('debe enlazar su hoja de estilos', () => {
    expect(pagina.querySelector('link[href="./buscar.css"]')).not.toBeNull();
  });

  it('debe cargar su presentador', () => {
    expect(pagina.querySelector('script[src="./buscarPresenter.js"]')).not.toBeNull();
  });

  it('debe tener los enlaces correctos en la barra de navegacion', () => {
    const navLinks = pagina.querySelectorAll('header.navbar nav a');
    expect(navLinks[0].getAttribute('href')).toBe('../../../inicio/pages/inicio/inicio.html');
    expect(navLinks[1].getAttribute('href')).toBe('./buscar.html');
    expect(navLinks[2].getAttribute('href')).toBe('../../../recoveryRequest/pages/recoveryRequest.html');
  });
});

// ---------------------------------------------------------------------------
// Lógica de la pantalla (buscar.js): sin DOM
// ---------------------------------------------------------------------------
describe('Buscar - lógica de la pantalla', () => {
  it('debe crear el buscador con los objetos iniciales por defecto', () => {
    expect(crearBuscador().obtenerPublicados().length).toBeGreaterThan(0);
  });

  it('debe dar las opciones de los filtros', () => {
    const { categorias, lugares } = opcionesDeFiltros();
    expect(categorias[0]).toBe('Todos');
    expect(lugares[0]).toBe('Todas');
  });

  it('debe leer la búsqueda que viene en la URL', () => {
    expect(obtenerBusquedaInicial('?q=mochila')).toBe('mochila');
    expect(obtenerBusquedaInicial('?q=%20celular%20')).toBe('celular');
    expect(obtenerBusquedaInicial('')).toBe('');
  });

  it('debe devolver los objetos encontrados y su mensaje', () => {
    const { objetos, mensaje } = obtenerResultados(crearServicio(), { texto: 'chompa' }, hoy);
    expect(objetos.map((o) => o.titulo)).toEqual(['Chompa azul']);
    expect(mensaje).toBe('1 resultado encontrado');
  });

  it('debe preparar los datos de una tarjeta', () => {
    const [mochila] = crearServicio().obtenerPublicados();
    expect(datosTarjeta(mochila)).toEqual({
      id: 1,
      titulo: 'Mochila negra',
      imagen: '',
      estado: 'Publicado',
      datos: ['Accesorios', 'Biblioteca', '2026-10-19'],
    });
  });

  it('debe preparar el detalle de un objeto publicado', () => {
    expect(datosDetalle(crearServicio(), '1')).toEqual({
      titulo: 'Mochila negra',
      lineas: ['Categoría: Accesorios', 'Lugar: Biblioteca', 'Fecha: 2026-10-19'],
      rutaSolicitud: RUTA_SOLICITUD,
    });
  });

  it('no debe dar detalle de un objeto no publicado', () => {
    expect(datosDetalle(crearServicio(), 3)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Presentador (buscarPresenter.js): igual que loginPresenter.js, se ejecuta
// solo al cargarse la página. En la prueba primero ponemos el HTML y luego
// cargamos el presentador.
// ---------------------------------------------------------------------------
async function abrirPagina(url = '') {
  document.body.innerHTML = html;
  window.history.replaceState({}, '', `/buscar.html${url}`);
  jest.resetModules();
  await import('./buscarPresenter.js');
}

function titulosEnPantalla() {
  return [...document.querySelectorAll('#resultados .tarjeta')]
    .map((tarjeta) => tarjeta.querySelector('.tarjeta__titulo').textContent);
}

function mensajeEnPantalla() {
  return document.getElementById('mensaje-resultados').textContent;
}

describe('Presentador de Buscar', () => {
  beforeEach(async () => {
    await abrirPagina();
  });

  describe('al abrir la página (HU-07)', () => {
    it('debe mostrar solo las tarjetas de objetos publicados', () => {
      expect(titulosEnPantalla()).toEqual([
        'Mochila negra',
        'Chompa azul',
        'Cuaderno verde',
        'Audífonos Sony',
        'Carnet universitario',
      ]);
    });

    it('debe mostrar cuántos resultados hay', () => {
      expect(mensajeEnPantalla()).toBe('5 resultados encontrados');
    });

    it('debe llenar los filtros de categoría y lugar', () => {
      const categorias = [...document.querySelectorAll('#filtro-categoria option')].map((o) => o.value);
      const lugares = [...document.querySelectorAll('#filtro-lugar option')].map((o) => o.value);

      expect(categorias[0]).toBe('Todos');
      expect(categorias).toContain('Ropa');
      expect(lugares[0]).toBe('Todas');
      expect(lugares).toContain('Cafetería');
    });
  });

  describe('al buscar y filtrar (HU-09)', () => {
    it('debe actualizar las tarjetas al escribir en el buscador', () => {
      const buscador = document.getElementById('buscador');
      buscador.value = 'chompa';
      buscador.dispatchEvent(new Event('input'));

      expect(titulosEnPantalla()).toEqual(['Chompa azul']);
      expect(mensajeEnPantalla()).toBe('1 resultado encontrado');
    });

    it('debe actualizar las tarjetas al cambiar un filtro', () => {
      const filtro = document.getElementById('filtro-categoria');
      filtro.value = 'Documentos';
      filtro.dispatchEvent(new Event('change'));

      expect(titulosEnPantalla()).toEqual(['Cuaderno verde', 'Carnet universitario']);
    });

    it('debe avisar cuando no hay resultados', () => {
      const buscador = document.getElementById('buscador');
      buscador.value = 'xyz';
      buscador.dispatchEvent(new Event('input'));

      expect(titulosEnPantalla()).toEqual([]);
      expect(mensajeEnPantalla()).toBe('No se encontró ningún objeto');
    });

    it('debe aplicar la búsqueda que viene en la URL', async () => {
      await abrirPagina('?q=mochila');

      expect(document.getElementById('buscador').value).toBe('mochila');
      expect(titulosEnPantalla()).toEqual(['Mochila negra']);
    });
  });

  describe('detalle del objeto (HU-08)', () => {
    function clicEnPrimeraTarjeta() {
      document.querySelector('#resultados .tarjeta').click();
    }

    it('debe mostrar el detalle al hacer clic en una tarjeta', () => {
      clicEnPrimeraTarjeta();
      const detalle = document.getElementById('detalle');

      expect(detalle.hidden).toBe(false);
      expect(detalle.querySelector('.detalle__titulo').textContent).toBe('Mochila negra');
      expect(detalle.textContent).toContain('Biblioteca');
    });

    it('debe tener el enlace para solicitar el objeto', () => {
      clicEnPrimeraTarjeta();
      const solicitar = document.querySelector('#detalle .detalle__solicitar');

      expect(solicitar.textContent).toBe('Solicitar objeto');
      expect(solicitar.getAttribute('href')).toBe(RUTA_SOLICITUD);
    });

    it('debe ocultar el detalle al cerrarlo', () => {
      clicEnPrimeraTarjeta();
      document.querySelector('#detalle .detalle__cerrar').click();

      expect(document.getElementById('detalle').hidden).toBe(true);
    });
  });
});
