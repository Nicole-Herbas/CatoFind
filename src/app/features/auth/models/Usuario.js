
export class Usuario {

 constructor({ nombre, apellido, correo, contrasena, rol = 'ESTUDIANTE' }) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.correo = correo;
    this.contrasena = contrasena;
    this.rol = rol;
  }

}
