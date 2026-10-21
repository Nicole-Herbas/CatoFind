import { Objeto } from '../models/Objeto.js';

export const CATEGORIAS = [
  'Todos', 'Electrónica', 'Ropa', 'Documentos', 'Mascotas', 'Accesorios', 'Otros',
];

export const LUGARES = [
  'Todas', 'Biblioteca', 'Cafetería', 'Laboratorio', 'Bloque A', 'Bloque B', 'Auditorio',
];

export const OBJETOS_INICIALES = [
  { id: 1, titulo: 'Mochila negra', categoria: 'Accesorios', lugar: 'Biblioteca',
    fecha: '2026-10-08', estado: 'Publicado',
    imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
  { id: 2, titulo: 'Chompa azul', categoria: 'Ropa', lugar: 'Cafetería',
    fecha: '2026-10-05', estado: 'Publicado',
    imagen: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80' },
  { id: 3, titulo: 'Cuaderno verde', categoria: 'Documentos', lugar: 'Laboratorio',
    fecha: '2026-09-30', estado: 'Publicado',
    imagen: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80' },
  { id: 4, titulo: 'Audífonos Sony', categoria: 'Electrónica', lugar: 'Bloque A',
    fecha: '2026-10-12', estado: 'Publicado',
    imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
  { id: 5, titulo: 'Carnet universitario', categoria: 'Documentos', lugar: 'Bloque B',
    fecha: '2026-10-15', estado: 'Publicado',
    imagen: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400&q=80' },
  { id: 6, titulo: 'Calculadora científica', categoria: 'Electrónica', lugar: 'Bloque A',
    fecha: '2026-10-18', estado: 'En revisión', imagen: '' },
].map((datos) => new Objeto(datos));