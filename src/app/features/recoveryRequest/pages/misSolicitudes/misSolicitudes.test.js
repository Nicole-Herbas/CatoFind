/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { presentarSolicitudes } from './misSolicitudes.js';
import { iniciarMisSolicitudes } from './misSolicitudesPresenter.js';

const rutaHtml = 'src/app/features/recoveryRequest/pages/misSolicitudes/misSolicitudes.html';

describe('presentación de mis solicitudes', () => {
  it('presenta objeto, fecha y los cuatro estados visibles', () => {
    const solicitudes = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'ENTREGADA'].map(
      (estado, indice) => ({
        id: indice + 1,
        nombreObjeto: 'Mochila negra',
        fechaSolicitud: '2026-11-18T00:00:00.000Z',
        estado,
        motivoRechazo: estado === 'RECHAZADA' ? 'El nombre no coincide.' : null
      })
    );

    expect(presentarSolicitudes(solicitudes)).toEqual([
      { id: 1, nombreObjeto: 'Mochila negra', fechaSolicitud: '18/11/2026', estado: 'Pendiente', detalle: '' },
      {
        id: 2,
        nombreObjeto: 'Mochila negra',
        fechaSolicitud: '18/11/2026',
        estado: 'Aprobada',
        detalle: 'Recoge el objeto en Bienestar Estudiantil'
      },
      {
        id: 3,
        nombreObjeto: 'Mochila negra',
        fechaSolicitud: '18/11/2026',
        estado: 'Rechazada',
        detalle: 'El nombre no coincide.'
      },
      { id: 4, nombreObjeto: 'Mochila negra', fechaSolicitud: '18/11/2026', estado: 'Entregada', detalle: '' }
    ]);
  });

  it('devuelve una lista vacía sin inventar solicitudes', () => {
    expect(presentarSolicitudes([])).toEqual([]);
  });
});

describe('página Mis solicitudes', () => {
  beforeEach(() => {
    document.body.innerHTML = readFileSync(rutaHtml, 'utf8');
  });

  it('contiene la navegación estudiantil y la vista con carga accesible', () => {
    const pagina = new globalThis.DOMParser().parseFromString(
      readFileSync(rutaHtml, 'utf8'),
      'text/html'
    );

    expect(pagina.getElementById('shared-navbar').dataset).toMatchObject({
      pagina: 'solicitudes',
      rol: 'ESTUDIANTE'
    });
    expect(pagina.querySelector('h1').textContent).toBe('Mis solicitudes de recuperación');
    expect(pagina.querySelector('#estado-solicitudes[role="status"]')).not.toBeNull();
    expect(pagina.getElementById('lista-solicitudes').tagName).toBe('UL');
    expect(pagina.querySelector('script[src="./misSolicitudesPresenter.js"]')).not.toBeNull();
  });

  it('distingue una lista vacía de un error de carga', async () => {
    await iniciarMisSolicitudes(document, {
      listarMisSolicitudes: jest.fn().mockResolvedValue([])
    });

    expect(document.getElementById('estado-solicitudes').textContent)
      .toBe('No tienes solicitudes de recuperación.');
    expect(document.getElementById('lista-solicitudes').hidden).toBe(true);

    document.body.innerHTML = readFileSync(rutaHtml, 'utf8');
    await iniciarMisSolicitudes(document, {
      listarMisSolicitudes: jest.fn().mockRejectedValue(new Error('sesión expirada'))
    });

    expect(document.getElementById('estado-solicitudes').textContent)
      .toBe('No se pudieron cargar tus solicitudes. Intenta nuevamente.');
    expect(document.getElementById('estado-solicitudes').dataset.tipo).toBe('error');
    expect(document.getElementById('lista-solicitudes').hidden).toBe(true);
  });

  it('renderiza el motivo real de rechazo y las indicaciones de aprobación', async () => {
    await iniciarMisSolicitudes(document, {
      listarMisSolicitudes: jest.fn().mockResolvedValue([
        {
          id: 31, nombreObjeto: 'Mochila negra', fechaSolicitud: '2026-11-18T00:00:00.000Z',
          estado: 'RECHAZADA', motivoRechazo: 'El nombre no coincide.'
        },
        {
          id: 32, nombreObjeto: 'Cuaderno azul', fechaSolicitud: '2026-11-17T00:00:00.000Z',
          estado: 'APROBADA', motivoRechazo: null
        }
      ])
    });

    const tarjetas = [...document.querySelectorAll('#lista-solicitudes li')];
    expect(tarjetas).toHaveLength(2);
    expect(tarjetas[0].textContent).toContain('Mochila negra');
    expect(tarjetas[0].textContent).toContain('18/11/2026');
    expect(tarjetas[0].textContent).toContain('Rechazada');
    expect(tarjetas[0].textContent).toContain('El nombre no coincide.');
    expect(tarjetas[1].textContent).toContain('Aprobada');
    expect(tarjetas[1].textContent).toContain('Recoge el objeto en Bienestar Estudiantil');
  });
});
