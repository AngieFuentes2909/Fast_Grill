// ============================================================
// FAST GRILL — BRASA & HUMO
// Lógica principal de la tienda interactiva (script.js)
//
// Ciclo de funcionamiento:
//   Al abrir la página  → cargarPedido() (localStorage) → renderizarCatalogo() y pintar pedido
//   En cada acción      → actualizar estado → guardarPedido() → volver a pintar
// ============================================================

// 1. Constantes y configuración
const CLAVE_PEDIDO = "fast-grill-pedido-v1";
const CLAVE_PEDIDO_ANTERIOR = "fast-grill-comanda-v1";
const CLAVE_FILTRO = "fast-grill-filtro-v1";

// 2. Catálogo de productos (Array de objetos JS — Requisito de la rúbrica)
const PRODUCTOS = [
  {
    id: "doble-brasa",
    categoria: "hamburguesas",
    nombre: "Doble Brasa Burger",
    descripcion: "Carne madurada, queso fundido y salsa de la casa.",
    precio: 28000,
    imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    srcset: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80 400w, https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80 700w, https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80 1000w",
    alt: "Doble hamburguesa con queso a la parrilla",
    etiqueta: "8 min en brasa",
    textoBoton: "Tirar a la parrilla"
  },
  {
    id: "costillas-st-louis",
    categoria: "ahumados",
    nombre: "Costillas St. Louis BBQ",
    descripcion: "Costilla ahumada lentamente con glaseado BBQ.",
    precio: 42000,
    imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80",
    srcset: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80 400w, https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80 700w, https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80 1000w",
    alt: "Costillas BBQ glaseadas y ahumadas",
    etiqueta: "8 min en brasa",
    textoBoton: "Tirar a la parrilla",
    anclaSeccion: "ahumados"
  },
  {
    id: "choripan-autor",
    categoria: "choripanes",
    nombre: "Choripán de Autor",
    descripcion: "Chorizo artesanal, pan tostado y chimichurri.",
    precio: 22000,
    imagen: "https://images.unsplash.com/photo-1705512557389-841efbde54db?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    srcset: "https://images.unsplash.com/photo-1705512557389-841efbde54db?auto=format&fit=crop&w=400&q=80 400w, https://images.unsplash.com/photo-1705512557389-841efbde54db?auto=format&fit=crop&w=700&q=80 700w, https://images.unsplash.com/photo-1705512557389-841efbde54db?auto=format&fit=crop&w=1000&q=80 1000w",
    alt: "Choripán con chimichurri",
    etiqueta: "8 min en brasa",
    textoBoton: "Tirar a la parrilla"
  },
  {
    id: "papas-rusticas",
    categoria: "acompanamientos",
    nombre: "Papas Rústicas",
    descripcion: "Papas doradas con especias de la casa.",
    precio: 12000,
    imagen: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80",
    srcset: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80 400w, https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80 700w, https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1000&q=80 1000w",
    alt: "Papas rústicas doradas",
    etiqueta: "Para compartir",
    textoBoton: "Tirar a la parrilla"
  },
  {
    id: "limonada-casa",
    categoria: "bebidas",
    nombre: "Limonada de la Casa",
    descripcion: "Limón natural, hielo y un toque de hierbabuena.",
    precio: 9000,
    imagen: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?q=80&w=393&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    srcset: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=400&q=80 400w, https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=700&q=80 700w, https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=1000&q=80 1000w",
    alt: "Bebida cítrica fría con hielo",
    etiqueta: "Bien fría",
    textoBoton: "Agregar bebida"
  }
];

// 3. Estado de la aplicación
// Se guarda { "doble-brasa": 2, "papas-rusticas": 1 } en el navegador.
let pedido = {};
let filtroActual = "todo";

// 4. Referencias a elementos del DOM
const contenedorProductos = document.querySelector("#lista-productos");
const contenedorFiltros = document.querySelector(".filtros-categoria");
const botonesFiltro = document.querySelectorAll(".boton-filtro");
const enlaceAhumados = document.querySelector('.enlace-navegacion[href="#ahumados"]');

const panelPedido = document.querySelector("#panel-pedido");
const botonesAlternarPedido = document.querySelectorAll('[data-accion="alternar-pedido"]');
const listaProductosPedido = document.querySelector("#productos-pedido");
const plantillaFilaPedido = document.querySelector("#plantilla-fila-pedido");

