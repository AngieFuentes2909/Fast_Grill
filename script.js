
// FAST GRILL — BRASA & HUMO
// Lógica principal de la tienda interactiva (script.js)
//
// Ciclo de funcionamiento:
//   Al abrir la página  → cargarComanda() (localStorage) → pintar catálogo y pedido
//   En cada acción      → actualizar estado → guardarComanda() → volver a pintar


// 1. Constantes y configuración 
const CLAVE_COMANDA = "fast-grill-comanda-v1";
const CLAVE_FILTRO = "fast-grill-filtro-v1";
const META_PROMOCION = 60000;

// 2. Catálogo de productos
const PRODUCTOS = [
  {
    id: "doble-brasa",
    categoria: "hamburguesas",
    nombre: "Doble Brasa Burger",
    descripcion: "Carne madurada, queso fundido y salsa de la casa.",
    precio: 28000,
    imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
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
    alt: "Costillas BBQ glaseadas y ahumadas",
    etiqueta: "8 min en brasa",
    textoBoton: "Tirar a la parrilla",
    anclaSeccion: "ahumados"
  },
  {
    id: "choripan-autor",
    categoria: "hamburguesas",
    nombre: "Choripán de Autor",
    descripcion: "Chorizo artesanal, pan tostado y chimichurri.",
    precio: 22000,
    imagen: "https://images.unsplash.com/photo-1612392062798-2dbaa916af7e?auto=format&fit=crop&w=700&q=80",
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
    imagen: "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=700&q=80",
    alt: "Bebida cítrica fría con hielo",
    etiqueta: "Bien fría",
    textoBoton: "Agregar bebida"
  }
];

//  3. Estado de la aplicación 
// Guardamos { "doble-brasa": 2, "papas-rusticas": 1 } como pide el index.html
let comanda = {};
let filtroActual = "todo";

//  4. Referencias a elementos del DOM 
const contenedorProductos = document.querySelector("#lista-productos");
const contenedorFiltros = document.querySelector(".filtros-categoria");
const botonesFiltro = document.querySelectorAll(".boton-filtro");

const panelComanda = document.querySelector("#panel-comanda");
const botonesAlternarComanda = document.querySelectorAll('[data-accion="alternar-comanda"]');
const listaProductosComanda = document.querySelector("#productos-comanda");
const plantillaFilaComanda = document.querySelector("#plantilla-fila-comanda");

const contadorComanda = document.querySelector("[data-cantidad-comanda]");
const subtotalComanda = document.querySelector("[data-subtotal-comanda]");
const totalesComanda = document.querySelectorAll("[data-total-comanda]");

const barraProgresoContenedor = document.querySelector(".barra-progreso");
const barraProgresoRelleno = document.querySelector("[data-progreso-promocion]");
const avisoComanda = document.querySelector(".aviso-comanda");

const botonFinalizar = document.querySelector('[data-accion="finalizar"]');
const notaFinalizar = document.querySelector("#nota-finalizar");
const numeroComanda = document.querySelector("[data-numero-comanda]");
const anioActual = document.querySelector("[data-anio-actual]");


// 5. Funciones de utilidad

// función que convierte un número a formato de pesos colombianos: 28000 → "$28.000"
function formatearPesos(valor) {
  return "$" + Number(valor).toLocaleString("es-CO");
}

// Busca un producto dentro del catálogo por su id
function buscarProductoPorId(productoId) {
  return PRODUCTOS.find((producto) => producto.id === productoId) || null;
}



// 6. Persistencia con localStorage y sessionStorage

// Guarda el objeto comanda en localStorage bajo la clave fast-grill-comanda-v1
function guardarComanda() {
  localStorage.setItem(CLAVE_COMANDA, JSON.stringify(comanda));
}

// Recupera el pedido guardado en localStorage al abrir o recargar la página
function cargarComanda() {
  const textoGuardado = localStorage.getItem(CLAVE_COMANDA);

  if (!textoGuardado) {
    comanda = {};
    return;
  }

  try {
    const datos = JSON.parse(textoGuardado);
    if (datos && typeof datos === "object" && !Array.isArray(datos)) {
      comanda = datos;
    } else {
      comanda = {};
    }
  } catch (error) {
    comanda = {};
  }
}

