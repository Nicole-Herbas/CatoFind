/** @jest-environment jsdom */
import { beforeEach, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { iniciarInicio } from './inicioPresenter.js';

const htmlInicio = readFileSync(
  'src/app/features/inicio/pages/inicio/inicio.html',
  'utf8'
);

const objetos = [
  {
    id: 1,
    reporteId: 11,
    titulo: 'Mochila negra',
    categoria: 'Ropa',
    lugar: 'Biblioteca',
    fecha: '2026-11-10',
    imagen: '',
    estado: 'Publicado'
  },
  {
    id: 2,
    reporteId: 12,
    titulo: 'Cuaderno',
    categoria: 'Documentos',
    lugar: 'Aula',
    fecha: '2026-11-09',
    imagen: '',
    estado: 'Publicado'
  }
];

const esperarActualizacion = () => new Promise(resolve => globalThis.setTimeout(resolve, 0));

beforeEach(() => {
  document.body.innerHTML = htmlInicio;
});

describe('presentador de Inicio', () => {
  it('carga el catálogo inicial y conecta filtros y búsqueda con el servicio', async () => {
    const servicio = {
      obtenerRecientes: jest.fn().mockResolvedValue(objetos),
      filtrar: jest.fn().mockResolvedValue([objetos[0]])
    };
    const autenticacion = { cerrarSesion: jest.fn() };

    await iniciarInicio(document, { servicio, autenticacion });

    expect(document.querySelectorAll('#objetos-grid .tarjeta')).toHaveLength(2);
    expect([...document.querySelectorAll('#filtros-lista button')]
      .map(boton => boton.dataset.categoria))
      .toEqual(['Todos', 'Ropa', 'Documentos']);

    document.querySelector('[data-categoria="Ropa"]').click();
    await esperarActualizacion();
    expect(servicio.filtrar).toHaveBeenLastCalledWith({
      categoria: 'Ropa',
      texto: ''
    });

    const busqueda = document.getElementById('input-buscar');
    busqueda.value = ' mochila ';
    busqueda.dispatchEvent(new globalThis.Event('input'));
    await esperarActualizacion();
    expect(servicio.filtrar).toHaveBeenLastCalledWith({
      categoria: 'Ropa',
      texto: 'mochila'
    });
  });

  it('muestra un error al fallar la carga inicial', async () => {
    const servicio = {
      obtenerRecientes: jest.fn().mockRejectedValue(new Error('fallo')),
      filtrar: jest.fn().mockRejectedValue(new Error('fallo'))
    };
    const autenticacion = { cerrarSesion: jest.fn() };

    await iniciarInicio(document, { servicio, autenticacion });

    const aviso = document.getElementById('objetos-empty');
    expect(aviso.hidden).toBe(false);
    expect(aviso.textContent).toBe('No se pudieron cargar los objetos.');
  });

  it('muestra un error si falla la búsqueda filtrada', async () => {
    const servicio = {
      obtenerRecientes: jest.fn().mockResolvedValue(objetos),
      filtrar: jest.fn().mockRejectedValue(new Error('fallo'))
    };
    const autenticacion = { cerrarSesion: jest.fn() };

    await iniciarInicio(document, { servicio, autenticacion });
    document.getElementById('input-buscar').dispatchEvent(new globalThis.Event('input'));
    await esperarActualizacion();

    const aviso = document.getElementById('objetos-empty');
    expect(aviso.hidden).toBe(false);
    expect(aviso.textContent).toBe('No se pudieron cargar los objetos.');
  });

  it('mantiene la navegación de búsqueda, reportar y cierre de sesión', async () => {
    const servicio = {
      obtenerRecientes: jest.fn().mockResolvedValue(objetos),
      filtrar: jest.fn().mockResolvedValue(objetos)
    };
    const autenticacion = { cerrarSesion: jest.fn().mockResolvedValue() };
    const navegar = jest.fn();

    await iniciarInicio(document, { servicio, autenticacion, navegar });

    const busqueda = document.getElementById('input-buscar');
    busqueda.value = 'mochila negra';
    document.getElementById('form-buscar').dispatchEvent(new globalThis.Event('submit', {
      bubbles: true,
      cancelable: true
    }));
    document.getElementById('btn-reportar-fab').click();
    document.getElementById('btn-logout').click();
    await esperarActualizacion();

    expect(navegar).toHaveBeenCalledWith(
      '../../../buscar/pages/buscar/buscar.html?q=mochila%20negra'
    );
    expect(navegar).toHaveBeenCalledWith(
      '../../../reportar/pages/reportar/reportar.html'
    );
    expect(autenticacion.cerrarSesion).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledWith('../../../auth/pages/login/login.html');
  });
});
