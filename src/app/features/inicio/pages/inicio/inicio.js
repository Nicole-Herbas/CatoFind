import { ObjetoService } from '../../services/ObjetoService.js';

const CATEGORIAS = ['Todos', 'Electrónica', 'Ropa', 'Documentos', 'Mascotas', 'Accesorios', 'Otros'];

const service = new ObjetoService();
let categoriaActual = 'Todos';

/* ── Helpers ── */

function formatFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'T00:00:00');
  return fecha.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function crearTarjeta(objeto) {
  const li = document.createElement('li');
  li.className = 'tarjeta';
  li.setAttribute('tabindex', '0');
  li.setAttribute('aria-label', `Objeto encontrado: ${objeto.titulo}`);
  li.dataset.id = objeto.id;

  li.innerHTML = `
    <div class="tarjeta__img-wrap">
      <img
        class="tarjeta__img"
        src="${objeto.imagen}"
        alt="${objeto.titulo}"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&q=80'"
      />
      <span class="tarjeta__estado">${objeto.estado}</span>
    </div>
    <div class="tarjeta__body">
      <p class="tarjeta__titulo">${objeto.titulo}</p>
      <div class="tarjeta__meta">
        <span class="tarjeta__meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${objeto.lugar}
        </span>
        <span class="tarjeta__meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${formatFecha(objeto.fecha)}
        </span>
      </div>
      <span class="tarjeta__categoria">${objeto.categoria}</span>
    </div>
  `;

  return li;
}

/* ── Render ── */

function renderTarjetas(objetos) {
  const grid = document.getElementById('objetos-grid');
  const empty = document.getElementById('objetos-empty');

  grid.innerHTML = '';

  if (objetos.length === 0) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  const fragment = document.createDocumentFragment();
  objetos.forEach((obj) => fragment.appendChild(crearTarjeta(obj)));
  grid.appendChild(fragment);
}

function renderFiltros() {
  const lista = document.getElementById('filtros-lista');
  lista.innerHTML = '';

  CATEGORIAS.forEach((cat) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = cat;
    btn.className = 'filtro-btn' + (cat === categoriaActual ? ' filtro-btn--active' : '');
    btn.id = `filtro-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    btn.setAttribute('aria-pressed', cat === categoriaActual ? 'true' : 'false');
    btn.dataset.categoria = cat;
    li.appendChild(btn);
    lista.appendChild(li);
  });
}

/* ── Init ── */

document.addEventListener('DOMContentLoaded', () => {
  renderFiltros();
  renderTarjetas(service.obtenerTodos());

  // ── Filtros de categoría ──
  document.getElementById('filtros-lista').addEventListener('click', (e) => {
    const btn = e.target.closest('.filtro-btn');
    if (!btn) return;

    categoriaActual = btn.dataset.categoria;

    // Actualizar estados visuales
    document.querySelectorAll('.filtro-btn').forEach((b) => {
      const isActive = b.dataset.categoria === categoriaActual;
      b.classList.toggle('filtro-btn--active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    renderTarjetas(service.filtrarPorCategoria(categoriaActual));
  });

  // ── Buscador ──
  const formBuscar = document.getElementById('form-buscar');
  const inputBuscar = document.getElementById('input-buscar');

  function buscar() {
    const query = inputBuscar.value.trim();
    // Primero aplica filtro de categoría, luego busca dentro del resultado
    const base = service.filtrarPorCategoria(categoriaActual);
    if (!query) {
      renderTarjetas(base);
      return;
    }
    const resultado = base.filter((o) =>
      o.titulo.toLowerCase().includes(query.toLowerCase())
    );
    renderTarjetas(resultado);
  }

  // Búsqueda en tiempo real al escribir
  inputBuscar.addEventListener('input', buscar);

  // También al enviar el formulario (Enter o click en "Buscar")
  formBuscar.addEventListener('submit', (e) => {
    e.preventDefault();
    buscar();
  });
});
