
import {
  CATEGORIAS,
  LUGARES
} from '../../../../core/data/datosIniciales.js';

export function validarInformacion(datos, hoy = new Date()) {

  const errores = {};

  const categoria = String(datos?.categoria ?? '').trim();
  const titulo = String(datos?.titulo ?? '').trim();
  const lugar = String(datos?.lugar ?? '').trim();
  const fecha = String(datos?.fecha ?? '').trim();
  const hora = String(datos?.hora ?? '').trim();
  const descripcion = String(datos?.descripcion ?? '').trim();

  if (!CATEGORIAS.includes(categoria) || categoria === 'Todos') {
    errores.categoria = 'Selecciona el tipo de objeto';
  }

  if (titulo.length < 3) {
    errores.titulo = 'Escribe un nombre (mín. 3 caracteres)';
  }

  if (!LUGARES.includes(lugar) || lugar === 'Todas') {
    errores.lugar = 'Selecciona el lugar';
  }

  const fechaObjeto = new Date(`${fecha}T00:00:00`);

  const fechaValida =
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    !Number.isNaN(fechaObjeto.getTime()) &&
    fechaObjeto.getFullYear() === Number(fecha.slice(0, 4)) &&
    fechaObjeto.getMonth() + 1 === Number(fecha.slice(5, 7)) &&
    fechaObjeto.getDate() === Number(fecha.slice(8, 10));

  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0')
  ].join('-');

  if (!fechaValida) {
    errores.fecha = 'Selecciona una fecha válida';
  } else if (fecha > fechaHoy) {
    errores.fecha = 'La fecha no puede ser futura';
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    errores.hora = 'Indica la hora aproximada';
  }

  if (descripcion.length < 10) {
    errores.descripcion =
      'Describe el objeto (mín. 10 caracteres)';
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
}
