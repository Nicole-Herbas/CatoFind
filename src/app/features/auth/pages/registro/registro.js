
import { Usuario } from '../../models/Usuario.js';
import { UsuarioService } from '../../services/UsuarioService.js';

export function registrarEstudiante(datos, almacenamiento) {

  const nombre = String(datos.nombre ?? '').trim();
  const apellido = String(datos.apellido ?? '').trim();
  const correo = String(datos.correo ?? '').trim().toLowerCase();
  const contrasena = String(datos.contrasena ?? '');
  const confirmar = String(datos.confirmarContrasena ?? '');

  if (!nombre || !apellido || !correo || !contrasena || !confirmar) {
    return {
      ok: false,
      mensaje: 'Completa todos los campos.'
    };
  }

  if (!/^[^\s@]+@ucb\.edu\.bo$/.test(correo)) {
    return {
      ok: false,
      mensaje: 'Utiliza un correo institucional @ucb.edu.bo.'
    };
  }

  if (contrasena !== confirmar) {
    return {
      ok: false,
      mensaje: 'Las contraseñas no coinciden.'
    };
  }

  const servicio = new UsuarioService(almacenamiento);

  if (servicio.existeCorreo(correo)) {
    return {
      ok: false,
      mensaje: 'El correo ya está registrado.'
    };
  }

  const usuario = new Usuario({
    nombre,
    apellido,
    correo,
    contrasena
  });

  servicio.guardarUsuario(usuario);

  return {
    ok: true,
    mensaje: 'Cuenta creada correctamente.'
  };
}
