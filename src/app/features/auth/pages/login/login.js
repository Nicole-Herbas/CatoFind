import { UsuarioService } from '../../services/UsuarioService.js';


export function esCorreoInstitucional(correo) {
  return /^[^\s@]+@ucb\.edu\.bo$/i.test(correo.trim());
}


export function iniciarSesion(correo, contrasena, almacenamiento, almacenamientoSesion = null) {

  const correoNormalizado = String(correo ?? '').trim().toLowerCase();
  const clave = String(contrasena ?? '');

  if (!correoNormalizado || !clave) {
    return {
      ok: false,
      mensaje: 'Completa el correo y la contraseña.'
    };
  }

  if (!esCorreoInstitucional(correoNormalizado)) {
    return {
      ok: false,
      mensaje: 'Ingresa con tu cuenta académica @ucb.edu.bo.'
    };
  }

  const servicio = new UsuarioService(almacenamiento);
  const usuarios = servicio.obtenerUsuarios();

  const usuario = usuarios.find(estudiante =>
    typeof estudiante.correo === 'string' &&
    estudiante.correo.trim().toLowerCase() === correoNormalizado &&
    estudiante.contrasena === clave
  );

  if (!usuario) {
    return {
      ok: false,
      mensaje: 'Correo o contraseña incorrectos.'
    };
  }
  const usuarioSesion = {
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  correo: usuario.correo,
  rol: usuario.rol === 'ADMIN' ? 'ADMIN' : 'ESTUDIANTE'
};

  if (almacenamientoSesion) {
    almacenamientoSesion.setItem(
      'catofind_sesion',
      JSON.stringify(usuarioSesion)
    );
  }

  return {
    ok: true,
    mensaje: 'Inicio de sesión correcto.',
    usuario: usuarioSesion
  };
}


export function obtenerSesion(almacenamientoSesion) {
  try {
    const datos = almacenamientoSesion.getItem('catofind_sesion');

    if (!datos) {
      return null;
    }

    const usuario = JSON.parse(datos);

    if (
      !usuario ||
      typeof usuario.correo !== 'string' ||
      !esCorreoInstitucional(usuario.correo)
    ) {
      return null;
    }

    return {
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  correo: usuario.correo,
  rol: usuario.rol === 'ADMIN' ? 'ADMIN' : 'ESTUDIANTE'
};
  } catch {
    return null;
  }
}

export function cerrarSesion(almacenamientoSesion) {
  almacenamientoSesion.removeItem('catofind_sesion');
}

export function mensajeRecuperacion() {
  return 'Te enviaríamos un enlace de recuperación a tu correo ';
}
export function crearAdministradorDemo(almacenamiento) {
  const servicio = new UsuarioService(almacenamiento);

  const correo = 'bienestar@ucb.edu.bo';

  if (servicio.existeCorreo(correo)) {
    return false;
  }

  servicio.guardarUsuario({
    nombre: 'Administrador',
    apellido: 'Bienestar',
    correo: correo,
    contrasena: 'Admin12345',
    rol: 'ADMIN'
  });

  return true;
}


export function verificarAccesoAdministrador(almacenamientoSesion) {

  const usuario = obtenerSesion(almacenamientoSesion);

  if (!usuario) {
    return {
      permitido: false,
      mensaje: 'Debes iniciar sesión para acceder al panel administrativo.'
    };
  }

  if (usuario.rol !== 'ADMIN') {
    return {
      permitido: false,
      mensaje: 'No tienes permisos para acceder al panel administrativo.'
    };
  }

  return {
    permitido: true,
    mensaje: ''
  };
}
