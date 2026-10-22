
/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'node:fs';
import { iniciarFormularioReporte } from './reportarPresenter.js';

import {
  validarArchivoImagen,
  calcularDimensiones
} from './imagen.js';

import {
  validarInformacion,
  registrarReporte
} from './reportar.js';
import { iniciarPanel } from '../../../admin/pages/panel/panelPresenter.js';

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


describe('HU-03 - Validar fotografias', () => {

  it('acepta fotografias JPG, PNG y WebP', () => {
    ['image/jpeg', 'image/png', 'image/webp'].forEach(tipo => {
      const resultado = validarArchivoImagen({
        type: tipo,
        size: 1024
      });

      expect(resultado.valido).toBe(true);
    });
  });

  it('rechaza archivos que no sean fotografias', () => {
    const resultado = validarArchivoImagen({
      type: 'application/pdf',
      size: 1024
    });

    expect(resultado.valido).toBe(false);
  });

  it('rechaza archivos mayores a 12 MB', () => {
    const resultado = validarArchivoImagen({
      type: 'image/jpeg',
      size: 13 * 1024 * 1024
    });

    expect(resultado.valido).toBe(false);
  });

  it('reduce imagenes grandes proporcionalmente', () => {
    expect(calcularDimensiones(4000, 3000))
      .toEqual({ ancho: 1000, alto: 750 });
  });

  it('no agranda fotografias pequeñas', () => {
    expect(calcularDimensiones(600, 400))
      .toEqual({ ancho: 600, alto: 400 });
  });
});


describe('HU-03 - Flujo completo del formulario', () => {

  const HTML = readFileSync(
    'src/app/features/reportar/pages/reportar/reportar.html',
    'utf8'
  );

  const FOTO = 'data:image/jpeg;base64,Zm90bw==';

  let pagina;
  let almacenamiento;
  let procesarImagen;

  function llenarFormulario() {
    const datos = {
      categoria: 'Accesorios',
      titulo: 'Mochila negra',
      lugar: 'Biblioteca',
      fecha: '2026-10-20',
      hora: '10:30',
      descripcion: 'Mochila encontrada en una mesa',
      detallePrivado: 'Tiene iniciales por dentro'
    };

    Object.entries(datos).forEach(([id, valor]) => {
      pagina.getElementById(id).value = valor;
    });
  }

  async function subirFoto(id = 'foto-archivo') {
    const input = pagina.getElementById(id);

    const archivo = new File(['foto'], 'mochila.jpg', {
      type: 'image/jpeg'
    });

    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [archivo]
    });

    input.dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise(resolve => setTimeout(resolve, 0));
  }

  function avanzarAFoto() {
    llenarFormulario();
    pagina.getElementById('siguiente-informacion').click();
  }

  beforeEach(() => {
    pagina = new DOMParser().parseFromString(
      HTML, 'text/html'
    );

    const memoria = {};

    almacenamiento = {
      getItem: clave => memoria[clave] ?? null,
      setItem: (clave, valor) => {
        memoria[clave] = valor;
      }
    };

    procesarImagen = jest.fn(async () => FOTO);

    iniciarFormularioReporte(pagina, almacenamiento, {
      procesarImagen,
      ahora: () => new Date('2026-10-21T12:00:00')
    });
  });

  it('carga categorias y lugares disponibles', () => {
    expect(
      pagina.querySelector('#categoria option[value="Accesorios"]')
    ).not.toBeNull();

    expect(
      pagina.querySelector('#lugar option[value="Biblioteca"]')
    ).not.toBeNull();
  });

  it('impide avanzar con campos vacios', () => {
    pagina.getElementById('siguiente-informacion').click();

    expect(pagina.getElementById('paso-informacion').hidden)
      .toBe(false);

    expect(pagina.getElementById('error-titulo').textContent)
      .not.toBe('');
  });

  it('avanza al segundo paso con datos correctos', () => {
    avanzarAFoto();

    expect(pagina.getElementById('paso-informacion').hidden)
      .toBe(true);

    expect(pagina.getElementById('paso-foto').hidden)
      .toBe(false);
  });

  it('muestra el aviso cuando falta fotografia', () => {
    avanzarAFoto();

    pagina.getElementById('siguiente-foto').click();

    expect(pagina.getElementById('aviso-foto').hidden)
      .toBe(false);

    expect(pagina.getElementById('paso-foto').hidden)
      .toBe(false);
  });

  it('acepta foto desde la camara y muestra resumen', async () => {
    avanzarAFoto();

    await subirFoto('foto-camara');

    expect(pagina.getElementById('foto-preview').hidden)
      .toBe(false);

    pagina.getElementById('siguiente-foto').click();

    expect(pagina.getElementById('paso-confirmacion').hidden)
      .toBe(false);

    expect(pagina.getElementById('confirm-titulo').textContent)
      .toBe('Mochila negra');

    expect(pagina.getElementById('confirm-imagen').src)
      .toBe(FOTO);
  });

  it('permite regresar conservando los datos', async () => {
    avanzarAFoto();

    await subirFoto();

    pagina.getElementById('siguiente-foto').click();
    pagina.getElementById('volver-foto').click();
    pagina.getElementById('volver-informacion').click();

    expect(pagina.getElementById('titulo').value)
      .toBe('Mochila negra');

    expect(pagina.getElementById('paso-informacion').hidden)
      .toBe(false);
  });

  it('guarda el reporte como Pendiente al enviarlo', async () => {
    avanzarAFoto();

    await subirFoto();

    pagina.getElementById('siguiente-foto').click();

    const formulario = pagina.getElementById('form-reportar');

    formulario.dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true
      })
    );

    const servicio = new ReporteService(almacenamiento);

    expect(servicio.obtenerPendientes()).toHaveLength(1);

    expect(servicio.obtenerPendientes()[0].titulo)
      .toBe('Mochila negra');

    expect(pagina.getElementById('estado-reporte').textContent)
      .toContain('Pendiente');

    // No debe duplicarse por pulsar dos veces.
    formulario.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    expect(servicio.obtenerPendientes()).toHaveLength(1);
  });

  it('acepta fotografias arrastradas', async () => {
    avanzarAFoto();

    const evento = new Event('drop', {
      bubbles: true,
      cancelable: true
    });

    Object.defineProperty(evento, 'dataTransfer', {
      value: {
        files: [
          new File(['foto'], 'mochila.png', {
            type: 'image/png'
          })
        ]
      }
    });

    pagina.querySelector('.zona-foto').dispatchEvent(evento);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(procesarImagen).toHaveBeenCalledTimes(1);

    expect(pagina.getElementById('foto-preview').hidden)
      .toBe(false);
  });

  it('avisa cuando no se puede guardar el reporte', async () => {
    avanzarAFoto();
    await subirFoto();
    pagina.getElementById('siguiente-foto').click();

    almacenamiento.setItem = () => {
      throw new Error('Almacenamiento lleno');
    };

    pagina.getElementById('form-reportar').dispatchEvent(
      new Event('submit', { cancelable: true })
    );

    expect(pagina.getElementById('estado-reporte').textContent)
      .toContain('No se pudo guardar');
  });

});


