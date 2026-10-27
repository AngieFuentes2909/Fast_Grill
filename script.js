
// FAST GRILL — BRASA & HUMO
// Lógica principal de la tienda interactiva (script.js)
//
// Ciclo de funcionamiento:
//   Al abrir la página  → cargarPedido() (localStorage) → pintar catálogo y pedido
//   En cada acción      → actualizar estado → guardarPedido() → volver a pintar


// 1. Constantes y configuración 
const CLAVE_PEDIDO = "fast-grill-pedido-v1";
const CLAVE_PEDIDO_ANTERIOR = "fast-grill-comanda-v1";
const CLAVE_FILTRO = "fast-grill-filtro-v1";

// 2. Estado de la aplicación
// Se guarda { "doble-brasa": 2, "papas-rusticas": 1 } en el navegador.
let pedido = {};
let filtroActual = "todo";

// 3. Referencias a elementos del DOM
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

// El HTML es la única fuente de datos del catálogo, incluidas sus imágenes.
const PRODUCTOS = Array.from(
  contenedorProductos.querySelectorAll(".tarjeta-producto")
).map((tarjeta) => {
  const precio = Number(tarjeta.dataset.precio);
  const precioVisible = tarjeta.querySelector("[data-precio-visible]");

  if (precioVisible) {
    precioVisible.textContent = formatearPesos(precio);
  }

  return {
    id: tarjeta.dataset.productoId,
    categoria: tarjeta.dataset.categoria,
    nombre: tarjeta.querySelector(".nombre-producto").textContent.trim(),
    precio,
    tarjeta
  };
});


// 4. Funciones de utilidad

// función que convierte un número a formato de pesos colombianos: 28000 → "$28.000"
function formatearPesos(valor) {
  return "$" + Number(valor).toLocaleString("es-CO");
}

// Busca un producto dentro del catálogo por su id
function buscarProductoPorId(productoId) {
  return PRODUCTOS.find((producto) => producto.id === productoId) || null;
}



// 5. Persistencia con localStorage y sessionStorage

// Guarda el objeto pedido en localStorage.
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


function actualizarFiltroCatalogo() {
  PRODUCTOS.forEach((producto) => {
    producto.tarjeta.hidden = filtroActual !== "todo"
      && producto.categoria !== filtroActual;
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
  actualizarFiltroCatalogo();
}


// 7. Cálculos del pedido

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


// 8. Pintar el pedido

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

  // Por cada producto del pedido, clonamos la plantilla de fila.
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

// Sincroniza las filas, los importes y el estado del botón de finalizar.
function actualizarTodo() {
  const items = obtenerItemsPedido();
  mostrarListaPedido(items);
  mostrarTotales(items);
}

// 9. Acciones del usuario: agregar, modificar, quitar y animar

// Animación aplicada con JS 
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
  boton.textContent = "¡En la parrilla! 🔥";
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
  const productoId = tarjeta && tarjeta.dataset.productoId;
  if (!productoId || !buscarProductoPorId(productoId)) return;

  pedido[productoId] = (pedido[productoId] || 0) + 1;

  guardarPedido();
  actualizarTodo();

  // Animaciones de confirmación
  darFeedbackBotonAgregar(boton);
  animarElemento(contadorPedido);

  if (notaFinalizar) {
    notaFinalizar.textContent = "El pedido se conserva en este dispositivo.";
  }
}

// Aumenta, disminuye o elimina un producto desde los botones del pedido.
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

// Abre o cierra el panel del pedido.
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

// Simula la confirmación académica del pedido y limpia el carrito local.
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

// 10. Eventos e inicio

function iniciarTienda() {
  // Actualizar año del footer automáticamente
  if (anioActual) {
    anioActual.textContent = String(new Date().getFullYear());
  }

  // 1. Cargar datos persistidos
  cargarPedido();
  cargarFiltro();

  // 2. Sincronizar la interfaz inicial con los datos del HTML y el almacenamiento.
  actualizarBotonesFiltro();
  actualizarFiltroCatalogo();
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
      actualizarFiltroCatalogo();
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

// iniciar dom
iniciarTienda();
