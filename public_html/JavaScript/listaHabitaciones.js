// JavaScript/listaHabitaciones.js
// Lista de habitaciones + panel detalle en la misma vista

function normalizarSrc(raw) {
    if (!raw)
        return null;
    if (raw.startsWith("data:"))
        return raw;
    if (raw.startsWith("http") || raw.startsWith("./") || raw.startsWith("/"))
        return raw;
    return `data:image/jpeg;base64,${raw}`;
}

// -------------------------------
// LOGIN REAL
// -------------------------------
function estaLogeadoUsuario() {
    try {
        const raw = sessionStorage.getItem("usuarioActual");
        const u = raw ? JSON.parse(raw) : null;
        return !!u?.email;
    } catch (e) {
        return false;
    }
}

let ESTA_LOGEADO = false;

// Habitaciones de ejemplo (solo si BD falla)
const HABITACIONES_MOCK = [];

document.addEventListener("DOMContentLoaded", async () => {

    ESTA_LOGEADO = estaLogeadoUsuario();

    const listaHabitaciones = document.getElementById("lista-habitaciones");
    const selectCiudad = document.getElementById("filtro-ciudad");
    const inputFecha = document.getElementById("filtro-fecha");
    const btnBuscar = document.getElementById("btn-buscar");

    // Elementos del panel detalle
    const detImg = document.getElementById("det-imagen");
    const detDir = document.getElementById("det-direccion");
    const detCiudad = document.getElementById("det-ciudad");
    const detPrecio = document.getElementById("det-precio");
    const detLat = document.getElementById("det-latitud");
    const detLong = document.getElementById("det-longitud");
    const btnSolicitar = document.getElementById("btn-det-solicitar");

    if (!listaHabitaciones)
        return;

    // -----------------------------
    // Cargar Habitaciones de BD
    // -----------------------------
    let habitacionesBD = [];
    let usuarioActual = null;

    try {
        const raw = sessionStorage.getItem("usuarioActual");
        usuarioActual = raw ? JSON.parse(raw) : null;
    } catch {
    }

    try {
        const db = await abrirBD();
        let todas = await getAllFromStore(db, STORE_HABITACION);

        // ❌ OCULTAR habit. propias si estoy logeado (propietario o no)
        if (usuarioActual?.email) {
            const miEmail = usuarioActual.email;

            // OJO: si vuestro campo se llama distinto, cambia SOLO esto:
            todas = todas.filter(h => h.emailPropietario !== miEmail);
        }

        habitacionesBD = todas;
    } catch (e) {
        console.warn("Fallo BD, usando mock.");
        habitacionesBD = HABITACIONES_MOCK;
    }

    // ======================================================
    // RELLENAR SELECT DE CIUDADES
    // ======================================================
    if (selectCiudad) {
        // tu HTML ya tiene la opción "Todas" con value=""
        // aquí solo añadimos las ciudades reales
        const ciudadesUnicas = [...new Set(
                    habitacionesBD
                    .map(h => h.ciudad)
                    .filter(c => c && c.trim() !== "")
                    )];

        ciudadesUnicas.sort();

        ciudadesUnicas.forEach(ciudad => {
            const opt = document.createElement("option");
            opt.value = ciudad;
            opt.textContent = ciudad;
            selectCiudad.appendChild(opt);
        });
    }

    // ======================================================
    // CARGAR PARÁMETROS GUARDADOS (DESPUÉS de añadir opciones)
    // ======================================================
    const savedCiudad = sessionStorage.getItem("filtroCiudad");
    const savedFecha = sessionStorage.getItem("filtroFecha");

    if (selectCiudad && savedCiudad !== null) {
        selectCiudad.value = savedCiudad; // si no existe opción, se queda en ""
    }
    if (inputFecha && savedFecha) {
        inputFecha.value = savedFecha;
    }

    // -----------------------------
    // Mostrar detalle
    // -----------------------------
    function mostrarDetalle(habitacion) {
        if (!habitacion) {
            detDir.textContent = "Selecciona una habitación en la lista.";
            detCiudad.textContent = "-";
            detPrecio.textContent = "-";
            detLat.textContent = "-";
            detLong.textContent = "-";
            detImg.src = "./Public_icons/hab1.png";
            detImg.classList.toggle("room-card-image-blurred", !ESTA_LOGEADO);
            btnSolicitar.textContent = "Selecciona una habitación";
            btnSolicitar.disabled = true;
            btnSolicitar.onclick = null;
            return;
        }

        detDir.textContent = habitacion.direccion;
        detCiudad.textContent = habitacion.ciudad;
        detPrecio.textContent = habitacion.precio + " €/mes";
        detLat.textContent = habitacion.latitud;
        detLong.textContent = habitacion.longitud;

        let imgDet = null;
        if (Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0) {
            imgDet = habitacion.imagenes[0];
        } else if (habitacion.imagen) {
            imgDet = habitacion.imagen;
        }
        imgDet = normalizarSrc(imgDet);

        detImg.src = imgDet || "./Public_icons/hab1.png";
        detImg.classList.toggle("room-card-image-blurred", !ESTA_LOGEADO);

        btnSolicitar.disabled = false;

        if (ESTA_LOGEADO) {
            btnSolicitar.textContent = "Solicitar";
            btnSolicitar.onclick = () => {
                alert("Solicitud enviada (simulada). Luego irá a BD.");
            };
        } else {
            btnSolicitar.textContent = "Login para solicitar";
            btnSolicitar.onclick = () => {
                window.location.href = "login.html";
            };
        }
    }

    // -----------------------------
    // Filtros
    // -----------------------------
    function filtrarHabitaciones() {
        const ciudad = selectCiudad ? selectCiudad.value : "";
        const fecha = inputFecha ? inputFecha.value : "";

        let resultado = habitacionesBD.slice();

        if (ciudad) {
            resultado = resultado.filter(h => h.ciudad === ciudad);
        }

        if (fecha) {
            resultado = resultado.filter(h => !h.disponibleDesde || h.disponibleDesde <= fecha);
        }

        pintarHabitaciones(resultado);
    }

    // -----------------------------
    // Pintar tarjetas
    // -----------------------------
    function pintarHabitaciones(habitaciones) {
        listaHabitaciones.innerHTML = "";

        if (!habitaciones || habitaciones.length === 0) {
            const p = document.createElement("p");
            p.textContent = "No se han encontrado habitaciones.";
            listaHabitaciones.appendChild(p);
            mostrarDetalle(null);
            return;
        }

        habitaciones.forEach(habitacion => {
            const card = document.createElement("article");
            card.className = "solicitud-card";

            const infoGroup = document.createElement("div");
            infoGroup.className = "solicitud-info-group";

            const imgPlaceholder = document.createElement("div");
            imgPlaceholder.className = "solicitud-imagen-placeholder";

            let imgSrc = null;
            if (Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0) {
                imgSrc = habitacion.imagenes[0];
            } else if (habitacion.imagen) {
                imgSrc = habitacion.imagen;
            }
            imgSrc = normalizarSrc(imgSrc);

            if (imgSrc) {
                imgPlaceholder.style.backgroundImage = `url('${imgSrc}')`;
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
            secundario.textContent = `${habitacion.ciudad} · ${habitacion.precio} €/mes`;

            textWrapper.appendChild(titulo);
            textWrapper.appendChild(secundario);

            infoGroup.appendChild(imgPlaceholder);
            infoGroup.appendChild(textWrapper);
            card.appendChild(infoGroup);

            card.addEventListener("click", () => {
                mostrarDetalle(habitacion);
            });

            listaHabitaciones.appendChild(card);
        });

        mostrarDetalle(habitaciones[0]);
    }

    // Eventos
    if (btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            // Guardar preferencias
            if (selectCiudad)
                sessionStorage.setItem("filtroCiudad", selectCiudad.value);
            if (inputFecha)
                sessionStorage.setItem("filtroFecha", inputFecha.value);

            filtrarHabitaciones();
        });
    }

    // Mostrar al entrar (aplicando filtros guardados si existen)
    filtrarHabitaciones();
});


// Aux BD
function getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const st = tx.objectStore(storeName);
        const req = st.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}
