import { Objeto } from '../models/Objeto.js';

const DATOS_ESTATICOS = [
  {
    id: 1,
    titulo: 'Mochila negra',
    categoria: 'Ropa',
    lugar: 'Biblioteca Central',
    fecha: '2026-10-01',
    imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    estado: 'Publicado',
  },
  {
    id: 2,
    titulo: 'Laptop HP Pavilion',
    categoria: 'Electrónica',
    lugar: 'Aula 301 — Bloque B',
    fecha: '2026-10-05',
    imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
    estado: 'Publicado',
  },
  {
    id: 3,
    titulo: 'Carnet universitario',
    categoria: 'Documentos',
    lugar: 'Cafetería',
    fecha: '2026-10-08',
    imagen: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400&q=80',
    estado: 'Publicado',
  },
  {
    id: 4,
    titulo: 'Gato naranja',
    categoria: 'Mascotas',
    lugar: 'Jardín principal',
    fecha: '2026-10-10',
    imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
    estado: 'Publicado',
  },
  {
    id: 5,
    titulo: 'Audífonos Sony',
    categoria: 'Electrónica',
    lugar: 'Sala de estudio — Piso 2',
    fecha: '2026-10-12',
    imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    estado: 'Publicado',
  },
  {
    id: 6,
    titulo: 'Llave con llavero UCB',
    categoria: 'Accesorios',
    lugar: 'Baños — Bloque A',
    fecha: '2026-10-14',
    imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    estado: 'Publicado',
  },
  {
    id: 7,
    titulo: 'Cuaderno de apuntes',
    categoria: 'Documentos',
    lugar: 'Aula Magna',
    fecha: '2026-10-15',
    imagen: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    estado: 'Publicado',
  },
  {
    id: 8,
    titulo: 'Paraguas azul',
    categoria: 'Accesorios',
    lugar: 'Entrada principal',
    fecha: '2026-10-16',
    imagen: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80',
    estado: 'Publicado',
  },
];

export class ObjetoService {
  constructor() {
    this.objetos = DATOS_ESTATICOS.map((d) => new Objeto(d));
  }

  obtenerTodos() {
    return this.objetos;
  }

  filtrarPorCategoria(categoria) {
    if (categoria === 'Todos') return this.objetos;
    return this.objetos.filter((o) => o.categoria === categoria);
  }
}
