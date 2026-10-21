
import { validarInformacion } from './reportar.js';

describe('HU-03 - Validacion de informacion', () => {

  const hoy = new Date('2026-10-21T12:00:00');

  const datosValidos = {
    categoria: 'Accesorios',
    titulo: 'Mochila negra',
    lugar: 'Biblioteca',
    fecha: '2026-10-20',
    hora: '10:30',
    descripcion: 'Mochila negra encontrada en una mesa',
    detallePrivado: ''
  };

  it('debe aceptar informacion completa', () => {
    const resultado = validarInformacion(datosValidos, hoy);

    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toEqual({});
  });

  it('debe rechazar los campos obligatorios vacios', () => {
    const resultado = validarInformacion({}, hoy);

    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toHaveProperty('categoria');
    expect(resultado.errores).toHaveProperty('titulo');
    expect(resultado.errores).toHaveProperty('lugar');
    expect(resultado.errores).toHaveProperty('fecha');
    expect(resultado.errores).toHaveProperty('hora');
    expect(resultado.errores).toHaveProperty('descripcion');
  });

  it('debe validar el tamaño del nombre y descripcion', () => {
    const resultado = validarInformacion({
      ...datosValidos,
      titulo: 'AB',
      descripcion: 'Corta'
    }, hoy);

    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toHaveProperty('titulo');
    expect(resultado.errores).toHaveProperty('descripcion');
  });

  it('no debe permitir fechas futuras', () => {
    const resultado = validarInformacion({
      ...datosValidos,
      fecha: '2026-10-22'
    }, hoy);

    expect(resultado.valido).toBe(false);
    expect(resultado.errores.fecha).toBe(
      'La fecha no puede ser futura'
    );
  });

  it('debe validar categoria y lugar disponibles', () => {
    const resultado = validarInformacion({
      ...datosValidos,
      categoria: 'Inventada',
      lugar: 'Lugar desconocido'
    }, hoy);

    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toHaveProperty('categoria');
    expect(resultado.errores).toHaveProperty('lugar');
  });

  it('debe validar la hora aproximada', () => {
    const resultado = validarInformacion({
      ...datosValidos,
      hora: '30:90'
    }, hoy);

    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toHaveProperty('hora');
  });

  it('debe permitir dejar vacio el detalle privado', () => {
    const resultado = validarInformacion({
      ...datosValidos,
      detallePrivado: ''
    }, hoy);

    expect(resultado.valido).toBe(true);
  });

});
