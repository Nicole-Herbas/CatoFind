/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { iniciarPanel } from './reviewRequestsPresenter.js';

const rutaHtml = 'src/app/features/admin/pages/reviewRequests/pages/reviewRequests.html';
let navegar;
let avisar;
let autenticacion;
let apiReportes;

const administrador = { nombre: 'Administradora' };
const reportePendiente = {
  id: 7,
  titulo: 'Mochila negra',
  categoria: 'Accesorios',
  lugar: 'Biblioteca',
  fecha: '2026-11-10',
  hora: '10:30',
  descripcion: 'Mochila negra con cuadernos.'
};

beforeEach(() => {
  document.body.innerHTML = readFileSync(rutaHtml, 'utf8');
  navegar = jest.fn();
  avisar = jest.fn();
  autenticacion = {
    obtenerSesionAdministrador: jest.fn(),
    cerrarSesion: jest.fn()
  };
  apiReportes = {
    listarPendientes: jest.fn().mockResolvedValue([]),
    actualizarEstado: jest.fn()
  };
});

const acciones = () => ({ irAlLogin: navegar, avisar });

describe('Solicitudes administrativas', () => {
  it('muestra la marca, el título administrativo y el enlace de recuperación en el encabezado', () => {
    expect(document.querySelector('.administracion__logo').textContent).toContain('CATO');
    expect(document.querySelector('.administracion__titulo').textContent)
      .toBe('Panel Administrativo');
    expect(document.querySelector('.administracion__barra a').textContent)
      .toBe('Solicitudes de recuperación');
    expect(document.querySelector('input[type="search"]')).toBeNull();
  });

  it('muestra el panel con el perfil autorizado por backend', async () => {
    autenticacion.obtenerSesionAdministrador.mockResolvedValue(administrador);

    await iniciarPanel(document, acciones(), autenticacion, apiReportes);

    expect(document.getElementById('panel-contenido').hidden).toBe(false);
    expect(apiReportes.listarPendientes).toHaveBeenCalledTimes(1);
    expect(document.getElementById('resumen-reportes').textContent).toBe('0 reportes pendientes');
  });

  it('redirige cuando backend rechaza el acceso', async () => {
    autenticacion.obtenerSesionAdministrador.mockRejectedValue(new Error('No tienes permisos.'));

    await iniciarPanel(document, acciones(), autenticacion, apiReportes);

    expect(avisar).toHaveBeenCalledWith('No tienes permisos.');
    expect(navegar).toHaveBeenCalledTimes(1);
    expect(document.getElementById('panel-contenido').hidden).toBe(true);
    expect(apiReportes.listarPendientes).not.toHaveBeenCalled();
  });

  it('permite aprobar reportes y cerrar la sesión backend', async () => {
    autenticacion.obtenerSesionAdministrador.mockResolvedValue(administrador);
    apiReportes.listarPendientes
      .mockResolvedValueOnce([reportePendiente])
      .mockResolvedValueOnce([]);
    apiReportes.actualizarEstado.mockResolvedValue({ id: 7, estado: 'APROBADO' });

    await iniciarPanel(document, acciones(), autenticacion, apiReportes);

    expect(document.querySelector('.administracion__reporte-contenido h2').textContent)
      .toBe('Mochila negra');
    expect(document.querySelector('.administracion__estado').textContent).toBe('En revisión');
    expect(document.getElementById('resumen-reportes').textContent).toBe('1 reporte pendiente');

    document.querySelector('button[data-accion="aprobar"]').click();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(apiReportes.actualizarEstado).toHaveBeenCalledWith('7', 'APROBADO');
    expect(document.getElementById('reportes-pendientes').textContent)
      .toContain('No hay reportes pendientes');

    document.getElementById('cerrar-sesion').click();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(autenticacion.cerrarSesion).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledTimes(1);
  });
});
