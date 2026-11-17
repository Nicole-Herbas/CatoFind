/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import {
  RUTA_SOLICITUD,
  obtenerBusquedaInicial,
  datosTarjeta,
} from './buscar.js';

const html = readFileSync('src/app/features/buscar/pages/buscar/buscar.html', 'utf8');
const OBJETOS_DE_PRUEBA = [
  { id: 1, reporteId: 101, titulo: 'Mochila negra', categoria: 'Accesorios', lugar: 'Biblioteca', fecha: '2026-10-08', estado: 'Publicado' },
  { id: 2, titulo: 'Chompa azul', categoria: 'Ropa', lugar: 'Cafetería', fecha: '2026-10-05', estado: 'Publicado' },
  { id: 3, titulo: 'Cuaderno verde', categoria: 'Documentos', lugar: 'Laboratorio', fecha: '2026-09-30', estado: 'Publicado' },
  { id: 4, titulo: 'Audífonos Sony', categoria: 'Electrónica', lugar: 'Bloque A', fecha: '2026-10-12', estado: 'Publicado' },
  { id: 5, titulo: 'Carnet universitario', categoria: 'Documentos', lugar: 'Bloque B', fecha: '2026-10-15', estado: 'Publicado' },
  { id: 6, titulo: 'Calculadora', categoria: 'Electrónica', lugar: 'Bloque A', fecha: '2026-10-18', estado: 'En revisión' }
];

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
    expect(navLinks[2].getAttribute('href')).toBe('../../../reportar/pages/reportar/reportar.html');
    expect(navLinks[3].getAttribute('href')).toBe('../../../buscar/pages/buscar/buscar.html');
  });
});

// Presentador (buscarPresenter.js): igual que loginPresenter.js, se ejecuta
// solo al cargarse la página. En la prueba primero ponemos el HTML y luego
// cargamos el presentador.
// ---------------------------------------------------------------------------
async function abrirPagina(url = '', objetosApi = OBJETOS_DE_PRUEBA) {
  global.fetch = jest.fn(async (ruta) => {
    const parametros = new URL(String(ruta), 'http://local').searchParams;
    const texto = parametros.get('texto')?.toLocaleLowerCase() || '';
    const categoria = parametros.get('categoria');
    const lugar = parametros.get('lugar');
    const encontrados = objetosApi.filter(objeto => objeto.estado === 'Publicado'
      && objeto.titulo.toLocaleLowerCase().includes(texto)
      && (!categoria || categoria === 'Todos' || objeto.categoria === categoria)
      && (!lugar || lugar === 'Todas' || objeto.lugar === lugar));
    return { ok: true, json: async () => encontrados };
  });
  document.body.innerHTML = html;
  window.history.replaceState({}, '', `/buscar.html${url}`);
  jest.resetModules();
  await import('./buscarPresenter.js');
  await new Promise(resolve => setTimeout(resolve, 0));
}

const esperarCarga = () => new Promise(resolve => setTimeout(resolve, 0));

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
    it('muestra los objetos que llegan desde la API', async () => {
      await abrirPagina('', [{
        id: 42,
        titulo: 'Objeto desde Supabase',
        categoria: 'Otros',
        lugar: 'Patio',
        fecha: '2026-11-01',
        imagen: '',
        estado: 'Publicado'
      }]);

      expect(titulosEnPantalla()).toEqual(['Objeto desde Supabase']);
    });

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
    it('debe actualizar las tarjetas al escribir en el buscador', async () => {
      const buscador = document.getElementById('buscador');
      buscador.value = 'chompa';
      buscador.dispatchEvent(new Event('input'));
      await esperarCarga();

      expect(titulosEnPantalla()).toEqual(['Chompa azul']);
      expect(mensajeEnPantalla()).toBe('1 resultado encontrado');
    });

    it('debe actualizar las tarjetas al cambiar un filtro', async () => {
      const filtro = document.getElementById('filtro-categoria');
      filtro.value = 'Documentos';
      filtro.dispatchEvent(new Event('change'));
      await esperarCarga();

      expect(titulosEnPantalla()).toEqual(['Cuaderno verde', 'Carnet universitario']);
    });

    it('debe avisar cuando no hay resultados', async () => {
      const buscador = document.getElementById('buscador');
      buscador.value = 'xyz';
      buscador.dispatchEvent(new Event('input'));
      await esperarCarga();

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
      expect(solicitar.getAttribute('href')).toBe(`${RUTA_SOLICITUD}?reporteId=101`);
    });

    it('debe ocultar el detalle al cerrarlo', () => {
      clicEnPrimeraTarjeta();
      document.querySelector('#detalle .detalle__cerrar').click();

      expect(document.getElementById('detalle').hidden).toBe(true);
    });
  });
});
