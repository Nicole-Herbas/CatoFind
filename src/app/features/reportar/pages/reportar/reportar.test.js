/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { iniciarFormularioReporte } from './reportarPresenter.js';
import { validarInformacion } from './reportar.js';

const rutaHtml = 'src/app/features/reportar/pages/reportar/reportar.html';
const fechaActual = new Date(2026, 10, 12, 12);
const imagenProcesada = 'data:image/jpeg;base64,Zm90bw==';
let apiReportes;

beforeEach(() => {
  document.body.innerHTML = readFileSync(rutaHtml, 'utf8');
  apiReportes = {
    obtenerOpciones: jest.fn().mockResolvedValue({
      categorias: ['Accesorios'],
      lugares: ['Biblioteca']
    }),
    crear: jest.fn().mockResolvedValue({ id: 21, estado: 'PENDIENTE' })
  };
});

describe('navegación principal de reportes', () => {
  const pagina = new DOMParser().parseFromString(
    readFileSync(rutaHtml, 'utf8'),
    'text/html'
  );

  it('mantiene todos los enlaces de navegación principal', () => {
    const enlaces = [...pagina.querySelectorAll('.navbar nav a')]
      .map(enlace => [enlace.textContent.trim(), enlace.getAttribute('href')]);

    expect(enlaces).toEqual([
      ['Inicio', '../../../inicio/pages/inicio/inicio.html'],
      ['Buscar', '../../../buscar/pages/buscar/buscar.html'],
      ['Reportar objeto', './reportar.html'],
      ['Solicitar recuperación', '../../../buscar/pages/buscar/buscar.html'],
      ['Mis reportes', '#']
    ]);
  });

  it('marca Reportar objeto como la página activa', () => {
    const enlaceActivo = pagina.querySelector('.navbar nav a.navbar__activo');

    expect(enlaceActivo.textContent.trim()).toBe('Reportar objeto');
    expect(enlaceActivo.getAttribute('aria-current')).toBe('page');
  });
});

describe('formulario de reportes', () => {
  it('valida los datos requeridos antes de enviar al backend', () => {
    const validacion = validarInformacion({
      categoria: 'Accesorios',
      titulo: 'Mochila negra',
      lugar: 'Biblioteca',
      fecha: '2026-11-10',
      hora: '10:30',
      descripcion: 'Mochila encontrada junto a la entrada.'
    }, fechaActual);

    expect(validacion).toEqual({ valido: true, errores: {} });
  });

  it('carga las opciones del backend, envía el reporte y muestra confirmación', async () => {
    await iniciarFormularioReporte(document, apiReportes, {
      procesarImagen: jest.fn().mockResolvedValue(imagenProcesada),
      ahora: () => fechaActual
    });

    expect(apiReportes.obtenerOpciones).toHaveBeenCalledTimes(1);
    expect(document.querySelector('#categoria option[value="Accesorios"]')).not.toBeNull();

    document.getElementById('categoria').value = 'Accesorios';
    document.getElementById('titulo').value = 'Mochila negra';
    document.getElementById('lugar').value = 'Biblioteca';
    document.getElementById('fecha').value = '2026-11-10';
    document.getElementById('hora').value = '10:30';
    document.getElementById('descripcion').value = 'Mochila encontrada junto a la entrada.';
    document.getElementById('detallePrivado').value = 'Tiene una costura roja.';

    document.getElementById('siguiente-informacion').click();
    const archivo = document.getElementById('foto-archivo');
    Object.defineProperty(archivo, 'files', {
      configurable: true,
      value: [{ type: 'image/jpeg', size: 100 }]
    });
    archivo.dispatchEvent(new Event('change'));
    await new Promise(resolve => setTimeout(resolve, 0));
    document.getElementById('siguiente-foto').click();
    document.getElementById('form-reportar').dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    }));
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(apiReportes.crear).toHaveBeenCalledWith({
      categoria: 'Accesorios',
      titulo: 'Mochila negra',
      lugar: 'Biblioteca',
      fecha: '2026-11-10',
      hora: '10:30',
      descripcion: 'Mochila encontrada junto a la entrada.',
      detallePrivado: 'Tiene una costura roja.',
      imagen: imagenProcesada
    });
    expect(document.getElementById('estado-reporte').textContent)
      .toContain('Reporte #21 enviado correctamente.');
  });

  it('muestra el error del backend sin guardar el reporte localmente', async () => {
    apiReportes.crear.mockRejectedValue(new Error('Debes iniciar sesión.'));
    await iniciarFormularioReporte(document, apiReportes, {
      procesarImagen: jest.fn().mockResolvedValue(imagenProcesada),
      ahora: () => fechaActual
    });

    document.getElementById('categoria').value = 'Accesorios';
    document.getElementById('titulo').value = 'Mochila negra';
    document.getElementById('lugar').value = 'Biblioteca';
    document.getElementById('fecha').value = '2026-11-10';
    document.getElementById('hora').value = '10:30';
    document.getElementById('descripcion').value = 'Mochila encontrada junto a la entrada.';
    document.getElementById('siguiente-informacion').click();
    const archivo = document.getElementById('foto-archivo');
    Object.defineProperty(archivo, 'files', {
      configurable: true,
      value: [{ type: 'image/jpeg', size: 100 }]
    });
    archivo.dispatchEvent(new Event('change'));
    await new Promise(resolve => setTimeout(resolve, 0));
    document.getElementById('siguiente-foto').click();
    document.getElementById('form-reportar').dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    }));
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(document.getElementById('estado-reporte').textContent)
      .toContain('Debes iniciar sesión.');
    expect(apiReportes.crear).toHaveBeenCalledTimes(1);
  });
});