describe('HU-03 - Revision administrativa de reportes', () => {

  const htmlPanel = readFileSync(
    'src/app/features/admin/pages/panel/panel.html',
    'utf8'
  );

  let pagina;
  let almacenamiento;
  let servicio;
  let avisar;
  let navegar;

  function crearSesion(rol = 'ADMIN') {
    return {
      getItem: clave => clave === 'catofind_sesion'
        ? JSON.stringify({
            nombre: 'Usuario',
            correo: 'bienestar@ucb.edu.bo',
            rol
          })
        : null,
      removeItem: jest.fn()
    };
  }

  function abrirPanel(rol = 'ADMIN') {
    iniciarPanel(
      pagina,
      crearSesion(rol),
      { avisar, irAlLogin: navegar },
      almacenamiento
    );
  }

  beforeEach(() => {
    pagina = new DOMParser().parseFromString(
      htmlPanel,
      'text/html'
    );

    const memoria = {};

    almacenamiento = {
      getItem: clave => memoria[clave] ?? null,
      setItem: (clave, valor) => {
        memoria[clave] = valor;
      }
    };

    servicio = new ReporteService(almacenamiento);

    servicio.guardarReporte({
      titulo: 'Mochila negra',
      categoria: 'Accesorios',
      lugar: 'Biblioteca',
      fecha: '2026-10-20',
      hora: '10:30',
      descripcion: 'Mochila encontrada en una mesa',
      detallePrivado: 'Tiene iniciales JC',
      imagen: 'data:image/jpeg;base64,Zm90bw=='
    });

    avisar = jest.fn();
    navegar = jest.fn();
  });

  it('incluye una seccion para reportes pendientes', () => {
    expect(pagina.getElementById('reportes-pendientes'))
      .not.toBeNull();
  });

  it('muestra al administrador los reportes pendientes', () => {
    abrirPanel();

    const lista = pagina.getElementById('reportes-pendientes');

    expect(lista.textContent).toContain('Mochila negra');
    expect(lista.textContent).toContain('Tiene iniciales JC');
    expect(lista.querySelector('img')).not.toBeNull();
  });

  it('no muestra los reportes a estudiantes', () => {
    abrirPanel('ESTUDIANTE');

    expect(avisar).toHaveBeenCalledWith(
      'No tienes permisos para acceder al panel administrativo.'
    );

    expect(navegar).toHaveBeenCalledTimes(1);

    expect(pagina.getElementById('panel-contenido').hidden)
      .toBe(true);
  });

  it('permite aprobar un reporte pendiente', () => {
    abrirPanel();

    pagina.querySelector('[data-accion="aprobar"]').click();

    expect(servicio.obtenerPendientes()).toHaveLength(0);
    expect(servicio.obtenerPublicados()).toHaveLength(1);
    expect(servicio.obtenerPublicados()[0].estado)
      .toBe('Publicado');
  });

  it('permite rechazar un reporte pendiente', () => {
    abrirPanel();

    pagina.querySelector('[data-accion="rechazar"]').click();

    expect(servicio.obtenerPendientes()).toHaveLength(0);
    expect(servicio.obtenerPublicados()).toHaveLength(0);
    expect(servicio.obtenerReportes()[0].estado)
      .toBe('Rechazado');
  });

  it('no permite cambiar directamente a cualquier estado', () => {
    const resultado = servicio.actualizarEstado(1, 'Inventado');

    expect(resultado).toBeNull();
    expect(servicio.obtenerPendientes()).toHaveLength(1);
  });

  it('no permite aprobar otra vez un reporte ya revisado', () => {
    servicio.actualizarEstado(1, 'Publicado');

    const segundoIntento = servicio.actualizarEstado(
      1,
      'Rechazado'
    );

    expect(segundoIntento).toBeNull();
    expect(servicio.obtenerPublicados()).toHaveLength(1);
  });

  it('tiene estilos para las tarjetas de revision', () => {
    const css = readFileSync(
      'src/app/features/admin/pages/panel/panel.css',
      'utf8'
    );

    expect(css).toContain('.panel__reporte');
    expect(css).toContain('.panel__reporte-imagen');
    expect(css).toContain('.panel__acciones');
  });
});
