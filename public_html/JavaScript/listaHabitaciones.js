// JavaScript/listaHabitaciones.js
// Lista de habitaciones + panel detalle, usando IndexedDB

document.addEventListener("DOMContentLoaded", () => {
    const ESTA_LOGEADO = !!sessionStorage.getItem("usuarioActual");

    const listaHabitaciones = document.getElementById("lista-habitaciones");
    const selectCiudad      = document.getElementById("filtro-ciudad");
    const inputFecha        = document.getElementById("filtro-fecha");
    const btnBuscar         = document.getElementById("btn-buscar");

    // Panel detalle
    const detImg       = document.getElementById("det-imagen");
    const detDir       = document.getElementById("det-direccion");
    const detCiudad    = document.getElementById("det-ciudad");
    const detPrecio    = document.getElementById("det-precio");
    const detLat       = document.getElementById("det-latitud");
    const detLong      = document.getElementById("det-longitud");
    const btnSolicitar = document.getElementById("btn-det-solicitar");

    if (!listaHabitaciones) return;

    let HABITACIONES_CACHE = [];

    // -----------------------------------------
    // Mostrar detalle en el panel derecho
    // -----------------------------------------
    function mostrarDetalle(habitacion) {
        if (!habitacion) {
            detDir.textContent    = "Selecciona una habitación en la lista.";
            detCiudad.textContent = "-";
            detPrecio.textContent = "-";
            detLat.textContent    = "-";
            detLong.textContent   = "-";

            if (detImg) {
                detImg.removeAttribute("src");
                detImg.style.display = "none";
            }

            btnSolicitar.textContent = "Selecciona una habitación";
            btnSolicitar.disabled    = true;
            btnSolicitar.onclick     = null;
            return;
        }

        detDir.textContent    = habitacion.direccion || "";
        detCiudad.textContent = habitacion.ciudad    || "-";
        detPrecio.textContent = (habitacion.precio != null ? habitacion.precio + " €/mes" : "-");
        detLat.textContent    = habitacion.latitud  ?? "-";
        detLong.textContent   = habitacion.longitud ?? "-";

        if (detImg) {
            if (habitacion.imagen) {
                detImg.src = habitacion.imagen;
                detImg.style.display = "block";
            } else {
                detImg.removeAttribute("src");
                detImg.style.display = "none";
            }
            detImg.classList.toggle("room-card-image-blurred", !ESTA_LOGEADO);
        }

        btnSolicitar.disabled = false;

        if (ESTA_LOGEADO) {
            btnSolicitar.textContent = "Solicitar";
            btnSolicitar.onclick = () => {
                alert("Solicitud enviada (simulada). Más adelante se guardará en la BD.");
            };
        } else {
            btnSolicitar.textContent = "Login para solicitar";
            btnSolicitar.onclick = () => {
                window.location.href = "Login.html";
            };
        }
    }

    // -----------------------------------------
    // Pintar tarjetas en la lista
    // -----------------------------------------
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

            // Imagen de la tarjeta (solo si hay imagen)
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

            // Texto
            const textWrapper = document.createElement("div");

            const titulo = document.createElement("h3");
            titulo.className = "solicitud-titulo";
            titulo.textContent = habitacion.titulo || habitacion.direccion || "Habitación";

            const secundario = document.createElement("p");
            secundario.className = "solicitud-secundario";

            const ciudadTxt   = habitacion.ciudad || "-";
            const precioTxt   = (habitacion.precio != null ? habitacion.precio + " €/mes" : "-");
            const fechaTxt    = habitacion.disponibleDesde || "";

            secundario.textContent =
                `${ciudadTxt} · ${precioTxt}${fechaTxt ? " · Disponible desde " + fechaTxt : ""}`;

            textWrapper.appendChild(titulo);
            textWrapper.appendChild(secundario);

            infoGroup.appendChild(imgPlaceholder);
            infoGroup.appendChild(textWrapper);

            card.appendChild(infoGroup);

            // Evento: al clicar, mostrar detalle
            card.addEventListener("click", () => {
                mostrarDetalle(habitacion);
            });

            listaHabitaciones.appendChild(card);
        });

        // Seleccionar la primera habitación por defecto
        mostrarDetalle(habitaciones[0]);
    }

    // -----------------------------------------
    // Filtro
    // -----------------------------------------
    function filtrarHabitaciones() {
        const ciudad = selectCiudad?.value || "";
        const fecha  = inputFecha?.value   || "";  // "" o YYYY-MM-DD

        let resultado = HABITACIONES_CACHE.slice();

        if (ciudad) {
            resultado = resultado.filter(h => h.ciudad === ciudad);
        }

        if (fecha) {
            resultado = resultado.filter(h => !h.disponibleDesde || h.disponibleDesde <= fecha);
        }

        pintarHabitaciones(resultado);
    }

    // -----------------------------------------
    // Cargar datos desde IndexedDB
    // -----------------------------------------
    function cargarHabitacionesDesdeBD() {
        abrirBD()
            .then(db => {
                const tx    = db.transaction(STORE_HABITACION, "readonly");
                const store = tx.objectStore(STORE_HABITACION);
                const req   = store.getAll();

                req.onsuccess = () => {
                    HABITACIONES_CACHE = req.result || [];
                    if (HABITACIONES_CACHE.length === 0) {
                        listaHabitaciones.innerHTML = "<p>No hay habitaciones registradas.</p>";
                        mostrarDetalle(null);
                        return;
                    }
                    pintarHabitaciones(HABITACIONES_CACHE);
                };

                req.onerror = () => {
                    console.error("Error leyendo habitaciones de IndexedDB:", req.error);
                    listaHabitaciones.innerHTML = "<p>Error cargando habitaciones.</p>";
                };
            })
            .catch(err => {
                console.error("Error abriendo BD en listaHabitaciones:", err);
                listaHabitaciones.innerHTML = "<p>Error abriendo la base de datos.</p>";
            });
    }

    // Eventos
    if (btnBuscar) {
        btnBuscar.addEventListener("click", filtrarHabitaciones);
    }

    // Cargar habitaciones al inicio
    cargarHabitacionesDesdeBD();
});
