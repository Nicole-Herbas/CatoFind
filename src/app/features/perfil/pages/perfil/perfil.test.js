/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { iniciarPerfil } from './perfilPresenter.js';

const htmlPerfil = readFileSync(
  'src/app/features/perfil/pages/perfil/perfil.html',
  'utf8'
);
const perfilInicial = {
  nombre: 'Nicole Herbas',
  correo: 'nicole@ucb.edu.bo',
  carrera: 'Ingeniería de Software'
};

describe('página de perfil', () => {
  beforeEach(() => {
    document.body.innerHTML = htmlPerfil;
  });

  it('muestra nombre, correo de solo lectura y carrera del estudiante', async () => {
    const autenticacion = {
      obtenerPerfil: jest.fn().mockResolvedValue(perfilInicial),
      actualizarPerfil: jest.fn()
    };

    await iniciarPerfil(document, autenticacion, jest.fn());

    expect(document.getElementById('perfil-nombre').textContent)
      .toBe('Nicole Herbas');
    expect(document.getElementById('perfil-correo').textContent)
      .toBe('nicole@ucb.edu.bo');
    expect(document.getElementById('perfil-carrera').textContent)
      .toBe('Ingeniería de Software');
    expect(document.getElementById('editar-correo').disabled).toBe(true);
  });

  it('guarda nombre y carrera y actualiza la vista con la respuesta persistida', async () => {
    const actualizado = {
      nombre: 'Nicole H.',
      correo: 'nicole@ucb.edu.bo',
      carrera: 'Informática'
    };
    const autenticacion = {
      obtenerPerfil: jest.fn().mockResolvedValue(perfilInicial),
      actualizarPerfil: jest.fn().mockResolvedValue(actualizado)
    };

    await iniciarPerfil(document, autenticacion, jest.fn());
    document.getElementById('btn-editar-perfil').click();
    document.getElementById('editar-nombre').value = 'Nicole H.';
    document.getElementById('editar-carrera').value = 'Informática';
    document.getElementById('form-perfil').dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    }));
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(autenticacion.actualizarPerfil).toHaveBeenCalledWith({
      nombre: 'Nicole H.',
      carrera: 'Informática'
    });
    expect(document.getElementById('perfil-nombre').textContent).toBe('Nicole H.');
    expect(document.getElementById('perfil-carrera').textContent).toBe('Informática');
    expect(document.getElementById('mensaje-perfil').textContent)
      .toBe('Perfil actualizado correctamente.');
  });

  it('redirige al login si no hay sesión y muestra error si falla la lectura', async () => {
    const navegar = jest.fn();
    const autenticacion = {
      obtenerPerfil: jest.fn().mockRejectedValue(Object.assign(
        new Error('Debes iniciar sesión.'),
        { status: 401 }
      )),
      actualizarPerfil: jest.fn()
    };

    await iniciarPerfil(document, autenticacion, navegar);

    expect(navegar).toHaveBeenCalledWith(
      '/src/app/features/auth/pages/login/login.html'
    );
    expect(document.getElementById('mensaje-perfil').textContent)
      .toBe('Debes iniciar sesión.');
  });
});
