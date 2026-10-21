
const CLAVE_USUARIOS = 'catofind_usuarios';

export class UsuarioService {

  constructor(almacenamiento) {
    this.almacenamiento = almacenamiento;
  }

  obtenerUsuarios() {
    const datos = this.almacenamiento.getItem(CLAVE_USUARIOS);

    try {
      const usuarios = JSON.parse(datos || '[]');
      return Array.isArray(usuarios) ? usuarios : [];
    } catch {
      return [];
    }
  }

  existeCorreo(correo) {
    const correoBuscado = correo.trim().toLowerCase();

    return this.obtenerUsuarios().some(
      usuario => usuario.correo.toLowerCase() === correoBuscado
    );
  }

  guardarUsuario(usuario) {
    const usuarios = this.obtenerUsuarios();

    usuarios.push(usuario);

    this.almacenamiento.setItem(
      CLAVE_USUARIOS,
      JSON.stringify(usuarios)
    );
  }

}
