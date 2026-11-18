import { crearClienteApi } from '../clienteApi.js';

export function crearRepositorioUsuarios(cliente = crearClienteApi()) {
  return {
    async obtenerSesion() {
      const resultado = await cliente.get('/auth/sesion');
      return resultado.usuario;
    }
  };
}
