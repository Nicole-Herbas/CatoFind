import { randomUUID } from 'node:crypto';
import { CATEGORIAS_REPORTE, LUGARES_REPORTE } from '../config/opcionesReportes.js';

const NOMBRE_BUCKET_REPORTES = 'reportes';
const MAXIMO_BYTES_IMAGEN = 5 * 1024 * 1024;
const ESTADOS_REVISION = ['APROBADO', 'RECHAZADO'];

function crearError(mensaje, codigo) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

function obtenerFechaLocal(fecha) {
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0')
  ].join('-');
}

function validarFecha(fecha, ahora) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const fechaObjeto = new Date(`${fecha}T00:00:00`);
  const fechaReal = [
    fechaObjeto.getFullYear(),
    String(fechaObjeto.getMonth() + 1).padStart(2, '0'),
    String(fechaObjeto.getDate()).padStart(2, '0')
  ].join('-');
  return fechaReal === fecha && fecha <= obtenerFechaLocal(ahora);
}

function validarDatosReporte(datos, ahora) {
  const titulo = String(datos.titulo ?? '').trim();
  const descripcion = String(datos.descripcion ?? '').trim();
  const categoria = String(datos.categoria ?? '').trim();
  const lugar = String(datos.lugar ?? '').trim();
  const fecha = String(datos.fecha ?? '').trim();
  const hora = String(datos.hora ?? '').trim();

  if (titulo.length < 3) throw crearError('Escribe un nombre de al menos 3 caracteres.', 'VALIDACION');
  if (!CATEGORIAS_REPORTE.includes(categoria)) throw crearError('Selecciona una categoría válida.', 'VALIDACION');
  if (!LUGARES_REPORTE.includes(lugar)) throw crearError('Selecciona un lugar válido.', 'VALIDACION');
  if (!validarFecha(fecha, ahora)) throw crearError('Selecciona una fecha válida que no sea futura.', 'VALIDACION');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) throw crearError('Indica una hora válida.', 'VALIDACION');
  if (descripcion.length < 10) throw crearError('Describe el objeto con al menos 10 caracteres.', 'VALIDACION');
}

function decodificarImagen(imagenDataUrl) {
  const coincidencia = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
    String(imagenDataUrl ?? '')
  );
  if (!coincidencia) throw crearError('La fotografía debe ser JPG, PNG o WebP.', 'VALIDACION');

  const [, tipo, contenidoBase64] = coincidencia;
  const contenido = Buffer.from(contenidoBase64, 'base64');
  if (!contenido.length || contenido.length > MAXIMO_BYTES_IMAGEN) {
    throw crearError('La fotografía supera el tamaño permitido.', 'VALIDACION');
  }

  const extension = tipo === 'jpeg' ? 'jpg' : tipo;
  return { contenido, tipoMime: `image/${tipo}`, extension };
}

async function obtenerPerfilAutenticado(supabase, usuarios, token) {
  if (!token) throw crearError('Debes iniciar sesión.', 'NO_AUTORIZADO');

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) throw crearError('Debes iniciar sesión.', 'NO_AUTORIZADO');

  const perfil = await usuarios.obtenerPorAuthUid(data.user.id);
  if (!perfil) throw crearError('La cuenta no tiene un perfil registrado.', 'NO_AUTORIZADO');
  return perfil;
}

function exigirRol(perfil, rolPermitido) {
  if (perfil.rol !== rolPermitido) {
    throw crearError('No tienes permisos para esta operación.', 'SIN_PERMISOS');
  }
}

export function crearServicioReportes(supabase, repositorio, usuarios, ahora = () => new Date()) {
  return {
    obtenerOpciones() {
      return {
        categorias: [...CATEGORIAS_REPORTE],
        lugares: [...LUGARES_REPORTE]
      };
    },

    async crear(datos) {
      const perfil = await obtenerPerfilAutenticado(supabase, usuarios, datos.token);
      exigirRol(perfil, 'ESTUDIANTE');
      validarDatosReporte(datos, ahora());
      const imagen = decodificarImagen(datos.imagen);
      const rutaImagen = `${randomUUID()}.${imagen.extension}`;
      const bucket = supabase.storage.from(NOMBRE_BUCKET_REPORTES);
      const { error: errorCarga } = await bucket.upload(rutaImagen, imagen.contenido, {
        contentType: imagen.tipoMime,
        upsert: false
      });

      if (errorCarga) throw crearError('No se pudo guardar la fotografía.', 'PERSISTENCIA');

      try {
        return await repositorio.crearReporte({
          titulo: String(datos.titulo).trim(),
          categoria: String(datos.categoria).trim(),
          lugar: String(datos.lugar).trim(),
          fecha: String(datos.fecha).trim(),
          hora: String(datos.hora).trim(),
          descripcion: String(datos.descripcion).trim(),
          detallePrivado: String(datos.detallePrivado ?? '').trim(),
          imagen: rutaImagen,
          tipo: 'ENCONTRADO',
          estado: 'PENDIENTE',
          contacto: perfil.correo_institucional,
          estudianteId: perfil.id
        });
      } catch {
        await bucket.remove([rutaImagen]);
        throw crearError('No se pudo guardar el reporte.', 'PERSISTENCIA');
      }
    },

    async listarPendientes(token) {
      const perfil = await obtenerPerfilAutenticado(supabase, usuarios, token);
      exigirRol(perfil, 'ADMINISTRATIVO');
      const reportes = await repositorio.listarPendientes();

      return Promise.all(reportes.map(async reporte => {
        if (!reporte.imagen || /^https?:\/\//i.test(reporte.imagen)) return reporte;
        const { data, error } = await supabase.storage
          .from(NOMBRE_BUCKET_REPORTES)
          .createSignedUrl(reporte.imagen, 60 * 60);
        if (error || !data?.signedUrl) {
          throw crearError('No se pudieron cargar las fotografías de los reportes.', 'PERSISTENCIA');
        }
        return { ...reporte, imagen: data.signedUrl };
      }));
    },

    async actualizarEstado({ id, estado, motivoRechazo, token }) {
      const perfil = await obtenerPerfilAutenticado(supabase, usuarios, token);
      exigirRol(perfil, 'ADMINISTRATIVO');
      if (!ESTADOS_REVISION.includes(estado)) {
        throw crearError('Selecciona un estado de revisión válido.', 'VALIDACION');
      }

      const reporte = await repositorio.actualizarEstado({
        id,
        estado,
        administrativoId: perfil.id,
        fechaRevision: obtenerFechaLocal(ahora()),
        motivoRechazo: estado === 'RECHAZADO' ? String(motivoRechazo ?? '').trim() : null
      });
      if (!reporte) throw crearError('El reporte pendiente no existe.', 'REPORTE_NO_ENCONTRADO');
      return reporte;
    }
  };
}