
/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { iniciarPanel } from './panelPresenter.js';

const RUTA_HTML =
  'src/app/features/admin/pages/panel/panel.html';

let navegar;
let avisar;

function crearSesion(usuario) {
  let datos = usuario ? JSON.stringify(usuario) : null;

  return {
    getItem: clave =>
      clave === 'catofind_sesion' ? datos : null,

    removeItem: clave => {
      if (clave === 'catofind_sesion') datos = null;
    }
  };
}

const administrador = {
  nombre: 'Administrador',
  apellido: 'Bienestar',
  correo: 'bienestar@ucb.edu.bo',
  rol: 'ADMIN'
};

beforeEach(() => {
  document.body.innerHTML = readFileSync(RUTA_HTML, 'utf8');
  navegar = jest.fn();
  avisar = jest.fn();
});

function abrirPanel(sesion) {
  return iniciarPanel(document, sesion, {
    irAlLogin: navegar,
    avisar
  });
}

describe('Panel administrativo HU-02', () => {

  it('debe mostrar el panel al administrador', () => {
    abrirPanel(crearSesion(administrador));

    expect(document.getElementById('panel-contenido').hidden)
      .toBe(false);
    expect(document.getElementById('nombre-admin').textContent)
      .toBe('Administrador');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('debe avisar y redirigir al estudiante', () => {
    abrirPanel(crearSesion({
      nombre: 'Jose',
      correo: 'estudiante@ucb.edu.bo',
      rol: 'ESTUDIANTE'
    }));

    expect(avisar).toHaveBeenCalledWith(
      'No tienes permisos para acceder al panel administrativo.'
    );
    expect(navegar).toHaveBeenCalledTimes(1);
    expect(document.getElementById('panel-contenido').hidden)
      .toBe(true);
  });

  it('debe rechazar usuarios sin sesion', () => {
    abrirPanel(crearSesion(null));

    expect(avisar).toHaveBeenCalledWith(
      'Debes iniciar sesión para acceder al panel administrativo.'
    );
    expect(navegar).toHaveBeenCalledTimes(1);
  });

  it('debe permitir cerrar sesion', () => {
    const sesion = crearSesion(administrador);

    abrirPanel(sesion);

    document.getElementById('cerrar-sesion').click();

    expect(sesion.getItem('catofind_sesion')).toBeNull();
    expect(navegar).toHaveBeenCalledTimes(1);
  });

});
