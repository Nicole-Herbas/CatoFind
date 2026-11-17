/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { iniciarPanel } from './panelPresenter.js';

const rutaHtml = 'src/app/features/admin/pages/panel/panel.html';
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

describe('Panel administrativo', () => {
  it('muestra el panel con el perfil autorizado por backend', async () => {
    autenticacion.obtenerSesionAdministrador.mockResolvedValue(administrador);

    await iniciarPanel(document, acciones(), autenticacion, apiReportes);

    expect(document.getElementById('panel-contenido').hidden).toBe(false);
    expect(document.getElementById('nombre-admin').textContent).toBe('Administradora');
  });

  it('redirige cuando backend rechaza el acceso', async () => {
    autenticacion.obtenerSesionAdministrador.mockRejectedValue(new Error('No tienes permisos.'));

    await iniciarPanel(document, acciones(), autenticacion, apiReportes);

    expect(avisar).toHaveBeenCalledWith('No tienes permisos.');
    expect(navegar).toHaveBeenCalledTimes(1);
    expect(document.getElementById('panel-contenido').hidden).toBe(true);
    expect(apiReportes.listarPendientes).not.toHaveBeenCalled();
  });

  it('permite al administrador revisar reportes y cerrar su sesión backend', async () => {
    autenticacion.obtenerSesionAdministrador.mockResolvedValue(administrador);
    apiReportes.listarPendientes
      .mockResolvedValueOnce([reportePendiente])
      .mockResolvedValueOnce([]);
    apiReportes.actualizarEstado.mockResolvedValue({ id: 7, estado: 'APROBADO' });

    await iniciarPanel(document, acciones(), autenticacion, apiReportes);

    expect(apiReportes.listarPendientes).toHaveBeenCalledTimes(1);
    expect(document.querySelector('#reportes-pendientes h3').textContent)
      .toBe('Mochila negra');

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

  it('mantiene el enlace de revisión de solicitudes de recuperación', () => {
    expect(document.querySelector('a[href*="reviewRecoveryRequest.html"]')).not.toBeNull();
  });
});
