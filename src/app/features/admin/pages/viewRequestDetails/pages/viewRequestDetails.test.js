/** @jest-environment jsdom */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { iniciarViewRequestDetails } from './viewRequestDetailsPresenter.js';

const rutaHtml = 'src/app/features/admin/pages/viewRequestDetails/pages/viewRequestDetails.html';
const solicitud = {
  id: 12,
  reporteId: 7,
  estado: 'PENDIENTE',
  solicitante: 'Nicole Herbas',
  correoSolicitante: 'estudiante@ucb.edu.bo',
  lugarEstimado: 'Cafetería',
  fechaEstimada: '2026-11-14',
  caracteristicaPrivada: 'Sticker de estrella en el estuche',
  titulo: 'Audífonos blancos',
  categoria: 'Electrónica',
  descripcion: 'Estuche blanco con audífonos inalámbricos.',
  imagen: 'https://storage.test/audifonos.jpg',
  lugarReporte: 'Biblioteca',
  fechaReporte: '2026-10-02',
  horaReporte: '09:40',
  detallePrivadoReporte: 'El estuche tiene un sticker por dentro.'
};

beforeEach(() => {
  document.body.innerHTML = readFileSync(rutaHtml, 'utf8');
});

describe('Detalle administrativo de solicitud de recuperación', () => {
  it('muestra la cuenta, el objeto y la comparación de datos privados sin verificadores', async () => {
    const apiSolicitudes = {
      obtenerDetallePendiente: jest.fn().mockResolvedValue(solicitud),
      resolverPendiente: jest.fn()
    };

    await iniciarViewRequestDetails(document, apiSolicitudes, '?id=12');

    expect(apiSolicitudes.obtenerDetallePendiente).toHaveBeenCalledWith('12');
    expect(document.getElementById('solicitud-contenido').hidden).toBe(false);
    expect(document.getElementById('solicitante-nombre').textContent).toBe('Nicole Herbas');
    expect(document.getElementById('solicitante-correo').textContent)
      .toBe('estudiante@ucb.edu.bo');
    expect(document.getElementById('objeto-titulo').textContent).toBe('Audífonos blancos');
    expect(document.getElementById('respuesta-lugar').textContent).toBe('Cafetería');
    expect(document.getElementById('respuesta-fecha').textContent).toContain('noviembre');
    expect(document.getElementById('respuesta-caracteristica').textContent)
      .toBe('Sticker de estrella en el estuche');
    expect(document.getElementById('reporte-lugar').textContent).toBe('Biblioteca');
    expect(document.getElementById('reporte-detalle-privado').textContent)
      .toBe('El estuche tiene un sticker por dentro.');
    expect(document.getElementById('objeto-imagen').getAttribute('src'))
      .toBe('https://storage.test/audifonos.jpg');
    expect(document.body.textContent)
      .not.toMatch(/verificado|asistente de verificación|solicitar más información/i);
    expect(document.querySelectorAll('.solicitud-detalle__columna svg, .solicitud-detalle__alerta'))
      .toHaveLength(0);
    expect(document.getElementById('validar-propietario').textContent).toBe('Validar propietario');
    expect(document.getElementById('rechazar-solicitud').textContent).toBe('Rechazar solicitud');
  });

  it.each([
    ['validar-propietario', 'VALIDAR_PROPIETARIO',
      'Propietario validado. El objeto quedó como Recuperado'],
    ['rechazar-solicitud', 'RECHAZAR', 'Solicitud rechazada']
  ])('envía la acción %s al backend y confirma el resultado', async (botonId, accion, texto) => {
    const apiSolicitudes = {
      obtenerDetallePendiente: jest.fn().mockResolvedValue(solicitud),
      resolverPendiente: jest.fn().mockResolvedValue({ id: 12, accion })
    };

    await iniciarViewRequestDetails(document, apiSolicitudes, '?id=12');
    document.getElementById(botonId).click();
    await new Promise(resolve => globalThis.setTimeout(resolve, 0));

    expect(apiSolicitudes.resolverPendiente).toHaveBeenCalledWith('12', accion);
    expect(document.getElementById('acciones-solicitud').hidden).toBe(true);
    expect(document.getElementById('resolucion-mensaje').textContent).toBe(texto);
  });

  it('muestra errores de revisión y permite volver a intentar', async () => {
    const apiSolicitudes = {
      obtenerDetallePendiente: jest.fn().mockResolvedValue(solicitud),
      resolverPendiente: jest.fn().mockRejectedValue(new Error('La solicitud ya fue atendida.'))
    };

    await iniciarViewRequestDetails(document, apiSolicitudes, '?id=12');
    document.getElementById('rechazar-solicitud').click();
    await new Promise(resolve => globalThis.setTimeout(resolve, 0));

    expect(document.getElementById('acciones-solicitud').hidden).toBe(false);
    expect(document.getElementById('validar-propietario').disabled).toBe(false);
    expect(document.getElementById('rechazar-solicitud').disabled).toBe(false);
    expect(document.getElementById('resolucion-mensaje').textContent)
      .toBe('La solicitud ya fue atendida.');
  });

  it('muestra un error cuando no recibe ID sin consultar la API', async () => {
    const apiSolicitudes = {
      obtenerDetallePendiente: jest.fn()
    };

    await iniciarViewRequestDetails(document, apiSolicitudes, '');

    expect(apiSolicitudes.obtenerDetallePendiente).not.toHaveBeenCalled();
    expect(document.getElementById('solicitud-error').hidden).toBe(false);
    expect(document.getElementById('solicitud-contenido').hidden).toBe(true);
  });
});