const contadorPedido = document.querySelector("[data-cantidad-pedido]");
const subtotalPedido = document.querySelector("[data-subtotal-pedido]");
const totalesPedido = document.querySelectorAll("[data-total-pedido]");

const botonFinalizar = document.querySelector('[data-accion="finalizar"]');
const notaFinalizar = document.querySelector("#nota-finalizar");
const numeroPedido = document.querySelector("[data-numero-pedido]");
const anioActual = document.querySelector("[data-anio-actual]");

// ============================================================
// 5. Funciones de utilidad
// ============================================================

// Convierte un número a formato de pesos colombianos: 28000 → "$28.000"
function formatearPesos(valor) {
  return "$" + Number(valor).toLocaleString("es-CO");
}

// Busca un producto dentro del catálogo por su id
function buscarProductoPorId(productoId) {
  return PRODUCTOS.find((producto) => producto.id === productoId) || null;
}

// ============================================================
// 6. Persistencia con localStorage y sessionStorage
// ============================================================

// Guarda el objeto pedido en localStorage
function guardarPedido() {
  localStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido));
  localStorage.removeItem(CLAVE_PEDIDO_ANTERIOR);
}

// Recupera el pedido guardado en localStorage al abrir o recargar la página
function cargarPedido() {
  const textoGuardado = localStorage.getItem(CLAVE_PEDIDO)
    || localStorage.getItem(CLAVE_PEDIDO_ANTERIOR);

  if (!textoGuardado) {
    pedido = {};
    return;
  }

  try {
    const datos = JSON.parse(textoGuardado);
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      pedido = {};
      return;
    }

    pedido = Object.fromEntries(
      Object.entries(datos).filter(([productoId, cantidad]) =>
        buscarProductoPorId(productoId)
        && Number.isSafeInteger(Number(cantidad))
        && Number(cantidad) > 0
      ).map(([productoId, cantidad]) => [productoId, Number(cantidad)])
    );
  } catch {
    pedido = {};
  }
}

// Recuerda la categoría seleccionada en la pestaña actual (sessionStorage)
function cargarFiltro() {
  const filtroGuardado = sessionStorage.getItem(CLAVE_FILTRO);
  const filtrosValidos = new Set(
    Array.from(botonesFiltro, (boton) => boton.dataset.filtro)
  );

  if (filtrosValidos.has(filtroGuardado)) {
    filtroActual = filtroGuardado;
  }
}

// ============================================================
// 7. Renderizado dinámico del catálogo desde el array PRODUCTOS
// ============================================================

// Construye y pinta las tarjetas en #lista-productos desde el array de objetos JS
function renderizarCatalogo() {
  if (!contenedorProductos) return;

  contenedorProductos.innerHTML = "";

  const productosFiltrados = PRODUCTOS.filter((producto) => {
    if (filtroActual === "todo") return true;
    return producto.categoria === filtroActual;
  });

  productosFiltrados.forEach((producto) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-producto";

    if (producto.anclaSeccion) {
      tarjeta.id = producto.anclaSeccion;
    }

    tarjeta.dataset.productoId = producto.id;
    tarjeta.dataset.categoria = producto.categoria;
    tarjeta.dataset.precio = String(producto.precio);

    tarjeta.innerHTML = `
      <div class="foto-producto-contenedor">
        <img
          class="foto-producto"
          src="${producto.imagen}"
          srcset="${producto.srcset}"
          sizes="(max-width: 420px) 92vw, (max-width: 720px) 46vw, (max-width: 1050px) 42vw, 22vw"
          width="700"
          height="500"
          alt="${producto.alt}"
          loading="lazy"
          decoding="async"
        />
        <span class="etiqueta-producto">${producto.etiqueta}</span>
      </div>

      <div class="datos-producto">
        <h3 class="nombre-producto">${producto.nombre}</h3>
        <p class="descripcion-producto">${producto.descripcion}</p>
        <p class="precio-producto" data-precio-visible>${formatearPesos(producto.precio)}</p>
        <button
          class="boton-agregar"
          type="button"
          data-accion="agregar-a-pedido"
          data-producto-id="${producto.id}"
        >
          ${producto.textoBoton}
        </button>
      </div>
    `;

    contenedorProductos.appendChild(tarjeta);
  });
}

// Actualiza el estado visual (.activo y aria-pressed) de los botones de filtro
function actualizarBotonesFiltro() {
  botonesFiltro.forEach((boton) => {
    const esActivo = boton.dataset.filtro === filtroActual;
    boton.classList.toggle("activo", esActivo);
    boton.setAttribute("aria-pressed", String(esActivo));
  });
}

