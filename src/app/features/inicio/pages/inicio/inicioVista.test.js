/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { Objeto } from '../../../../core/models/Objeto.js';
import { renderFiltros, renderTarjetas } from './inicioVista.js';

const htmlInicio = readFileSync(
  'src/app/features/inicio/pages/inicio/inicio.html',
  'utf8'
);

const objetoPublicado = new Objeto({
  id: 1,
  reporteId: 11,
  titulo: '<img src=x onerror=alert(1)>',
  categoria: 'Ropa',
  lugar: '<script>alert(2)</script>',
  fecha: '2026-11-10',
  imagen: '',
  estado: 'Publicado'
});

beforeEach(() => {
  document.body.innerHTML = htmlInicio;
});

describe('vista de Inicio', () => {
  it('renderiza los datos como texto y usa una imagen de respaldo', () => {
    renderTarjetas(document, [objetoPublicado]);

    expect(document.querySelector('.tarjeta__titulo').textContent)
      .toBe('<img src=x onerror=alert(1)>');
    expect(document.querySelector('#objetos-grid script, #objetos-grid img[src="x"]'))
      .toBeNull();
    expect(document.querySelector('.tarjeta__meta-item').textContent)
      .toBe('<script>alert(2)</script>');
    expect(document.querySelector('.tarjeta__img').src)
      .toContain('photo-1494526585095-c41746248156');
  });

  it('muestra el estado vacío cuando no hay objetos', () => {
    renderTarjetas(document, []);

    const aviso = document.getElementById('objetos-empty');
    expect(aviso.hidden).toBe(false);
    expect(aviso.textContent.trim()).toBe('No se encontraron objetos con ese criterio.');
  });

  it('dibuja categorías únicas y marca la selección accesiblemente', () => {
    renderFiltros(document, [
      objetoPublicado,
      new Objeto({ ...objetoPublicado, id: 2, categoria: 'Documentos' }),
      new Objeto({ ...objetoPublicado, id: 3, categoria: 'Ropa' })
    ], 'Documentos');

    const botones = [...document.querySelectorAll('#filtros-lista button')];
    expect(botones.map(boton => boton.dataset.categoria))
      .toEqual(['Todos', 'Ropa', 'Documentos']);
    expect(botones.map(boton => boton.getAttribute('aria-pressed')))
      .toEqual(['false', 'false', 'true']);
  });
});
