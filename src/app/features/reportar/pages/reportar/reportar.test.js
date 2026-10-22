
import {
  validarInformacion,
  registrarReporte
} from './reportar.js';

import { ReporteService } from '../../services/ReporteService.js';

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


describe('HU-03 - Guardar reportes pendientes', () => {

  const hoy = new Date('2026-10-21T12:00:00');

  const datosValidos = {
    categoria: 'Accesorios',
    titulo: 'Mochila negra',
    lugar: 'Biblioteca',
    fecha: '2026-10-20',
    hora: '10:30',
    descripcion: 'Mochila encontrada en una mesa',
    detallePrivado: 'Tiene unas iniciales en el interior',
    imagen: 'data:image/jpeg;base64,Zm90bw=='
  };

  let almacenamiento;

  beforeEach(() => {
    const memoria = {};

    almacenamiento = {
      getItem: clave => memoria[clave] ?? null,
      setItem: (clave, valor) => {
        memoria[clave] = valor;
      }
    };
  });

  it('debe guardar el objeto en estado Pendiente', () => {
    const resultado = registrarReporte(
      datosValidos,
      almacenamiento,
      hoy
    );

    expect(resultado.ok).toBe(true);
    expect(resultado.reporte.estado).toBe('Pendiente');
    expect(resultado.reporte.titulo).toBe('Mochila negra');
  });

  it('no debe permitir publicar directamente un reporte', () => {
    const resultado = registrarReporte({
      ...datosValidos,
      estado: 'Publicado'
    }, almacenamiento, hoy);

    expect(resultado.reporte.estado).toBe('Pendiente');
  });

  it('debe conservar el reporte entre instancias', () => {
    registrarReporte(datosValidos, almacenamiento, hoy);

    const nuevoServicio = new ReporteService(almacenamiento);

    expect(nuevoServicio.obtenerReportes()).toHaveLength(1);
    expect(nuevoServicio.obtenerPendientes()).toHaveLength(1);
  });

  it('debe asignar identificadores diferentes', () => {
    const primero = registrarReporte(
      datosValidos, almacenamiento, hoy
    );

    const segundo = registrarReporte({
      ...datosValidos,
      titulo: 'Celular Samsung'
    }, almacenamiento, hoy);

    expect(primero.reporte.id).not.toBe(segundo.reporte.id);
  });

  it('no debe guardar informacion incompleta', () => {
    const resultado = registrarReporte({
      ...datosValidos,
      titulo: ''
    }, almacenamiento, hoy);

    expect(resultado.ok).toBe(false);

    const servicio = new ReporteService(almacenamiento);
    expect(servicio.obtenerReportes()).toHaveLength(0);
  });

  it('debe exigir una fotografia antes de guardar', () => {
    const resultado = registrarReporte({
      ...datosValidos,
      imagen: ''
    }, almacenamiento, hoy);

    expect(resultado.ok).toBe(false);
    expect(resultado.errores.imagen).toBe(
      'Agrega una fotografía para continuar.'
    );
  });

});
