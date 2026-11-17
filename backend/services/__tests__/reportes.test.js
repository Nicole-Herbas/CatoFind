import { crearServicioReportes } from '../reportes.js';

const datosValidos = {
  titulo: 'Mochila negra',
  categoria: 'Accesorios',
  lugar: 'Biblioteca',
  fecha: '2026-11-10',
  hora: '10:30',
  descripcion: 'Mochila encontrada junto a la entrada.',
  detallePrivado: 'Tiene una costura roja.',
  imagen: 'data:image/jpeg;base64,Zm90bw=='
};

function crearDependencias({ rol = 'ESTUDIANTE' } = {}) {
  const supabase = {
    auth: {
      getUser: jest.fn(async () => ({ data: { user: { id: 'auth-1' } }, error: null }))
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(async () => ({ data: { path: 'reportes/foto.jpg' }, error: null })),
        createSignedUrl: jest.fn(async () => ({
          data: { signedUrl: 'https://supabase.test/foto-firmada' }, error: null
        })),
        remove: jest.fn(async () => ({ error: null }))
      }))
    }
  };
  const usuarios = {
    obtenerPorAuthUid: jest.fn(async () => ({
      id: 5,
      nombre: 'Ana Torres',
      correo_institucional: 'ana@ucb.edu.bo',
      rol
    }))
  };
  const repositorio = {
    crearReporte: jest.fn(async () => ({ id: 21, estado: 'PENDIENTE' })),
    listarPendientes: jest.fn(async () => [{
      id: 7,
      titulo: 'Mochila negra',
      categoria: 'Accesorios',
      lugar: 'Biblioteca',
      fecha: '2026-11-10',
      hora: '10:30:00',
      descripcion: 'Mochila encontrada.',
      detallePrivado: 'Costura roja.',
      imagen: 'reportes/7.jpg'
    }]),
    actualizarEstado: jest.fn(async () => ({ id: 7, estado: 'APROBADO' }))
  };

  return { supabase, usuarios, repositorio };
}

describe('reportes en Supabase', () => {
  it('guarda el reporte del estudiante y la foto en Storage', async () => {
    const { supabase, usuarios, repositorio } = crearDependencias();
    const servicio = crearServicioReportes(supabase, repositorio, usuarios);

    const reporte = await servicio.crear({ ...datosValidos, token: 'token-estudiante' });

    expect(supabase.auth.getUser).toHaveBeenCalledWith('token-estudiante');
    expect(usuarios.obtenerPorAuthUid).toHaveBeenCalledWith('auth-1');
    expect(repositorio.crearReporte).toHaveBeenCalledWith(expect.objectContaining({
      estudianteId: 5,
      contacto: 'ana@ucb.edu.bo',
      tipo: 'ENCONTRADO',
      hora: '10:30',
      detallePrivado: 'Tiene una costura roja.',
      imagen: expect.stringMatching(/^[0-9a-f-]{36}\.jpg$/)
    }));
    expect(reporte).toEqual({ id: 21, estado: 'PENDIENTE' });
  });

  it('permite a un administrador listar y revisar reportes pendientes', async () => {
    const { supabase, usuarios, repositorio } = crearDependencias({ rol: 'ADMINISTRATIVO' });
    const servicio = crearServicioReportes(supabase, repositorio, usuarios);

    const [reporte] = await servicio.listarPendientes('token-admin');
    const actualizado = await servicio.actualizarEstado({
      id: '7', estado: 'APROBADO', token: 'token-admin'
    });

    expect(reporte.imagen).toBe('https://supabase.test/foto-firmada');
    expect(reporte.detallePrivado).toBe('Costura roja.');
    expect(repositorio.actualizarEstado).toHaveBeenCalledWith(expect.objectContaining({
      id: '7', estado: 'APROBADO', administrativoId: 5
    }));
    expect(actualizado).toEqual({ id: 7, estado: 'APROBADO' });
  });

  it('no permite a un estudiante revisar reportes', async () => {
    const { supabase, usuarios, repositorio } = crearDependencias();
    const servicio = crearServicioReportes(supabase, repositorio, usuarios);

    await expect(servicio.listarPendientes('token-estudiante'))
      .rejects.toMatchObject({ codigo: 'SIN_PERMISOS' });
    expect(repositorio.listarPendientes).not.toHaveBeenCalled();
  });
});