// Cambia la categoría activa cuando el usuario hace clic en un filtro
function manejarCambioFiltro(evento) {
  const boton = evento.target.closest(".boton-filtro");
  if (!boton) return;

  filtroActual = boton.dataset.filtro || "todo";
  sessionStorage.setItem(CLAVE_FILTRO, filtroActual);

  actualizarBotonesFiltro();
  renderizarCatalogo();
}

// ============================================================
// 8. Cálculos del pedido (usando .reduce())
// ============================================================

// Convierte el objeto pedido en una lista detallada de items con sus datos completos
function obtenerItemsPedido() {
  return Object.entries(pedido)
    .map(([productoId, cantidad]) => {
      const producto = buscarProductoPorId(productoId);
      if (!producto || cantidad <= 0) return null;
      return {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: Number(cantidad),
        subtotal: producto.precio * Number(cantidad)
      };
    })
    .filter((item) => item !== null);
}

// Suma el total de unidades en el pedido usando .reduce()
function calcularCantidadTotal(items) {
  return items.reduce((acumulado, item) => acumulado + item.cantidad, 0);
}

// Suma el valor total en pesos del pedido usando .reduce()
function calcularMontoTotal(items) {
  return items.reduce((acumulado, item) => acumulado + item.subtotal, 0);
}

// ============================================================
// 9. Pintar el pedido
// ============================================================

function mostrarListaPedido(items) {
  if (!listaProductosPedido || !plantillaFilaPedido) return;

  listaProductosPedido.innerHTML = "";

  // Si no hay productos, mostramos el mensaje de pedido vacío
  if (items.length === 0) {
    const itemVacio = document.createElement("li");
    itemVacio.className = "pedido-vacio";
    itemVacio.setAttribute("data-pedido-vacio", "");
    itemVacio.textContent = "Tu pedido está vacío. Agrega algo de la brasa.";
    listaProductosPedido.appendChild(itemVacio);
    return;
  }

  // Por cada producto del pedido, clonamos la plantilla de fila
  items.forEach((item) => {
    const clon = plantillaFilaPedido.content.cloneNode(true);
    const fila = clon.querySelector("[data-fila-pedido]");

    fila.dataset.productoId = item.id;
    clon.querySelector("[data-nombre-producto]").textContent = item.nombre;
    clon.querySelector("[data-precio-producto]").textContent = formatearPesos(item.subtotal);
    clon.querySelector("[data-cantidad-producto]").textContent = String(item.cantidad);

    listaProductosPedido.appendChild(clon);
  });
}

function mostrarTotales(items) {
  const cantidadUnidades = calcularCantidadTotal(items);
  const montoTotal = calcularMontoTotal(items);
  const textoTotal = formatearPesos(montoTotal);

  // Actualizar contador de unidades en el encabezado
  if (contadorPedido) {
    contadorPedido.textContent = String(cantidadUnidades);
  }

  // Actualizar subtotal
  if (subtotalPedido) {
    subtotalPedido.textContent = textoTotal;
  }

  // Actualizar todos los lugares donde aparece data-total-pedido (header y factura)
  totalesPedido.forEach((elementoTotal) => {
    elementoTotal.textContent = textoTotal;
  });

  // Habilitar o deshabilitar el botón de finalizar pedido
  if (botonFinalizar) {
    botonFinalizar.disabled = cantidadUnidades === 0;
  }
}

// Sincroniza las filas, los importes y el estado del botón de finalizar
function actualizarTodo() {
  const items = obtenerItemsPedido();
  mostrarListaPedido(items);
  mostrarTotales(items);
}

// ============================================================
// 10. Acciones del usuario: agregar, modificar, quitar y animar
// ============================================================

// Animación aplicada con JS (Requisito técnico de la rúbrica)
function animarElemento(elemento) {
  if (!elemento || typeof elemento.animate !== "function"
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  elemento.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.16)" },
      { transform: "scale(1)" }
    ],
    {
      duration: 280,
      easing: "ease-out"
    }
  );
}

// Da feedback visual en el botón cuando se agrega un producto a la parrilla
function darFeedbackBotonAgregar(boton) {
  if (!boton) return;

  const textoOriginal = boton.dataset.textoOriginal || boton.textContent.trim();
  boton.dataset.textoOriginal = textoOriginal;
  boton.textContent = "¡En la parrilla!";
  boton.classList.add("agregado");

  animarElemento(boton);

  setTimeout(() => {
    boton.textContent = textoOriginal;
    boton.classList.remove("agregado");
  }, 900);
}

