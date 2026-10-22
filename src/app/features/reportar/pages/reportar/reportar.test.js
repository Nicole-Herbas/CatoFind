
/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'node:fs';

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


describe('HU-03 - Estructura HTML del formulario', () => {

  const ruta = 'src/app/features/reportar/pages/reportar/reportar.html';

  const html = readFileSync(ruta, 'utf8');
  const pagina = new DOMParser().parseFromString(html, 'text/html');

  it('debe contener los tres pasos', () => {
    expect(pagina.querySelector('#paso-informacion')).not.toBeNull();
    expect(pagina.querySelector('#paso-foto')).not.toBeNull();
    expect(pagina.querySelector('#paso-confirmacion')).not.toBeNull();
  });

  it('debe mostrar primero el paso de informacion', () => {
    expect(pagina.querySelector('#paso-informacion').hasAttribute('hidden'))
      .toBe(false);

    expect(pagina.querySelector('#paso-foto').hasAttribute('hidden'))
      .toBe(true);

    expect(pagina.querySelector('#paso-confirmacion').hasAttribute('hidden'))
      .toBe(true);
  });

  it('debe tener todos los campos del formulario', () => {
    const campos = [
      'categoria', 'titulo', 'lugar',
      'fecha', 'hora', 'descripcion', 'detallePrivado'
    ];

    campos.forEach(id => {
      expect(pagina.getElementById(id)).not.toBeNull();
    });
  });

  it('debe exigir los campos obligatorios', () => {
    const obligatorios = [
      'categoria', 'titulo', 'lugar',
      'fecha', 'hora', 'descripcion'
    ];

    obligatorios.forEach(id => {
      expect(pagina.getElementById(id).required).toBe(true);
    });

    expect(pagina.getElementById('detallePrivado').required).toBe(false);
  });

  it('debe ofrecer subir foto y tomar fotografia', () => {
    const archivo = pagina.querySelector('#foto-archivo');
    const camara = pagina.querySelector('#foto-camara');

    expect(archivo.getAttribute('accept')).toBe('image/*');
    expect(camara.getAttribute('accept')).toBe('image/*');
    expect(camara.getAttribute('capture')).toBe('environment');
  });

  it('debe tener vista previa y mensaje de foto obligatoria', () => {
    expect(pagina.querySelector('#foto-preview')).not.toBeNull();

    expect(pagina.querySelector('#aviso-foto').textContent)
      .toContain('Agrega una fotografía para continuar.');
  });

  it('debe tener resumen y boton de envio', () => {
    expect(pagina.querySelector('#confirm-titulo')).not.toBeNull();
    expect(pagina.querySelector('#confirm-imagen')).not.toBeNull();
    expect(pagina.querySelector('#confirm-categoria')).not.toBeNull();
    expect(pagina.querySelector('#confirm-lugar')).not.toBeNull();
    expect(pagina.querySelector('#confirm-fecha')).not.toBeNull();
    expect(pagina.querySelector('#confirm-hora')).not.toBeNull();
    expect(pagina.querySelector('#enviar-reporte')).not.toBeNull();
  });

  it('debe conectar el presentador MVP', () => {
    expect(html).toContain('src="./reportarPresenter.js"');
  });

});


describe('HU-03 - Estilos del formulario', () => {

  const ruta = 'src/app/features/reportar/pages/reportar/reportar.css';
  const css = readFileSync(ruta, 'utf8');

  it('debe tener una tarjeta para los campos', () => {
    expect(css).toContain('.tarjeta-formulario');
    expect(css).toContain('border-radius:');
    expect(css).toContain('box-shadow:');
  });

  it('debe tener estilos para mostrar errores', () => {
    expect(css).toContain('.error');
    expect(css).toContain('color: #e53935;');
  });

  it('debe tener estilos para los tres pasos', () => {
    expect(css).toContain('.pasos');
    expect(css).toContain('.pasos__activo');
    expect(css).toContain('.paso[hidden]');
  });

  it('debe tener zona de fotografia y vista previa', () => {
    expect(css).toContain('.zona-foto');
    expect(css).toContain('.vista-previa');
    expect(css).toContain('.toast');
  });

  it('debe adaptarse a pantallas pequeñas', () => {
    expect(css).toContain('@media (max-width: 640px)');
  });

});
