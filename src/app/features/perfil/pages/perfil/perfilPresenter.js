import { crearRepositorioUsuarios } from '../../../../api/repositorios/usuarios.js';

const RUTA_LOGIN = '/src/app/features/auth/pages/login/login.html';

function iniciales(nombre) {
  return String(nombre).trim().split(/\s+/).slice(0, 2)
    .map(palabra => palabra.charAt(0))
    .join('')
    .toUpperCase();
}

function mostrarPerfil(documento, perfil) {
  documento.getElementById('perfil-nombre').textContent = perfil.nombre;
  documento.getElementById('perfil-correo').textContent = perfil.correo;
  documento.getElementById('perfil-carrera').textContent =
    perfil.carrera || 'No especificada';
  documento.getElementById('perfil-avatar').textContent = iniciales(perfil.nombre);
  documento.getElementById('editar-nombre').value = perfil.nombre;
  documento.getElementById('editar-correo').value = perfil.correo;
  documento.getElementById('editar-carrera').value = perfil.carrera;
  documento.getElementById('perfil-contenido').hidden = false;

  const avatarNavbar = documento.querySelector('.app-navbar__avatar');
  const nombreNavbar = documento.querySelector('.app-navbar__nombre');
  if (avatarNavbar && nombreNavbar) {
    avatarNavbar.textContent = iniciales(perfil.nombre);
    nombreNavbar.textContent = perfil.nombre;
  }
}

export async function iniciarPerfil(
  documento = globalThis.document,
  autenticacion = crearRepositorioUsuarios(),
  navegar = ruta => globalThis.location.assign(ruta)
) {
  const mensaje = documento.getElementById('mensaje-perfil');
  const botonEditar = documento.getElementById('btn-editar-perfil');
  const formulario = documento.getElementById('form-perfil');
  const botonGuardar = documento.getElementById('btn-guardar-perfil');
  let perfilActual;

  try {
    perfilActual = await autenticacion.obtenerPerfil();
  } catch (error) {
    mensaje.textContent = error.message || 'No se pudo cargar el perfil.';
    if (error.status === 401) {
      navegar(RUTA_LOGIN);
    }
    return;
  }

  mostrarPerfil(documento, perfilActual);
  botonEditar.hidden = false;

  botonEditar.addEventListener('click', () => {
    mensaje.textContent = '';
    formulario.hidden = false;
    botonEditar.hidden = true;
    documento.getElementById('editar-nombre').focus();
  });

  documento.getElementById('btn-cancelar-edicion').addEventListener('click', () => {
    mostrarPerfil(documento, perfilActual);
    formulario.hidden = true;
    botonEditar.hidden = false;
    mensaje.textContent = '';
  });

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    mensaje.textContent = '';
    mensaje.classList.remove('perfil__mensaje--exito');
    botonGuardar.disabled = true;

    try {
      perfilActual = await autenticacion.actualizarPerfil({
        nombre: documento.getElementById('editar-nombre').value,
        carrera: documento.getElementById('editar-carrera').value
      });
      mostrarPerfil(documento, perfilActual);
      formulario.hidden = true;
      botonEditar.hidden = false;
      mensaje.textContent = 'Perfil actualizado correctamente.';
      mensaje.classList.add('perfil__mensaje--exito');
    } catch (error) {
      mensaje.textContent = error.message || 'No se pudo guardar el perfil.';
      if (error.status === 401) {
        navegar(RUTA_LOGIN);
      }
    } finally {
      botonGuardar.disabled = false;
    }
  });
}

if (typeof document !== 'undefined' && document.getElementById('form-perfil')) {
  iniciarPerfil();
}