// Agrega una unidad del producto al hacer clic en el catálogo
function manejarAgregarAPedido(evento) {
  const boton = evento.target.closest('[data-accion="agregar-a-pedido"]');
  if (!boton) return;

  const tarjeta = boton.closest(".tarjeta-producto");
  const productoId = boton.dataset.productoId || (tarjeta && tarjeta.dataset.productoId);
  if (!productoId || !buscarProductoPorId(productoId)) return;

  pedido[productoId] = (pedido[productoId] || 0) + 1;

  guardarPedido();
  actualizarTodo();

  // Animaciones de confirmación
  darFeedbackBotonAgregar(boton);
  animarElemento(contadorPedido);

  if (notaFinalizar) {
    notaFinalizar.textContent = "Simulación académica: el pedido no se envía a un sistema externo.";
  }
}

// Aumenta, disminuye o elimina un producto desde los botones del pedido
function manejarControlesPedido(evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;

  const fila = boton.closest("[data-fila-pedido]");
  if (!fila) return;

  const productoId = fila.dataset.productoId;
  if (!productoId) return;

  const accion = boton.dataset.accion;

  if (accion === "aumentar") {
    pedido[productoId] = (pedido[productoId] || 0) + 1;
  } else if (accion === "disminuir") {
    pedido[productoId] = (pedido[productoId] || 0) - 1;
    if (pedido[productoId] <= 0) {
      delete pedido[productoId];
    }
  } else if (accion === "quitar") {
    delete pedido[productoId];
  } else {
    return;
  }

  guardarPedido();
  actualizarTodo();
  animarElemento(contadorPedido);
}

// Abre o cierra el panel del pedido
function alternarPanelPedido() {
  if (!panelPedido) return;

  const estaOculto = panelPedido.classList.toggle("pedido-oculto");
  const expandido = !estaOculto;
  const zonaTienda = panelPedido.closest(".zona-tienda");

  if (zonaTienda) {
    zonaTienda.classList.toggle("pedido-cerrado", estaOculto);
  }

  botonesAlternarPedido.forEach((boton) => {
    boton.setAttribute("aria-expanded", String(expandido));
  });
}

// Simula la confirmación del pedido y limpia el carrito local
function finalizarPedido() {
  const items = obtenerItemsPedido();
  if (items.length === 0) return;

  const codigoOrden = "#FG-" + Math.floor(100 + Math.random() * 900);

  pedido = {};
  guardarPedido();
  actualizarTodo();

  if (numeroPedido) {
    numeroPedido.textContent = codigoOrden;
  }

  if (notaFinalizar) {
    notaFinalizar.textContent = `Pedido ${codigoOrden} simulado. Esta demo no envía órdenes a un sistema externo.`;
    animarElemento(notaFinalizar);
  }
}

// ============================================================
// 11. Eventos e inicio
// ============================================================

function iniciarTienda() {
  // Actualizar año del footer automáticamente
  if (anioActual) {
    anioActual.textContent = String(new Date().getFullYear());
  }

  // 1. Cargar datos persistidos
  cargarPedido();
  cargarFiltro();

  // 2. Renderizar catálogo dinámicamente desde el array PRODUCTOS y pintar el pedido
  actualizarBotonesFiltro();
  renderizarCatalogo();
  actualizarTodo();

  // 3. Escuchadores de eventos (Delegación de eventos)
  if (contenedorProductos) {
    contenedorProductos.addEventListener("click", manejarAgregarAPedido);
  }

  if (contenedorFiltros) {
    contenedorFiltros.addEventListener("click", manejarCambioFiltro);
  }

  if (enlaceAhumados) {
    enlaceAhumados.addEventListener("click", () => {
      filtroActual = "ahumados";
      sessionStorage.setItem(CLAVE_FILTRO, filtroActual);
      actualizarBotonesFiltro();
      renderizarCatalogo();
    });
  }

  if (listaProductosPedido) {
    listaProductosPedido.addEventListener("click", manejarControlesPedido);
  }

  botonesAlternarPedido.forEach((boton) => {
    boton.addEventListener("click", alternarPanelPedido);
  });

  if (botonFinalizar) {
    botonFinalizar.addEventListener("click", finalizarPedido);
  }
}

// Arrancar tienda
iniciarTienda();
