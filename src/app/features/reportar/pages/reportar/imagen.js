
const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

const LIMITE_BYTES = 12 * 1024 * 1024;

export function validarArchivoImagen(archivo) {

  if (!archivo || !TIPOS_PERMITIDOS.includes(archivo.type)) {
    return {
      valido: false,
      error: 'Selecciona una fotografía JPG, PNG o WebP.'
    };
  }

  if (archivo.size > LIMITE_BYTES) {
    return {
      valido: false,
      error: 'La fotografía no puede superar los 12 MB.'
    };
  }

  return { valido: true, error: '' };
}

export function calcularDimensiones(ancho, alto, maximo = 1000) {

  const escala = Math.min(
    1,
    maximo / Math.max(ancho, alto)
  );

  return {
    ancho: Math.round(ancho * escala),
    alto: Math.round(alto * escala)
  };
}

export async function convertirImagen(archivo) {

  const validacion = validarArchivoImagen(archivo);

  if (!validacion.valido) {
    throw new Error(validacion.error);
  }

  const contenido = await new Promise((resolver, rechazar) => {
    const lector = new FileReader();

    lector.onload = () => resolver(lector.result);

    lector.onerror = () => rechazar(
      new Error('No se pudo leer la fotografía.')
    );

    lector.readAsDataURL(archivo);
  });

  const imagen = await new Promise((resolver, rechazar) => {
    const elemento = new Image();

    elemento.onload = () => resolver(elemento);

    elemento.onerror = () => rechazar(
      new Error('No se pudo abrir la fotografía.')
    );

    elemento.src = contenido;
  });

  const dimensiones = calcularDimensiones(
    imagen.naturalWidth,
    imagen.naturalHeight
  );

  if (!dimensiones.ancho || !dimensiones.alto) {
    throw new Error('La fotografía no es válida.');
  }

  const canvas = document.createElement('canvas');

  canvas.width = dimensiones.ancho;
  canvas.height = dimensiones.alto;

  const contexto = canvas.getContext('2d');

  if (!contexto) {
    throw new Error('No se pudo procesar la fotografía.');
  }

  contexto.drawImage(
    imagen,
    0,
    0,
    dimensiones.ancho,
    dimensiones.alto
  );

  const resultado = canvas.toDataURL('image/jpeg', 0.72);

  if (resultado.length > 1500000) {
    throw new Error('La fotografía es demasiado grande para guardar.');
  }

  return resultado;
}
