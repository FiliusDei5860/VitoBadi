// JavaScript/listaHabitaciones.js
// Lista de habitaciones reales (IndexedDB) + panel detalle + filtros ciudad/fecha

document.addEventListener("DOMContentLoaded", () => {

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

    let dbGlobal = null;
    let habitacionesCache = [];
    let usuarioActual = null;
    let estaLogeado = false;

    // =========================
    //  Leer usuario logeado
    // =========================
    try {
        const stored = sessionStorage.getItem("usuarioActual");
        if (stored) {
            usuarioActual = JSON.parse(stored);
            estaLogeado = !!usuarioActual?.email;
        }
    } catch (e) {
        console.warn("No se ha podido leer usuarioActual de sessionStorage:", e);
    }

    // =========================
    //  Abrir BD e inicializar
    // =========================
    abrirBD()
        .then(db => {
            dbGlobal = db;
            console.log("BD lista en ListaHabitaciones:", db.name);

            // Leer filtros de la URL (si venimos de Busqueda.html)
            const params = new URLSearchParams(window.location.search);
            const ciudadInicial = params.get("ciudad") || "";
            const fechaInicial  = params.get("fecha") || "";

            if (ciudadInicial && selectCiudad) {
                selectCiudad.value = ciudadInicial;
            }
            if (fechaInicial && inputFecha) {
                inputFecha.value = fechaInicial;
            }

            // Cargar TODAS las habitaciones desde BD y guardar en cache
            cargarHabitacionesDesdeBD().then(() => {
                aplicarFiltrosYRedibujar();
            });
        })
        .catch(err => {
            console.error("Error abriendo BD en ListaHabitaciones:", err);
        });

    // =========================
    //  Leer habitaciones desde IndexedDB
    // =========================
    function cargarHabitacionesDesdeBD() {
        return new Promise((resolve, reject) => {
            const tx    = dbGlobal.transaction(STORE_HABITACION, "readonly");
            const store = tx.objectStore(STORE_HABITACION);
            const req   = store.getAll();

            req.onsuccess = () => {
                habitacionesCache = req.result || [];
                resolve();
            };

            req.onerror = (e) => {
                console.error("Error leyendo habitaciones:", e.target.error);
                habitacionesCache = [];
                resolve(); // no rompas la página, solo no hay datos
            };
        });
    }

    // =========================
    //  Aplicar filtros
    // =========================
    function aplicarFiltrosYRedibujar() {
        const ciudad = selectCiudad ? selectCiudad.value : "";
        const fecha  = inputFecha   ? inputFecha.value   : "";

        let resultado = habitacionesCache.slice();

        // Filtro por ciudad
        if (ciudad) {
            resultado = resultado.filter(h => h.ciudad === ciudad);
        }

        // Filtro por fecha disponibleDesde
        if (fecha) {
            resultado = resultado.filter(h => {
                if (!h.disponibleDesde || h.disponibleDesde === "") {
                    return true;
                }
                return h.disponibleDesde <= fecha;
            });
        }

        // ********************************************
        // * FILTRO: EXCLUIR HABITACIONES PROPIAS     *
        // ********************************************
        if (estaLogeado && usuarioActual && usuarioActual.email) {
            const emailPropietario = usuarioActual.email;
            resultado = resultado.filter(h => h.emailPropietario !== emailPropietario);
        }
        // ********************************************

        pintarHabitaciones(resultado);
    }

    // =========================
    //  Pintar lista de tarjetas
    // =========================
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

            // Imagen / placeholder
            const imgPlaceholder = document.createElement("div");
            imgPlaceholder.className = "solicitud-imagen-placeholder";

            let src = null;
            if (Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0) {
                src = habitacion.imagenes[0];
            } else if (habitacion.imagen) {
                src = habitacion.imagen;
            }

            if (src) {
                imgPlaceholder.style.backgroundImage = `url('${src}')`;
                imgPlaceholder.style.backgroundSize = "cover";
                imgPlaceholder.style.backgroundPosition = "center";
            }

            // Si NO está logeado, difuminamos la imagen
            if (!estaLogeado) {
                imgPlaceholder.classList.add("room-card-image-blurred");
            }

            // Texto principal
            const textWrapper = document.createElement("div");

            const titulo = document.createElement("h3");
            titulo.className = "solicitud-titulo";
            titulo.textContent = habitacion.titulo || habitacion.direccion || "Habitación";

            const secundario = document.createElement("p");
            secundario.className = "solicitud-secundario";

            const ciudadTxt = habitacion.ciudad || "-";
            const precioTxt = (habitacion.precio != null)
                ? habitacion.precio + " €/mes"
                : "-";

            let fechaTxt = "";
            if (habitacion.disponibleDesde) {
                fechaTxt = " · Disponible desde " + habitacion.disponibleDesde;
            }

            secundario.textContent = `${ciudadTxt} · ${precioTxt}${fechaTxt}`;

            textWrapper.appendChild(titulo);
            textWrapper.appendChild(secundario);

            infoGroup.appendChild(imgPlaceholder);
            infoGroup.appendChild(textWrapper);

            card.appendChild(infoGroup);

            // Al hacer click → mostrar detalle en panel derecho
            card.addEventListener("click", () => {
                mostrarDetalle(habitacion);
            });

            listaHabitaciones.appendChild(card);
        });

        // Seleccionar la primera por defecto
        mostrarDetalle(habitaciones[0]);
    }

    // =========================
    //  Mostrar detalle en el panel derecho
    // =========================
    function mostrarDetalle(habitacion) {
        if (!detDir || !detCiudad || !detPrecio || !detLat || !detLong || !detImg || !btnSolicitar) return;

        if (!habitacion) {
            detDir.textContent    = "Selecciona una habitación en la lista.";
            detCiudad.textContent = "-";
            detPrecio.textContent = "-";
            detLat.textContent    = "-";
            detLong.textContent   = "-";
            detImg.src            = "./Public_icons/hab1.png";
            detImg.classList.toggle("room-card-image-blurred", !estaLogeado);

            btnSolicitar.textContent = "Selecciona una habitación";
            btnSolicitar.disabled    = true;
            btnSolicitar.onclick     = null;
            return;
        }

        detDir.textContent    = habitacion.direccion || "";
        detCiudad.textContent = habitacion.ciudad || "-";
        detPrecio.textContent = (habitacion.precio != null)
            ? habitacion.precio + " €/mes"
            : "-";
        detLat.textContent    = habitacion.latitud  ?? "-";
        detLong.textContent   = habitacion.longitud ?? "-";

        let src = null;
        if (Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0) {
            src = habitacion.imagenes[0];
        } else if (habitacion.imagen) {
            src = habitacion.imagen;
        }

        if (src) {
            detImg.src = src;
        } else {
            detImg.src = "./Public_icons/hab1.png";
        }

        detImg.classList.toggle("room-card-image-blurred", !estaLogeado);

        // Configurar botón Solicitar según login
        btnSolicitar.disabled = false;

        if (!estaLogeado) {
            btnSolicitar.textContent = "Login para solicitar";
            btnSolicitar.onclick = () => {
                window.location.href = "login.html";
            };
        } else {
            btnSolicitar.textContent = "Solicitar";
            btnSolicitar.onclick = () => {
                crearSolicitudParaHabitacion(habitacion);
            };
        }
    }

    // =========================
    //  Crear solicitud en BD
    // =========================
    function crearSolicitudParaHabitacion(habitacion) {
        if (!dbGlobal || !usuarioActual) {
            alert("Debes iniciar sesión para solicitar una habitación.");
            return;
        }

        const txSol   = dbGlobal.transaction(STORE_SOLICITUD, "readwrite");
        const store   = txSol.objectStore(STORE_SOLICITUD);
        const getAll  = store.getAll();

        getAll.onsuccess = () => {
            const todas = getAll.result || [];
            let nuevoId = 1;
            if (todas.length > 0) {
                nuevoId = Math.max(...todas.map(s => s.idSolicitud || 0)) + 1;
            }

            const hoy = new Date().toISOString().slice(0, 10);

            const nuevaSolicitud = {
                idSolicitud: nuevoId,
                idHabitacion: habitacion.idHabitacion,
                emailInquilinoPosible: usuarioActual.email,
                mensaje: "",
                fechas: "",
                fechaSolicitud: hoy,
                estado: "Pendiente"
            };

            const addReq = store.add(nuevaSolicitud);

            addReq.onsuccess = () => {
                alert("Solicitud registrada correctamente.");
            };

            addReq.onerror = (e) => {
                console.error("Error guardando solicitud:", e.target.error);
                alert("Error al registrar la solicitud.");
            };
        };

        getAll.onerror = (e) => {
            console.error("Error leyendo solicitudes para calcular nuevo id:", e.target.error);
            alert("No se ha podido registrar la solicitud.");
        };
    }

    // =========================
    //  Evento botón Buscar
    // =========================
    if (btnBuscar) {
        btnBuscar.addEventListener("click", aplicarFiltrosYRedibujar);
    }
});
