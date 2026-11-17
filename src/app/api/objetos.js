export async function obtenerObjetos(
  filtros = {},
  solicitar = globalThis.fetch.bind(globalThis)
) {
  const parametros = new URLSearchParams(filtros);
  const respuesta = await solicitar(`/api/objetos?${parametros}`, {
    credentials: 'same-origin'
  });
  if (!respuesta.ok) throw new Error('No se pudieron cargar los objetos.');
  return respuesta.json();
}