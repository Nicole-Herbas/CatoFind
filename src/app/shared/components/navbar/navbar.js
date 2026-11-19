import { AutenticacionApi } from '../../../api/autenticacion.js';

const RUTAS = {
  inicio: '/src/app/features/inicio/pages/inicio/inicio.html',
  buscar: '/src/app/features/buscar/pages/buscar/buscar.html',
  reportar: '/src/app/features/reportar/pages/reportar/reportar.html',
  reportes: '#',
  perfil: '/src/app/features/perfil/pages/perfil/perfil.html',
  panel: '/src/app/features/admin/pages/panel/panel.html',
  solicitudes: '/src/app/features/recoveryRequest/pages/misSolicitudes/misSolicitudes.html',
  revisarSolicitudes: '/src/app/features/reviewRecoveryRequest/pages/reviewRecoveryRequest.html',
  login: '/src/app/features/auth/pages/login/login.html'
};

function crearIcono(documento, ruta) {
  const icono = documento.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icono.setAttribute('viewBox', '0 0 24 24');
  icono.setAttribute('width', '20');
  icono.setAttribute('height', '20');
  icono.setAttribute('fill', 'none');
  icono.setAttribute('stroke', 'currentColor');
  icono.setAttribute('stroke-width', '2');
  icono.setAttribute('aria-hidden', 'true');

  const figura = documento.createElementNS('http://www.w3.org/2000/svg', 'path');
  figura.setAttribute('d', ruta);
  icono.appendChild(figura);
  return icono;
}

function crearEnlace(documento, texto, href, pagina, paginaActual) {
  const enlace = documento.createElement('a');
  enlace.className = 'app-navbar__link';
  enlace.textContent = texto;
  enlace.href = href;
  if (pagina === paginaActual) {
    enlace.setAttribute('aria-current', 'page');
  }
  return enlace;
}

function obtenerIniciales(nombre) {
  return nombre.trim().split(/\s+/).slice(0, 2)
    .map(palabra => palabra.charAt(0))
    .join('')
    .toUpperCase();
}

function crearIdentidad(documento, usuario) {
  const perfil = documento.createElement(usuario.rol === 'ESTUDIANTE' ? 'a' : 'div');
  perfil.className = 'app-navbar__perfil';
  if (usuario.rol === 'ESTUDIANTE') {
    perfil.href = RUTAS.perfil;
    perfil.setAttribute('aria-label', 'Abrir mi perfil');
  }

  const avatar = documento.createElement('span');
  avatar.className = 'app-navbar__avatar';
  avatar.textContent = obtenerIniciales(usuario.nombre || '');
  avatar.setAttribute('aria-hidden', 'true');

  const nombre = documento.createElement('span');
  nombre.className = 'app-navbar__nombre';
  nombre.textContent = usuario.nombre || '';
  perfil.append(avatar, nombre);
  return perfil;
}

function crearNavbar(documento, mount, usuario, paginaActual, autenticacion, navegar) {
  const header = documento.createElement('header');
  header.className = 'app-navbar';

  const marca = documento.createElement('a');
  marca.className = 'app-navbar__marca';
  marca.href = usuario.rol === 'ADMIN' ? RUTAS.panel : RUTAS.inicio;
  const logo = documento.createElement('span');
  logo.className = 'app-navbar__logo';
  logo.textContent = 'CF';
  logo.setAttribute('aria-hidden', 'true');
  const textoMarca = documento.createElement('span');
  textoMarca.className = 'app-navbar__marca-texto';
  const nombreMarca = documento.createElement('strong');
  nombreMarca.textContent = 'CATO FIND';
  const subtituloMarca = documento.createElement('small');
  subtituloMarca.textContent = 'UCB Cochabamba';
  textoMarca.append(nombreMarca, subtituloMarca);
  marca.append(logo, textoMarca);

  const navegacion = documento.createElement('nav');
  navegacion.setAttribute('aria-label', 'Navegación principal');
  const enlaces = documento.createElement('ul');
  enlaces.className = 'app-navbar__enlaces';
  const paginas = usuario.rol === 'ADMIN'
    ? [
      ['Panel', RUTAS.panel, 'panel'],
      ['Solicitudes', RUTAS.revisarSolicitudes, 'solicitudes']
    ]
    : [
      ['Inicio', RUTAS.inicio, 'inicio'],
      ['Buscar', RUTAS.buscar, 'buscar'],
      ['Reportar', RUTAS.reportar, 'reportar'],
      ['Mis reportes', RUTAS.reportes, 'reportes'],
      ['Mis solicitudes', RUTAS.solicitudes, 'solicitudes']
    ];

  paginas.forEach(([texto, ruta, pagina]) => {
    const item = documento.createElement('li');
    item.appendChild(crearEnlace(documento, texto, ruta, pagina, paginaActual));
    enlaces.appendChild(item);
  });
  navegacion.appendChild(enlaces);

  const acciones = documento.createElement('div');
  acciones.className = 'app-navbar__acciones';
  const notificaciones = documento.createElement('span');
  notificaciones.className = 'app-navbar__notificaciones';
  notificaciones.setAttribute('aria-label', 'Notificaciones: 2 nuevas');
  const notificacionesBadge = documento.createElement('span');
  notificacionesBadge.className = 'app-navbar__badge';
  notificacionesBadge.textContent = '2';
  notificaciones.append(
    crearIcono(documento, 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9'),
    notificacionesBadge
  );
  const botonSalir = documento.createElement('button');
  botonSalir.type = 'button';
  botonSalir.className = 'app-navbar__salir';
  botonSalir.id = 'btn-logout';
  botonSalir.setAttribute('aria-label', 'Cerrar sesión');
  botonSalir.appendChild(crearIcono(documento, 'M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7'));
  botonSalir.addEventListener('click', async () => {
    try {
      await autenticacion.cerrarSesion();
      navegar(RUTAS.login);
    } catch {
      const estado = documento.getElementById('navbar-mensaje');
      if (estado) {
        estado.textContent = 'No se pudo cerrar la sesión.';
      }
    }
  });

  acciones.append(
    notificaciones,
    crearIdentidad(documento, usuario),
    botonSalir
  );
  header.append(marca, navegacion, acciones);
  mount.replaceChildren(header);
}

export async function iniciarNavbar(
  documento = globalThis.document,
  autenticacion = new AutenticacionApi(),
  navegar = ruta => globalThis.location.assign(ruta)
) {
  const mount = documento.getElementById('shared-navbar');
  if (!mount) {
    return;
  }

  let usuario;
  try {
    usuario = await autenticacion.obtenerSesion();
  } catch {
    mount.textContent = 'No se pudo cargar la navegación. Intenta recargar la página.';
    return;
  }

  if (!usuario) {
    navegar(RUTAS.login);
    return;
  }

  const rolRequerido = mount.dataset.rol;
  if (rolRequerido && usuario.rol !== rolRequerido) {
    navegar(usuario.rol === 'ADMIN' ? RUTAS.panel : RUTAS.inicio);
    return;
  }

  crearNavbar(
    documento,
    mount,
    usuario,
    mount.dataset.pagina,
    autenticacion,
    navegar
  );
}

if (typeof document !== 'undefined' && document.getElementById('shared-navbar')) {
  iniciarNavbar();
}
