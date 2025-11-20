// JavaScript/listaHabitaciones.js
// Lista de habitaciones + panel detalle en la misma vista

// Simulación de login
const ESTA_LOGEADO = false;  // pon true/false para probar

// Habitaciones de ejemplo
const HABITACIONES_MOCK = [
    {
        idHabi: 1,
        titulo: "Residencia Vitoria – Habitación 1",
        direccion: "C/ Gorbea 12, 3ºA",
        ciudad: "Vitoria-Gasteiz",
        precio: 350,
        disponibleDesde: "2025-01-01",
        latitud: 42.846,
        longitud: -2.672,
        imagen: "./Public_icons/hab1.png"
    },
    {
        idHabi: 2,
        titulo: "Residencia Bilbao – Habitación 2",
        direccion: "Gran Vía 25, 2ºD",
        ciudad: "Bilbao",
        precio: 420,
        disponibleDesde: "2025-03-01",
        latitud: 43.262,
        longitud: -2.935,
        imagen: "./Public_icons/hab1.png"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const listaHabitaciones = document.getElementById("lista-habitaciones");
    const selectCiudad      = document.getElementById("filtro-ciudad");
    const inputFecha        = document.getElementById("filtro-fecha");
    const btnBuscar         = document.getElementById("btn-buscar");

    // Elementos del panel detalle
    const detImg       = document.getElementById("det-imagen");
    const detDir       = document.getElementById("det-direccion");
    const detCiudad    = document.getElementById("det-ciudad");
    const detPrecio    = document.getElementById("det-precio");
    const detLat       = document.getElementById("det-latitud");
    const detLong      = document.getElementById("det-longitud");
    const btnSolicitar = document.getElementById("btn-det-solicitar");

    if (!listaHabitaciones) return;

    // ---- Función: mostrar detalle de una habitación en el panel derecho ----
    function mostrarDetalle(habitacion) {
        if (!habitacion) {
            detDir.textContent    = "Selecciona una habitación en la lista.";
            detCiudad.textContent = "-";
            detPrecio.textContent = "-";
            detLat.textContent    = "-";
            detLong.textContent   = "-";
            detImg.src            = "./Public_icons/hab1.png";

            detImg.classList.toggle("room-card-image-blurred", !ESTA_LOGEADO);

            btnSolicitar.textContent = "Selecciona una habitación";
            btnSolicitar.disabled    = true;
            btnSolicitar.onclick     = null;
            return;
        }

        detDir.textContent    = habitacion.direccion;
        detCiudad.textContent = habitacion.ciudad;
        detPrecio.textContent = habitacion.precio + " €/mes";
        detLat.textContent    = habitacion.latitud;
        detLong.textContent   = habitacion.longitud;

        if (habitacion.imagen) {
            detImg.src = habitacion.imagen;
        }

        detImg.classList.toggle("room-card-image-blurred", !ESTA_LOGEADO);

        btnSolicitar.disabled = false;

        if (ESTA_LOGEADO) {
            btnSolicitar.textContent = "Solicitar";
            btnSolicitar.onclick = () => {
                alert("Solicitud enviada (simulada). Más adelante se guardará en la BD.");
            };
        } else {
            btnSolicitar.textContent = "Login para solicitar";
            btnSolicitar.onclick = () => {
                window.location.href = "login.html";
            };
        }
    }

    // ---- Función: filtrar según ciudad y fecha ----
    function filtrarHabitaciones() {
        const ciudad = selectCiudad.value;
        const fecha  = inputFecha.value;

        let resultado = HABITACIONES_MOCK.slice();

        if (ciudad) {
            resultado = resultado.filter(h => h.ciudad === ciudad);
        }

        if (fecha) {
            resultado = resultado.filter(h => !h.disponibleDesde || h.disponibleDesde <= fecha);
        }

        pintarHabitaciones(resultado);
    }

    // ---- Función: pintar la lista de tarjetas ----
    function pintarHabitaciones(habitaciones) {
        listaHabitaciones.innerHTML = "";

        if (!habitaciones || habitaciones.length === 0) {
            const p = document.createElement("p");
            p.textContent = "No se han encontrado habitaciones con esos criterios.";
            listaHabitaciones.appendChild(p);
            mostrarDetalle(null);
            return;
        }

        habitaciones.forEach(habitacion => {
            const card = document.createElement("article");
            card.className = "solicitud-card";

            const infoGroup = document.createElement("div");
            infoGroup.className = "solicitud-info-group";

            // Imagen
            const imgPlaceholder = document.createElement("div");
            imgPlaceholder.className = "solicitud-imagen-placeholder";

            if (habitacion.imagen) {
                imgPlaceholder.style.backgroundImage = `url('${habitacion.imagen}')`;
                imgPlaceholder.style.backgroundSize = "cover";
                imgPlaceholder.style.backgroundPosition = "center";

                if (!ESTA_LOGEADO) {
                    imgPlaceholder.classList.add("room-card-image-blurred");
                }
            }

            const textWrapper = document.createElement("div");

            const titulo = document.createElement("h3");
            titulo.className = "solicitud-titulo";
            titulo.textContent = habitacion.titulo || habitacion.direccion;

            const secundario = document.createElement("p");
            secundario.className = "solicitud-secundario";
            secundario.textContent =
                `${habitacion.ciudad} · ${habitacion.precio} €/mes · Disponible desde ${habitacion.disponibleDesde}`;

            textWrapper.appendChild(titulo);
            textWrapper.appendChild(secundario);

            infoGroup.appendChild(imgPlaceholder);
            infoGroup.appendChild(textWrapper);
            card.appendChild(infoGroup);

            // Click → mostrar detalle a la derecha
            card.addEventListener("click", () => mostrarDetalle(habitacion));

            listaHabitaciones.appendChild(card);
        });

        // Al pintar, mostrar la primera
        mostrarDetalle(habitaciones[0]);
    }

    // Eventos
    btnBuscar.addEventListener("click", filtrarHabitaciones);

    // --- Inicializar filtros desde la URL (si venimos de Busqueda.html) ---
    const params = new URLSearchParams(window.location.search);
    const ciudadInicial = params.get("ciudad") || "";
    const fechaInicial  = params.get("fecha") || "";

    // Rellenar campos si vienen en la URL
    if (ciudadInicial && selectCiudad) {
        selectCiudad.value = ciudadInicial;
    }
    if (fechaInicial && inputFecha) {
        inputFecha.value = fechaInicial;
    }

    // Si hay filtros → aplicar. Si no → pintar todo.
    if (ciudadInicial || fechaInicial) {
        filtrarHabitaciones();
    } else {
        pintarHabitaciones(HABITACIONES_MOCK);
    }
});
