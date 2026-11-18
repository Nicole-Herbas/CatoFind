/** @jest-environment jsdom */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { iniciarViewDetailsObject } from './viewDetailsObjectPresenter.js';

const rutaHtml = 'src/app/features/admin/pages/viewDetailsObject/pages/viewDetailsObject.html';
const reporte = {
  id: 7,
  titulo: 'Mochila negra',
  categoria: 'Accesorios',
  descripcion: 'Mochila encontrada junto a la entrada.',
  lugar: 'Biblioteca',
  fecha: '2026-11-10',
  hora: '10:30',
  estado: 'PENDIENTE',
  reportante: 'Ana Torres',
  detallePrivado: 'Tiene una costura roja.',
  imagen: 'https://storage.test/mochila.jpg'
};

beforeEach(() => {
  document.body.innerHTML = readFileSync(rutaHtml, 'utf8');
});

describe('Detalle administrativo de reporte', () => {
  it('carga y muestra el reporte conectado sin datos de contacto del usuario', async () => {
    const apiReportes = {
      obtenerDetallePendiente: jest.fn().mockResolvedValue(reporte),
      actualizarEstado: jest.fn()
    };

    await iniciarViewDetailsObject(document, apiReportes, '?id=7');

    expect(apiReportes.obtenerDetallePendiente).toHaveBeenCalledWith('7');
    expect(document.getElementById('detalle-contenido').hidden).toBe(false);
    expect(document.getElementById('objeto-titulo').textContent).toBe('Mochila negra');
    expect(document.getElementById('objeto-estado').textContent).toBe('En revisión');
    expect(document.getElementById('objeto-categoria').textContent).toBe('Accesorios');
    expect(document.getElementById('objeto-lugar').textContent).toBe('Biblioteca');
    expect(document.getElementById('objeto-fecha').textContent).toContain('noviembre');
    expect(document.getElementById('objeto-hora').textContent).toBe('10:30');
    expect(document.getElementById('objeto-descripcion').textContent)
      .toBe('Mochila encontrada junto a la entrada.');
    expect(document.getElementById('reportante-nombre').textContent).toBe('Ana Torres');
    expect(document.getElementById('detalle-privado').textContent)
      .toBe('Tiene una costura roja.');
    expect(document.getElementById('objeto-imagen').getAttribute('src'))
      .toBe('https://storage.test/mochila.jpg');
    expect(document.getElementById('aprobar-reporte').textContent).toBe('Aprobar y publicar');
    expect(document.getElementById('rechazar-reporte').textContent).toBe('Rechazar');
    expect(document.body.textContent).not.toMatch(/solicitar más información/i);
    expect(document.body.textContent).not.toMatch(/@|correo|verificado/i);
  });

  it.each([
    ['aprobar-reporte', 'APROBADO', 'Publicado', 'Reporte #7 aprobado y publicado.'],
    ['rechazar-reporte', 'RECHAZADO', 'Rechazado', 'Reporte #7 rechazado.']
  ])('permite ejecutar la acción %s', async (botonId, estado, etiqueta, mensaje) => {
    const apiReportes = {
      obtenerDetallePendiente: jest.fn().mockResolvedValue(reporte),
      actualizarEstado: jest.fn().mockResolvedValue({ id: 7, estado })
    };

    await iniciarViewDetailsObject(document, apiReportes, '?id=7');
    document.getElementById(botonId).click();
    await new Promise(resolve => globalThis.setTimeout(resolve, 0));

    expect(apiReportes.actualizarEstado).toHaveBeenCalledWith('7', estado);
    expect(document.getElementById('objeto-estado').textContent).toBe(etiqueta);
    expect(document.getElementById('revision-acciones').hidden).toBe(true);
    expect(document.getElementById('revision-mensaje').textContent).toBe(mensaje);
    expect(document.getElementById('revision-mensaje').hidden).toBe(false);
  });

  it('conserva las acciones habilitadas y comunica el error si falla la revisión', async () => {
    const apiReportes = {
      obtenerDetallePendiente: jest.fn().mockResolvedValue(reporte),
      actualizarEstado: jest.fn().mockRejectedValue(new Error('El reporte ya fue revisado.'))
    };

    await iniciarViewDetailsObject(document, apiReportes, '?id=7');
    document.getElementById('rechazar-reporte').click();
    await new Promise(resolve => globalThis.setTimeout(resolve, 0));

    expect(document.getElementById('revision-acciones').hidden).toBe(false);
    expect(document.getElementById('aprobar-reporte').disabled).toBe(false);
    expect(document.getElementById('rechazar-reporte').disabled).toBe(false);
    expect(document.getElementById('revision-mensaje').textContent)
      .toBe('El reporte ya fue revisado.');
  });

  it('muestra un error y no consulta la API cuando no hay ID en la ruta', async () => {
    const apiReportes = {
      obtenerDetallePendiente: jest.fn()
    };

    await iniciarViewDetailsObject(document, apiReportes, '');

    expect(apiReportes.obtenerDetallePendiente).not.toHaveBeenCalled();
    expect(document.getElementById('detalle-error').hidden).toBe(false);
    expect(document.getElementById('detalle-contenido').hidden).toBe(true);
  });
});
