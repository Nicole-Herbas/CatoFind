import { crearRepositorioReportes } from '../reportes.js';

function crearClienteSupabase(respuestas) {
  const consultas = [];
  const supabase = {
    from(tabla) {
      const consulta = {
        tabla,
        operaciones: [],
        select(...argumentos) { this.operaciones.push(['select', ...argumentos]); return this; },
        insert(...argumentos) { this.operaciones.push(['insert', ...argumentos]); return this; },
        update(...argumentos) { this.operaciones.push(['update', ...argumentos]); return this; },
        delete(...argumentos) { this.operaciones.push(['delete', ...argumentos]); return this; },
        eq(...argumentos) { this.operaciones.push(['eq', ...argumentos]); return this; },
        order(...argumentos) { this.operaciones.push(['order', ...argumentos]); return this; },
        single() { return Promise.resolve(respuestas.shift()); },
        maybeSingle() { return Promise.resolve(respuestas.shift()); },
        then(resolve, reject) { return Promise.resolve(respuestas.shift()).then(resolve, reject); }
      };
      consultas.push(consulta);
      return consulta;
    }
  };
  return { supabase, consultas };
}

describe('repositorio de reportes', () => {
  it('consulta solo reportes encontrados pendientes y prepara los datos de revisión', async () => {
    const { supabase, consultas } = crearClienteSupabase([{
      data: [{
        id: 7,
        fecha: '2026-11-10',
        hora: '10:30:00',
        lugar: 'Biblioteca',
        estado: 'PENDIENTE',
        objeto: {
          nombre: 'Mochila negra',
          categoria: 'Accesorios',
          foto: 'foto.jpg'
        }
      }],
      error: null
    }]);

    const reportes = await crearRepositorioReportes(supabase).listarPendientes();

    expect(reportes[0]).toEqual({
      id: 7,
      titulo: 'Mochila negra',
      categoria: 'Accesorios',
      lugar: 'Biblioteca',
      fecha: '2026-11-10',
      hora: '10:30',
      imagen: 'foto.jpg'
    });
    expect(consultas[0].operaciones[0][1]).not.toContain('detalle_privado');
    expect(consultas[0].operaciones[0][1]).not.toContain('descripcion');
    expect(consultas[0].operaciones).toContainEqual(['eq', 'estado', 'PENDIENTE']);
    expect(consultas[0].operaciones).toContainEqual(['eq', 'tipo', 'ENCONTRADO']);
  });

  it('obtiene los datos privados solo del reporte encontrado pendiente solicitado', async () => {
    const { supabase, consultas } = crearClienteSupabase([{
      data: {
        id: 7,
        fecha: '2026-11-10',
        hora: '10:30:00',
        lugar: 'Biblioteca',
        estado: 'PENDIENTE',
        detalle_privado: 'Costura roja.',
        objeto: {
          nombre: 'Mochila negra',
          categoria: 'Accesorios',
          descripcion: 'Mochila encontrada.',
          foto: 'foto.jpg'
        },
        reportante: { nombre: 'Ana Torres' }
      },
      error: null
    }]);

    const reporte = await crearRepositorioReportes(supabase).obtenerDetallePendiente(7);

    expect(reporte).toEqual({
      id: 7,
      titulo: 'Mochila negra',
      categoria: 'Accesorios',
      descripcion: 'Mochila encontrada.',
      lugar: 'Biblioteca',
      fecha: '2026-11-10',
      hora: '10:30',
      estado: 'PENDIENTE',
      reportante: 'Ana Torres',
      detallePrivado: 'Costura roja.',
      imagen: 'foto.jpg'
    });
    expect(consultas[0].operaciones).toContainEqual(['eq', 'id', 7]);
    expect(consultas[0].operaciones).toContainEqual(['eq', 'tipo', 'ENCONTRADO']);
    expect(consultas[0].operaciones).toContainEqual(['eq', 'estado', 'PENDIENTE']);
    expect(consultas[0].operaciones[0][1])
      .toContain('reportante:usuario!reporte_estudiante_id_fkey(nombre)');
  });

  it('crea el objeto y lo vincula al reporte pendiente del estudiante', async () => {
    const { supabase, consultas } = crearClienteSupabase([
      { data: { id: 31 }, error: null },
      { data: { id: 21, estado: 'PENDIENTE' }, error: null }
    ]);

    const reporte = await crearRepositorioReportes(supabase).crearReporte({
      titulo: 'Mochila negra',
      descripcion: 'Mochila encontrada junto a la entrada.',
      categoria: 'Accesorios',
      imagen: 'foto.jpg',
      tipo: 'ENCONTRADO',
      fecha: '2026-11-10',
      hora: '10:30',
      lugar: 'Biblioteca',
      contacto: 'ana@ucb.edu.bo',
      detallePrivado: 'Costura roja.',
      estado: 'PENDIENTE',
      estudianteId: 5
    });

    expect(reporte).toEqual({ id: 21, estado: 'PENDIENTE' });
    expect(consultas.map(consulta => consulta.tabla)).toEqual(['objeto', 'reporte']);
    expect(consultas[0].operaciones).toContainEqual(['insert', {
      nombre: 'Mochila negra',
      descripcion: 'Mochila encontrada junto a la entrada.',
      categoria: 'Accesorios',
      foto: 'foto.jpg'
    }]);
    expect(consultas[1].operaciones).toContainEqual(['insert', {
      tipo: 'ENCONTRADO',
      fecha: '2026-11-10',
      hora: '10:30',
      lugar: 'Biblioteca',
      contacto: 'ana@ucb.edu.bo',
      detalle_privado: 'Costura roja.',
      estado: 'PENDIENTE',
      estudiante_id: 5,
      objeto_id: 31
    }]);
  });
});