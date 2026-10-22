/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { Objeto } from '../../../core/models/Objeto.js';
import { BuscadorService } from '../services/BuscadorService.js';
import { iniciarBuscador } from '../pages/buscar/buscarVista.js';

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

function titulosEnPantalla() {
  return [...document.querySelectorAll('#resultados .tarjeta')]
    .map((tarjeta) => tarjeta.querySelector('.tarjeta__titulo').textContent);
}

function mensajeEnPantalla() {
  return document.querySelector('#mensaje-resultados').textContent;
}

beforeEach(() => {
  document.body.innerHTML = html;
  iniciarBuscador(document, crearServicio(), hoy);
});

describe('Vista Buscar - al abrir la página (HU-07)', () => {
  it('debe mostrar solo las tarjetas de objetos publicados', () => {
    expect(titulosEnPantalla()).toEqual(['Mochila negra', 'Chompa azul']);
  });

  it('debe mostrar cuántos resultados hay', () => {
    expect(mensajeEnPantalla()).toBe('2 resultados encontrados');
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

describe('Vista Buscar - al buscar y filtrar (HU-09)', () => {
  it('debe actualizar las tarjetas al escribir en el buscador', () => {
    const buscador = document.querySelector('#buscador');
    buscador.value = 'chompa';
    buscador.dispatchEvent(new Event('input'));

    expect(titulosEnPantalla()).toEqual(['Chompa azul']);
    expect(mensajeEnPantalla()).toBe('1 resultado encontrado');
  });

  it('debe actualizar las tarjetas al cambiar un filtro', () => {
    const filtro = document.querySelector('#filtro-categoria');
    filtro.value = 'Accesorios';
    filtro.dispatchEvent(new Event('change'));

    expect(titulosEnPantalla()).toEqual(['Mochila negra']);
  });

  it('debe avisar cuando no hay resultados', () => {
    const buscador = document.querySelector('#buscador');
    buscador.value = 'xyz';
    buscador.dispatchEvent(new Event('input'));

    expect(titulosEnPantalla()).toEqual([]);
    expect(mensajeEnPantalla()).toBe('No se encontró ningún objeto');
  });
});

describe('Vista Buscar - detalle del objeto (HU-08)', () => {
  function clicEnPrimeraTarjeta() {
    document.querySelector('#resultados .tarjeta').click();
  }

  it('debe mostrar el detalle al hacer clic en una tarjeta', () => {
    clicEnPrimeraTarjeta();
    const detalle = document.querySelector('#detalle');

    expect(detalle.hidden).toBe(false);
    expect(detalle.querySelector('.detalle__titulo').textContent).toBe('Mochila negra');
    expect(detalle.textContent).toContain('Biblioteca');
  });

  it('debe tener el botón para solicitar el objeto', () => {
    clicEnPrimeraTarjeta();

    expect(document.querySelector('#detalle .detalle__solicitar').textContent)
      .toBe('Solicitar objeto');
  });

  it('debe tener el enlace para solicitar objeto apuntando a recoveryRequest.html', () => {
    clicEnPrimeraTarjeta();
    const solicitar = document.querySelector('#detalle .detalle__solicitar');
    expect(solicitar.getAttribute('href')).toBe('../../../recoveryRequest/pages/recoveryRequest.html');
  });

  it('debe ocultar el detalle al cerrarlo', () => {
    clicEnPrimeraTarjeta();
    document.querySelector('#detalle .detalle__cerrar').click();

    expect(document.querySelector('#detalle').hidden).toBe(true);
  });
});