// Recuerda la categoría seleccionada en la pestaña actual (sessionStorage)
function cargarFiltro() {
  const filtroGuardado = sessionStorage.getItem(CLAVE_FILTRO);
  if (filtroGuardado) {
    filtroActual = filtroGuardado;
  }
}


// 7. Renderizado dinámico del catálogo de productos

// Construye y pinta las tarjetas en #lista-productos desde el array PRODUCTOS
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
    tarjeta.dataset.nombre = producto.nombre;
    tarjeta.dataset.precio = String(producto.precio);

    tarjeta.innerHTML = `
      <div class="foto-producto-contenedor">
        <img
          class="foto-producto"
          src="${producto.imagen}"
          alt="${producto.alt}"
          loading="lazy"
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
          data-accion="agregar-a-comanda"
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


// 8. Cálculos del carrito de compras (usando .reduce())

// Convierte el objeto comanda en una lista detallada de items con sus datos completos
function obtenerItemsComanda() {
  return Object.entries(comanda)
    .map(([productoId, cantidad]) => {
      const producto = buscarProductoPorId(productoId);
      if (!producto || cantidad <= 0) return null;
      return {
        ...producto,
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


// 9. Pintar el carrito (Comanda) y barra de promoción

function mostrarListaComanda(items) {
  if (!listaProductosComanda) return;

  listaProductosComanda.innerHTML = "";

  // Si no hay productos, mostramos el mensaje de pedido vacío
  if (items.length === 0) {
    const itemVacio = document.createElement("li");
    itemVacio.className = "comanda-vacia";
    itemVacio.setAttribute("data-comanda-vacia", "");
    itemVacio.textContent = "Tu pedido está vacío. Agrega algo de la brasa.";
    listaProductosComanda.appendChild(itemVacio);
    return;
  }

  // Por cada producto en la comanda, clonamos el <template id="plantilla-fila-comanda">
  items.forEach((item) => {
    const clon = plantillaFilaComanda.content.cloneNode(true);
    const fila = clon.querySelector("[data-fila-comanda]");

    fila.dataset.productoId = item.id;
    clon.querySelector("[data-nombre-producto]").textContent = item.nombre;
    clon.querySelector("[data-precio-producto]").textContent = formatearPesos(item.subtotal);
    clon.querySelector("[data-cantidad-producto]").textContent = String(item.cantidad);

    listaProductosComanda.appendChild(clon);
  });
}

function mostrarTotalesYPromocion(items) {
  const cantidadUnidades = calcularCantidadTotal(items);
  const montoTotal = calcularMontoTotal(items);
  const textoTotal = formatearPesos(montoTotal);

  // Actualizar contador de unidades en el encabezado
  if (contadorComanda) {
    contadorComanda.textContent = String(cantidadUnidades);
  }

  // Actualizar subtotal
  if (subtotalComanda) {
    subtotalComanda.textContent = textoTotal;
  }

  // Actualizar todos los lugares donde aparece data-total-comanda (header y factura)
  totalesComanda.forEach((elementoTotal) => {
    elementoTotal.textContent = textoTotal;
  });

  // Habilitar o deshabilitar el botón de finalizar pedido
  if (botonFinalizar) {
    botonFinalizar.disabled = cantidadUnidades === 0;
  }

  // Actualizar barra de progreso para la promoción de papas rústicas gratis
  const porcentaje = Math.min(100, Math.round((montoTotal / META_PROMOCION) * 100));

  if (barraProgresoRelleno) {
    barraProgresoRelleno.style.width = porcentaje + "%";
  }

  if (barraProgresoContenedor) {
    barraProgresoContenedor.setAttribute("aria-valuenow", String(porcentaje));
  }

  if (avisoComanda) {
    if (montoTotal === 0) {
      avisoComanda.textContent = "¡Ya casi desbloqueas papas rústicas gratis! 🍟";
    } else if (montoTotal < META_PROMOCION) {
      const faltante = META_PROMOCION - montoTotal;
      avisoComanda.textContent = `¡Te faltan ${formatearPesos(faltante)} para papas rústicas gratis! 🍟`;
    } else {
      avisoComanda.textContent = "¡Desbloqueaste papas rústicas GRATIS en tu pedido! 🍟🔥";
    }
  }
}

// Función orquestadora que sincroniza toda la interfaz de la comanda
function actualizarTodo() {
  const items = obtenerItemsComanda();
  mostrarListaComanda(items);
  mostrarTotalesYPromocion(items);
}

// 10. Acciones del usuario: Agregar, Modificar, Eliminar y Animar

// Animación aplicada con JS 
function animarElemento(elemento) {
  if (!elemento || typeof elemento.animate !== "function") return;

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
function manejarAgregarAComanda(evento) {
  const boton = evento.target.closest('[data-accion="agregar-a-comanda"]');
  if (!boton) return;

  const productoId = boton.dataset.productoId;
  if (!productoId || !buscarProductoPorId(productoId)) return;

  comanda[productoId] = (comanda[productoId] || 0) + 1;

  guardarComanda();
  actualizarTodo();

  // Animaciones de confirmación
  darFeedbackBotonAgregar(boton);
  animarElemento(contadorComanda);

  if (notaFinalizar) {
    notaFinalizar.textContent = "El pedido se conserva en este dispositivo.";
  }
}

// Aumenta, disminuye o elimina un producto desde los botones dentro de la comanda
function manejarControlesComanda(evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;

  const fila = boton.closest("[data-fila-comanda]");
  if (!fila) return;

  const productoId = fila.dataset.productoId;
  if (!productoId) return;

  const accion = boton.dataset.accion;

  if (accion === "aumentar") {
    comanda[productoId] = (comanda[productoId] || 0) + 1;
  } else if (accion === "disminuir") {
    comanda[productoId] = (comanda[productoId] || 0) - 1;
    if (comanda[productoId] <= 0) {
      delete comanda[productoId];
    }
  } else if (accion === "quitar") {
    delete comanda[productoId];
  } else {
    return;
  }

  guardarComanda();
  actualizarTodo();
  animarElemento(contadorComanda);
}

// Abre o cierra el panel lateral de la comanda en pantallas móviles o al pulsar el botón
function alternarPanelComanda() {
  if (!panelComanda) return;

  const estaOculto = panelComanda.classList.toggle("comanda-oculta");
  const expandido = !estaOculto;

  botonesAlternarComanda.forEach((boton) => {
    boton.setAttribute("aria-expanded", String(expandido));
  });
}

// Procesa el cierre del pedido, limpia el carrito y genera nuevo número de orden
function finalizarPedido() {
  const items = obtenerItemsComanda();
  if (items.length === 0) return;

  const codigoOrden = "#FG-" + Math.floor(100 + Math.random() * 900);

  comanda = {};
  guardarComanda();
  actualizarTodo();

  if (numeroComanda) {
    numeroComanda.textContent = codigoOrden;
  }

  if (notaFinalizar) {
    notaFinalizar.textContent = `¡Pedido ${codigoOrden} enviado a la brasa! Gracias por tu compra. 🔥`;
    animarElemento(notaFinalizar);
  }
}

// 11. Conexiones de eventos (Event Listeners) y Arranque

function iniciarTienda() {
  // Actualizar año del footer automáticamente
  if (anioActual) {
    anioActual.textContent = String(new Date().getFullYear());
  }

  // 1. Cargar datos persistidos
  cargarComanda();
  cargarFiltro();

  // 2. Pintar interfaz inicial
  actualizarBotonesFiltro();
  renderizarCatalogo();
  actualizarTodo();

  // 3. Escuchadores de eventos (Delegación de eventos)
  if (contenedorProductos) {
    contenedorProductos.addEventListener("click", manejarAgregarAComanda);
  }

  if (contenedorFiltros) {
    contenedorFiltros.addEventListener("click", manejarCambioFiltro);
  }

  if (listaProductosComanda) {
    listaProductosComanda.addEventListener("click", manejarControlesComanda);
  }

  botonesAlternarComanda.forEach((boton) => {
    boton.addEventListener("click", alternarPanelComanda);
  });

  if (botonFinalizar) {
    botonFinalizar.addEventListener("click", finalizarPedido);
  }
}

// iniciar dom
iniciarTienda();
