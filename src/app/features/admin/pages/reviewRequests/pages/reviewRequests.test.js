/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { iniciarPanel } from './reviewRequestsPresenter.js';

const rutaHtml = 'src/app/features/admin/pages/reviewRequests/pages/reviewRequests.html';
let navegar;
let avisar;
let autenticacion;
let apiReportes;
let apiSolicitudes;

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
  apiSolicitudes = {
    listarPendientes: jest.fn().mockResolvedValue([])
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

    await iniciarPanel(document, acciones(), autenticacion, apiReportes, apiSolicitudes);

    expect(document.getElementById('panel-contenido').hidden).toBe(false);
    expect(apiReportes.listarPendientes).toHaveBeenCalledTimes(1);
    expect(document.getElementById('resumen-reportes').textContent).toBe('0 reportes pendientes');
  });

  it('redirige cuando backend rechaza el acceso', async () => {
    autenticacion.obtenerSesionAdministrador.mockRejectedValue(new Error('No tienes permisos.'));

    await iniciarPanel(document, acciones(), autenticacion, apiReportes, apiSolicitudes);

    expect(avisar).toHaveBeenCalledWith('No tienes permisos.');
    expect(navegar).toHaveBeenCalledTimes(1);
    expect(document.getElementById('panel-contenido').hidden).toBe(true);
    expect(apiReportes.listarPendientes).not.toHaveBeenCalled();
  });

  it('abre el detalle desde el reporte y permite cerrar la sesión backend', async () => {
    autenticacion.obtenerSesionAdministrador.mockResolvedValue(administrador);
    apiReportes.listarPendientes.mockResolvedValue([{
      ...reportePendiente,
      detallePrivado: 'Marca secreta',
      descripcion: 'Descripción que no debe mostrarse en la lista.'
    }]);

    await iniciarPanel(document, acciones(), autenticacion, apiReportes, apiSolicitudes);

    expect(document.querySelector('.administracion__reporte-contenido h2').textContent)
      .toBe('Mochila negra');
    expect(document.querySelector('.administracion__estado').textContent).toBe('En revisión');
    expect(document.getElementById('resumen-reportes').textContent).toBe('1 reporte pendiente');
    expect(document.querySelector('#reportes-pendientes button')).toBeNull();
    expect(document.getElementById('reportes-pendientes').textContent)
      .not.toContain('Marca secreta');
    expect(document.getElementById('reportes-pendientes').textContent)
      .not.toContain('Descripción que no debe mostrarse');
    expect(document.querySelector('#reportes-pendientes a').getAttribute('href'))
      .toBe('../../viewDetailsObject/pages/viewDetailsObject.html?id=7');

    document.getElementById('cerrar-sesion').click();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(autenticacion.cerrarSesion).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledTimes(1);
  });

  it('cambia entre filtros y carga los reportes o solicitudes correspondientes', async () => {
    autenticacion.obtenerSesionAdministrador.mockResolvedValue(administrador);
    apiReportes.listarPendientes.mockResolvedValue([reportePendiente]);
    apiSolicitudes.listarPendientes.mockResolvedValue([{
      id: 12,
      reporteId: 5,
      titulo: 'Botella térmica',
      categoria: 'Accesorios',
      solicitante: 'Camila Rojas',
      lugarEstimado: 'Auditorio',
      fechaEstimada: '2026-10-11',
      caracteristicaPrivada: 'Tiene una marca en la tapa.'
    }]);

    await iniciarPanel(document, acciones(), autenticacion, apiReportes, apiSolicitudes);

    expect(apiReportes.listarPendientes).toHaveBeenCalledTimes(1);
    expect(apiSolicitudes.listarPendientes).toHaveBeenCalledTimes(1);
    expect(document.getElementById('filtro-reportes').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('#reportes-pendientes h2').textContent).toBe('Mochila negra');
    expect(document.getElementById('filtro-reportes').textContent).toContain('(1)');
    expect(document.getElementById('filtro-recuperaciones').textContent).toContain('(1)');

    document.getElementById('filtro-recuperaciones').click();

    expect(document.getElementById('filtro-recuperaciones').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('#reportes-pendientes h2').textContent).toBe('Botella térmica');
    expect(document.getElementById('reportes-pendientes').textContent)
      .not.toContain('Tiene una marca en la tapa.');
    expect(document.querySelector('#reportes-pendientes a').getAttribute('href'))
      .toBe('../../viewRequestDetails/pages/viewRequestDetails.html?id=12');

    document.getElementById('filtro-reportes').click();

    expect(document.getElementById('filtro-reportes').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('#reportes-pendientes h2').textContent).toBe('Mochila negra');
  });
});
