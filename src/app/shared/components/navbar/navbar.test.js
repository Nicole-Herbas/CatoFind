/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';
import { iniciarNavbar } from './navbar.js';

describe('navbar compartido', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="shared-navbar" data-pagina="inicio"></div>';
  });

  it('muestra la identidad y enlaza avatar y nombre con el perfil estudiantil', async () => {
    const autenticacion = {
      obtenerSesion: jest.fn().mockResolvedValue({
        nombre: 'Nicole Herbas',
        correo: 'nicole@ucb.edu.bo',
        rol: 'ESTUDIANTE'
      }),
      cerrarSesion: jest.fn()
    };

    await iniciarNavbar(document, autenticacion, jest.fn());

    const enlacePerfil = document.querySelector('.app-navbar__perfil');
    expect(enlacePerfil.getAttribute('href')).toBe(
      '/src/app/features/perfil/pages/perfil/perfil.html'
    );
    expect(enlacePerfil.textContent).toContain('NH');
    expect(enlacePerfil.textContent).toContain('Nicole Herbas');
    expect(document.querySelector('.app-navbar__link[aria-current="page"]')
      .textContent).toBe('Inicio');
  });

  it('marca como activa la sección correspondiente a la página actual', async () => {
    document.getElementById('shared-navbar').dataset.pagina = 'reportar';
    const autenticacion = {
      obtenerSesion: jest.fn().mockResolvedValue({
        nombre: 'Nicole Herbas',
        rol: 'ESTUDIANTE'
      }),
      cerrarSesion: jest.fn()
    };

    await iniciarNavbar(document, autenticacion, jest.fn());

    expect(document.querySelector('.app-navbar__link[aria-current="page"]')
      .textContent).toBe('Reportar');
  });

  it('redirige al login cuando no existe una sesión', async () => {
    const navegar = jest.fn();
    const autenticacion = {
      obtenerSesion: jest.fn().mockResolvedValue(null),
      cerrarSesion: jest.fn()
    };

    await iniciarNavbar(document, autenticacion, navegar);

    expect(navegar).toHaveBeenCalledWith(
      '/src/app/features/auth/pages/login/login.html'
    );
    expect(document.querySelector('.app-navbar__perfil')).toBeNull();
  });

  it('cierra la sesión y vuelve al login desde el botón compartido', async () => {
    const navegar = jest.fn();
    const autenticacion = {
      obtenerSesion: jest.fn().mockResolvedValue({
        nombre: 'Nicole Herbas',
        rol: 'ESTUDIANTE'
      }),
      cerrarSesion: jest.fn().mockResolvedValue()
    };

    await iniciarNavbar(document, autenticacion, navegar);
    document.getElementById('btn-logout').click();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(autenticacion.cerrarSesion).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledWith(
      '/src/app/features/auth/pages/login/login.html'
    );
  });

  it('muestra la navegación administrativa y no ofrece el perfil estudiantil', async () => {
    document.getElementById('shared-navbar').dataset.rol = 'ADMIN';
    const autenticacion = {
      obtenerSesion: jest.fn().mockResolvedValue({
        nombre: 'Administradora',
        rol: 'ADMIN'
      }),
      cerrarSesion: jest.fn()
    };

    await iniciarNavbar(document, autenticacion, jest.fn());

    expect(document.querySelector('.app-navbar__perfil').tagName).toBe('DIV');
    expect(document.querySelector('.app-navbar__perfil').hasAttribute('href')).toBe(false);
    expect(document.querySelector('.app-navbar__link').textContent).toBe('Panel');
    expect(document.querySelector('.app-navbar__nombre').textContent).toBe('Administradora');
  });

  it('usa la misma barra en todas las páginas autenticadas y la excluye de login y registro', () => {
    const paginas = [
      ['src/app/features/inicio/pages/inicio/inicio.html', 'inicio', 'ESTUDIANTE'],
      ['src/app/features/buscar/pages/buscar/buscar.html', 'buscar', 'ESTUDIANTE'],
      ['src/app/features/reportar/pages/reportar/reportar.html', 'reportar', 'ESTUDIANTE'],
      ['src/app/features/recoveryRequest/pages/recoveryRequest.html', 'recoveryRequest', 'ESTUDIANTE'],
      ['src/app/features/admin/pages/panel/panel.html', 'panel', 'ADMIN'],
      ['src/app/features/reviewRecoveryRequest/pages/reviewRecoveryRequest.html', 'solicitudes', 'ADMIN'],
      ['src/app/features/perfil/pages/perfil/perfil.html', 'perfil', 'ESTUDIANTE']
    ];

    paginas.forEach(([ruta, pagina, rol]) => {
      const html = readFileSync(ruta, 'utf8');
      const documento = new globalThis.DOMParser().parseFromString(html, 'text/html');
      expect(documento.getElementById('shared-navbar').dataset).toMatchObject({
        pagina,
        rol
      });
      expect(documento.querySelector('link[href*="navbar.css"]')).not.toBeNull();
      expect(documento.querySelector('script[src*="navbar.js"]')).not.toBeNull();
    });

    [
      'src/app/features/auth/pages/login/login.html',
      'src/app/features/auth/pages/registro/registro.html'
    ].forEach(ruta => {
      const html = readFileSync(ruta, 'utf8');
      expect(html).not.toContain('id="shared-navbar"');
    });
  });
});
