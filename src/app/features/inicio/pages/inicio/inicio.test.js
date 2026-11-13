/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';

const htmlInicio = readFileSync('src/app/features/inicio/pages/inicio/inicio.html', 'utf8');
const objetoRopa = {
  id: 1, reporteId: 11, titulo: '<img src=x onerror=alert(1)>', categoria: 'Ropa',
  lugar: '<script>alert(2)</script>', fecha: '2026-11-10', imagen: 'https://foto.test/ropa.jpg',
  estado: 'Publicado'
};
const objetoDocumentos = {
  id: 2, reporteId: 12, titulo: 'Cuaderno', categoria: 'Documentos', lugar: 'Biblioteca',
  fecha: '2026-11-09', imagen: 'https://foto.test/cuaderno.jpg', estado: 'Publicado'
};

async function abrirInicio(fetchObjetos) {
  document.body.innerHTML = htmlInicio;
  global.fetch = jest.fn(fetchObjetos);
  jest.resetModules();
  await import('./inicio.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
  await new Promise(resolve => setTimeout(resolve, 0));
}

function titulosInicio() {
  return [...document.querySelectorAll('#objetos-grid .tarjeta__titulo')]
    .map(elemento => elemento.textContent);
}

describe('Inicio conectado al catálogo', () => {
  it('renderiza contenido del reporte como texto y conserva la imagen de respaldo', async () => {
    await abrirInicio(async () => ({ ok: true, json: async () => [objetoRopa] }));

    expect(titulosInicio()).toEqual(['<img src=x onerror=alert(1)>']);
    expect(document.querySelector('#objetos-grid script, #objetos-grid img[src="x"]')).toBeNull();
    const imagen = document.querySelector('#objetos-grid img');
    expect(imagen.alt).toBe('<img src=x onerror=alert(1)>');
    imagen.dispatchEvent(new Event('error'));
    expect(imagen.src).toContain('photo-1494526585095-c41746248156');
  });

  it('mantiene todas las categorías disponibles al filtrar tarjetas por categoría', async () => {
    await abrirInicio(async ruta => {
      const categoria = new URL(String(ruta), 'http://local').searchParams.get('categoria');
      const catalogo = [objetoRopa, objetoDocumentos];
      return { ok: true, json: async () => categoria && categoria !== 'Todos'
        ? catalogo.filter(objeto => objeto.categoria === categoria) : catalogo };
    });

    document.querySelector('[data-categoria="Ropa"]').click();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(titulosInicio()).toHaveLength(1);
    expect([...document.querySelectorAll('#filtros-lista button')]
      .map(boton => boton.dataset.categoria)).toEqual(['Todos', 'Ropa', 'Documentos']);
  });

  it('ignora una respuesta anterior si termina después de la búsqueda más reciente', async () => {
    const resoluciones = [];
    await abrirInicio(async ruta => ({ ok: true, json: async () => {
      const texto = new URL(String(ruta), 'http://local').searchParams.get('texto');
      if (!texto) return [objetoRopa, objetoDocumentos];
      return new Promise(resolve => resoluciones.push({ texto, resolve }));
    } }));

    const buscador = document.getElementById('input-buscar');
    buscador.value = 'ropa';
    buscador.dispatchEvent(new Event('input'));
    await new Promise(resolve => setTimeout(resolve, 0));
    buscador.value = 'cuaderno';
    buscador.dispatchEvent(new Event('input'));
    await new Promise(resolve => setTimeout(resolve, 0));

    resoluciones.find(item => item.texto === 'cuaderno').resolve([objetoDocumentos]);
    await new Promise(resolve => setTimeout(resolve, 0));
    resoluciones.find(item => item.texto === 'ropa').resolve([objetoRopa]);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(titulosInicio()).toEqual(['Cuaderno']);
  });
});
