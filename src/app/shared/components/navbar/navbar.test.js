/** @jest-environment jsdom */
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
});
