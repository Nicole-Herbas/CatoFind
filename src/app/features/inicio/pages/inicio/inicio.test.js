/** @jest-environment jsdom */
import { beforeEach, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { Objeto } from '../../../../core/models/Objeto.js';
import { crearServicioInicio } from '../../services/inicioService.js';
import { iniciarInicio } from './inicioPresenter.js';
import { renderFiltros, renderTarjetas } from './inicio.js';

const htmlInicio = readFileSync('src/app/features/inicio/pages/inicio/inicio.html', 'utf8');
const htmlPaginaInicio = htmlInicio;
const objetoRopa = {
  id: 1, reporteId: 11, titulo: '<img src=x onerror=alert(1)>', categoria: 'Ropa',
  lugar: '<script>alert(2)</script>', fecha: '2026-11-10', imagen: 'https://foto.test/ropa.jpg',
  estado: 'Publicado'
};
const objetoDocumentos = {
  id: 2, reporteId: 12, titulo: 'Cuaderno', categoria: 'Documentos', lugar: 'Biblioteca',
  fecha: '2026-11-09', imagen: 'https://foto.test/cuaderno.jpg', estado: 'Publicado'
};
const objetoPublicadoVista = new Objeto({
  id: 1,
  reporteId: 11,
  titulo: '<img src=x onerror=alert(1)>',
  categoria: 'Ropa',
  lugar: '<script>alert(2)</script>',
  fecha: '2026-11-10',
  imagen: '',
  estado: 'Publicado'
});
const objetosPresentador = [
  {
    id: 1,
    reporteId: 11,
    titulo: 'Mochila negra',
    categoria: 'Ropa',
    lugar: 'Biblioteca',
    fecha: '2026-11-10',
    imagen: '',
    estado: 'Publicado'
  },
  {
    id: 2,
    reporteId: 12,
    titulo: 'Cuaderno',
    categoria: 'Documentos',
    lugar: 'Aula',
    fecha: '2026-11-09',
    imagen: '',
    estado: 'Publicado'
  }
];
const objetoServicio = {
  id: 1,
  reporteId: 11,
  titulo: 'Mochila negra',
  categoria: 'Accesorios',
  lugar: 'Biblioteca',
  fecha: '2026-11-10',
  imagen: 'https://foto.test/mochila.jpg',
  estado: 'Publicado'
};

const paginaInicio = new globalThis.DOMParser().parseFromString(htmlPaginaInicio, 'text/html');
const esperarActualizacion = () => new Promise(resolve => globalThis.setTimeout(resolve, 0));

beforeEach(() => {
  document.body.innerHTML = htmlInicio;
});

async function abrirInicio(fetchObjetos) {
  document.body.innerHTML = htmlInicio;
  globalThis.fetch = jest.fn(fetchObjetos);
  await iniciarInicio(document, {
    autenticacion: { cerrarSesion: jest.fn() }
  });
}

function titulosInicio() {
  return [...document.querySelectorAll('#objetos-grid .tarjeta__titulo')]
    .map(elemento => elemento.textContent);
}

describe('Inicio conectado al catálogo', () => {
  it('renderiza contenido del reporte como texto y conserva la imagen de respaldo', async () => {
    await abrirInicio(async () => ({ ok: true, json: async () => [objetoRopa] }));

    expect(titulosInicio()).toEqual(['<img src=x onerror=alert(1)>']);
    expect(document.querySelector('#objetos-grid script, #objetos-grid img[src="x"]')).toBeNull();
    const imagen = document.querySelector('#objetos-grid img');
    expect(imagen.alt).toBe('<img src=x onerror=alert(1)>');
    imagen.dispatchEvent(new globalThis.Event('error'));
    expect(imagen.src).toContain('photo-1494526585095-c41746248156');
  });

  it('mantiene todas las categorías disponibles al filtrar tarjetas por categoría', async () => {
    await abrirInicio(async ruta => {
      const categoria = new globalThis.URL(String(ruta), 'http://local').searchParams.get('categoria');
      const catalogo = [objetoRopa, objetoDocumentos];
      return {
        ok: true,
        json: async () => {
          if (categoria && categoria !== 'Todos') {
            return catalogo.filter(objeto => objeto.categoria === categoria);
          }
          return catalogo;
        }
      };
    });

    document.querySelector('[data-categoria="Ropa"]').click();
    await new Promise(resolve => globalThis.setTimeout(resolve, 0));

    expect(titulosInicio()).toHaveLength(1);
    expect([...document.querySelectorAll('#filtros-lista button')]
      .map(boton => boton.dataset.categoria)).toEqual(['Todos', 'Ropa', 'Documentos']);
  });

  it('ignora una respuesta anterior si termina después de la búsqueda más reciente', async () => {
    const resoluciones = [];
    await abrirInicio(async ruta => ({ ok: true, json: async () => {
      const texto = new globalThis.URL(String(ruta), 'http://local').searchParams.get('texto');
      if (!texto) {
        return [objetoRopa, objetoDocumentos];
      }

      return new Promise(resolve => resoluciones.push({ texto, resolve }));
    } }));

    const buscador = document.getElementById('input-buscar');
    buscador.value = 'ropa';
    buscador.dispatchEvent(new globalThis.Event('input'));
    await new Promise(resolve => globalThis.setTimeout(resolve, 0));
    buscador.value = 'cuaderno';
    buscador.dispatchEvent(new globalThis.Event('input'));
    await new Promise(resolve => globalThis.setTimeout(resolve, 0));

    resoluciones.find(item => item.texto === 'cuaderno').resolve([objetoDocumentos]);
    await new Promise(resolve => globalThis.setTimeout(resolve, 0));
    resoluciones.find(item => item.texto === 'ropa').resolve([objetoRopa]);
    await new Promise(resolve => globalThis.setTimeout(resolve, 0));

    expect(titulosInicio()).toEqual(['Cuaderno']);
  });
});

describe('Vista de Inicio', () => {
  it('renderiza los datos como texto y usa una imagen de respaldo', () => {
    renderTarjetas(document, [objetoPublicadoVista]);

    expect(document.querySelector('.tarjeta__titulo').textContent)
      .toBe('<img src=x onerror=alert(1)>');
    expect(document.querySelector('#objetos-grid script, #objetos-grid img[src="x"]'))
      .toBeNull();
    expect(document.querySelector('.tarjeta__meta-item').textContent)
      .toBe('<script>alert(2)</script>');
    expect(document.querySelector('.tarjeta__img').src)
      .toContain('photo-1494526585095-c41746248156');
  });

  it('muestra el estado vacío cuando no hay objetos', () => {
    renderTarjetas(document, []);

    const aviso = document.getElementById('objetos-empty');
    expect(aviso.hidden).toBe(false);
    expect(aviso.textContent.trim()).toBe('No se encontraron objetos con ese criterio.');
  });

  it('dibuja categorías únicas y marca la selección accesiblemente', () => {
    renderFiltros(document, [
      objetoPublicadoVista,
      new Objeto({ ...objetoPublicadoVista, id: 2, categoria: 'Documentos' }),
      new Objeto({ ...objetoPublicadoVista, id: 3, categoria: 'Ropa' })
    ], 'Documentos');

    const botones = [...document.querySelectorAll('#filtros-lista button')];
    expect(botones.map(boton => boton.dataset.categoria))
      .toEqual(['Todos', 'Ropa', 'Documentos']);
    expect(botones.map(boton => boton.getAttribute('aria-pressed')))
      .toEqual(['false', 'false', 'true']);
  });
});

describe('Presentador de Inicio', () => {
  it('carga el catálogo inicial y conecta filtros y búsqueda con el servicio', async () => {
    const servicio = {
      obtenerRecientes: jest.fn().mockResolvedValue(objetosPresentador),
      filtrar: jest.fn().mockResolvedValue([objetosPresentador[0]])
    };
    const autenticacion = { cerrarSesion: jest.fn() };

    await iniciarInicio(document, { servicio, autenticacion });

    expect(document.querySelectorAll('#objetos-grid .tarjeta')).toHaveLength(2);
    expect([...document.querySelectorAll('#filtros-lista button')]
      .map(boton => boton.dataset.categoria))
      .toEqual(['Todos', 'Ropa', 'Documentos']);

    document.querySelector('[data-categoria="Ropa"]').click();
    await esperarActualizacion();
    expect(servicio.filtrar).toHaveBeenLastCalledWith({
      categoria: 'Ropa',
      texto: ''
    });

    const busqueda = document.getElementById('input-buscar');
    busqueda.value = ' mochila ';
    busqueda.dispatchEvent(new globalThis.Event('input'));
    await esperarActualizacion();
    expect(servicio.filtrar).toHaveBeenLastCalledWith({
      categoria: 'Ropa',
      texto: 'mochila'
    });
  });

  it('muestra un error al fallar la carga inicial', async () => {
    const servicio = {
      obtenerRecientes: jest.fn().mockRejectedValue(new Error('fallo')),
      filtrar: jest.fn().mockRejectedValue(new Error('fallo'))
    };
    const autenticacion = { cerrarSesion: jest.fn() };

    await iniciarInicio(document, { servicio, autenticacion });

    const aviso = document.getElementById('objetos-empty');
    expect(aviso.hidden).toBe(false);
    expect(aviso.textContent).toBe('No se pudieron cargar los objetos.');
  });

  it('muestra un error si falla la búsqueda filtrada', async () => {
    const servicio = {
      obtenerRecientes: jest.fn().mockResolvedValue(objetosPresentador),
      filtrar: jest.fn().mockRejectedValue(new Error('fallo'))
    };
    const autenticacion = { cerrarSesion: jest.fn() };

    await iniciarInicio(document, { servicio, autenticacion });
    document.getElementById('input-buscar').dispatchEvent(new globalThis.Event('input'));
    await esperarActualizacion();

    const aviso = document.getElementById('objetos-empty');
    expect(aviso.hidden).toBe(false);
    expect(aviso.textContent).toBe('No se pudieron cargar los objetos.');
  });

  it('mantiene la navegación de búsqueda y reportar', async () => {
    const servicio = {
      obtenerRecientes: jest.fn().mockResolvedValue(objetosPresentador),
      filtrar: jest.fn().mockResolvedValue(objetosPresentador)
    };
    const navegar = jest.fn();

    await iniciarInicio(document, { servicio, navegar });

    const busqueda = document.getElementById('input-buscar');
    busqueda.value = 'mochila negra';
    document.getElementById('form-buscar').dispatchEvent(new globalThis.Event('submit', {
      bubbles: true,
      cancelable: true
    }));
    document.getElementById('btn-reportar-fab').click();

    expect(navegar).toHaveBeenCalledWith(
      '../../../buscar/pages/buscar/buscar.html?q=mochila%20negra'
    );
    expect(navegar).toHaveBeenCalledWith(
      '../../../reportar/pages/reportar/reportar.html'
    );
  });
});

describe('Servicio de Inicio', () => {
  it('obtiene objetos a través del repositorio compartido', async () => {
    const repositorioObjetos = {
      listar: jest.fn().mockResolvedValue([objetoServicio])
    };
    const servicio = crearServicioInicio(repositorioObjetos);

    await expect(servicio.obtenerRecientes()).resolves.toHaveLength(1);
    expect(repositorioObjetos.listar).toHaveBeenCalledWith();
  });

  it('obtiene los objetos recientes sin filtros y usa el modelo compartido', async () => {
    const apiObjetos = jest.fn().mockResolvedValue([objetoServicio]);
    const servicio = crearServicioInicio(apiObjetos);

    const objetos = await servicio.obtenerRecientes();

    expect(apiObjetos).toHaveBeenCalledWith();
    expect(objetos).toHaveLength(1);
    expect(objetos[0]).toBeInstanceOf(Objeto);
    expect(objetos[0]).toEqual(objetoServicio);
  });

  it('delega los filtros a la API y convierte sus resultados al modelo compartido', async () => {
    const apiObjetos = jest.fn().mockResolvedValue([objetoServicio]);
    const servicio = crearServicioInicio(apiObjetos);
    const filtros = { categoria: 'Accesorios', texto: 'mochila' };

    const objetos = await servicio.filtrar(filtros);

    expect(apiObjetos).toHaveBeenCalledWith(filtros);
    expect(objetos[0]).toBeInstanceOf(Objeto);
    expect(objetos[0].reporteId).toBe(11);
  });

  it('propaga errores de la API para que el presentador los comunique', async () => {
    const error = new Error('No se pudo cargar el catálogo.');
    const servicio = crearServicioInicio(jest.fn().mockRejectedValue(error));

    await expect(servicio.obtenerRecientes()).rejects.toBe(error);
  });
});

describe('Página Inicio - navegación y enlaces', () => {
  it('monta la barra compartida para estudiantes', () => {
    expect(paginaInicio.querySelector('#shared-navbar').dataset).toMatchObject({
      pagina: 'inicio',
      rol: 'ESTUDIANTE'
    });
  });

  it('debe tener el enlace de ver todo apuntando a buscar.html', () => {
    const link = paginaInicio.querySelector('#link-ver-todo');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('../../../buscar/pages/buscar/buscar.html');
  });

  it('carga los estilos y el script del navbar compartido', () => {
    expect(paginaInicio.querySelector(
      'link[href="../../../../shared/components/navbar/navbar.css"]'
    )).not.toBeNull();
    expect(paginaInicio.querySelector(
      'script[src="../../../../shared/components/navbar/navbar.js"]'
    )).not.toBeNull();
  });
});
