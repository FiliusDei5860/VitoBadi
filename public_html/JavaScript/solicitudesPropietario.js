// JavaScript/solicitudesPropietario.js
// Solicitudes recibidas POR el propietario actual (IndexedDB)

document.addEventListener("DOMContentLoaded", () => {
    // Contenedor donde se pintan las tarjetas
    // Opción A: por id (recomendado)
    let cont = document.getElementById("contenedor-solicitudes-propietario");
    // Opción B: como lo tenías, por clase dentro de main
    if (!cont) {
        cont = document.querySelector("main .space-y-4");
    }

    if (!cont) {
        console.warn("No se ha encontrado el contenedor de solicitudes del propietario.");
        return;
    }

    let usuarioActual = null;
    try {
        const stored = sessionStorage.getItem("usuarioActual");
        if (stored) usuarioActual = JSON.parse(stored);
    } catch (e) {
        console.warn("No se ha podido leer usuarioActual:", e);
    }

    if (!usuarioActual || !usuarioActual.email) {
        cont.innerHTML = "<p>Debes iniciar sesión para ver tus solicitudes.</p>";
        return;
    }

    abrirBD()
        .then(async (db) => {
            const solicitudes = await cargarTodasSolicitudes(db);

            if (!solicitudes || solicitudes.length === 0) {
                cont.innerHTML = "<p>No tienes solicitudes pendientes.</p>";
                return;
            }

            cont.innerHTML = "";

            for (const sol of solicitudes) {
                // Cargar habitación asociada
                const hab  = await cargarHabitacion(db, sol.idHabitacion);
                if (!hab || hab.emailPropietario !== usuarioActual.email) {
                    // No es una solicitud para una habitación de este propietario
                    continue;
                }

                // Cargar datos del posible inquilino
                const inquilino = await cargarUsuario(db, sol.emailInquilinoPosible);

                // Crear tarjeta
                crearCardSolicitudPropietario(cont, sol, hab, inquilino);
            }

            if (!cont.hasChildNodes()) {
                cont.innerHTML = "<p>No tienes solicitudes pendientes.</p>";
            }
        })
        .catch(err => {
            console.error("Error abriendo BD en solicitudesPropietario:", err);
            cont.innerHTML = "<p>Error al cargar las solicitudes.</p>";
        });
});

// =================== AUXILIARES BD ===================

function cargarTodasSolicitudes(db) {
    return new Promise((resolve) => {
        const tx    = db.transaction(STORE_SOLICITUD, "readonly");
        const store = tx.objectStore(STORE_SOLICITUD);
        const req   = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror   = () => resolve([]);
    });
}

function cargarHabitacion(db, idHabitacion) {
    return new Promise((resolve) => {
        const tx    = db.transaction(STORE_HABITACION, "readonly");
        const store = tx.objectStore(STORE_HABITACION);
        const req   = store.get(idHabitacion);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror   = () => resolve(null);
    });
}

function cargarUsuario(db, email) {
    return new Promise((resolve) => {
        const tx    = db.transaction(STORE_USUARIO, "readonly");
        const store = tx.objectStore(STORE_USUARIO);
        const req   = store.get(email);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror   = () => resolve(null);
    });
}

// =================== PINTAR TARJETA ===================

function crearCardSolicitudPropietario(cont, sol, habitacion, inquilino) {
    const card = document.createElement("article");
    card.className = "solicitud-card";

    const infoGroup = document.createElement("div");
    infoGroup.className = "solicitud-info-group";

    const imgDiv = document.createElement("div");
    imgDiv.className = "solicitud-imagen-placeholder";

    let src = null;
    if (Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0) {
        src = habitacion.imagenes[0];
    } else if (habitacion.imagen) {
        src = habitacion.imagen;
    }
    if (src) {
        imgDiv.style.backgroundImage = `url('${src}')`;
        imgDiv.style.backgroundSize = "cover";
        imgDiv.style.backgroundPosition = "center";
    }

    const textWrap = document.createElement("div");

    const titulo = document.createElement("h3");
    titulo.className = "solicitud-titulo";
    const nombreInq = inquilino?.nombre || sol.emailInquilinoPosible || "Inquilino desconocido";
    titulo.textContent = `Solicitud de ${nombreInq}`;

    const secundario = document.createElement("p");
    secundario.className = "solicitud-secundario";

    const nombreHab = habitacion.titulo || habitacion.direccion || "Habitación";
    const precio    = habitacion.precio != null ? habitacion.precio + " €" : "-";

    secundario.textContent =
        `Interesado en "${nombreHab}" | Precio: ${precio}`;

    const fechaTxt = document.createElement("p");
    fechaTxt.className = "text-xs text-gray-500 mt-1";
    fechaTxt.textContent =
        sol.fechaSolicitud ? `Recibida el ${sol.fechaSolicitud}` : "Fecha no especificada";

    textWrap.appendChild(titulo);
    textWrap.appendChild(secundario);
    textWrap.appendChild(fechaTxt);

    infoGroup.appendChild(imgDiv);
    infoGroup.appendChild(textWrap);

    const actions = document.createElement("div");
    actions.className = "solicitud-actions";

    const linkDetalle = document.createElement("a");
    linkDetalle.href = `DetalleSolicitudPropietario.html?id=${sol.idSolicitud}`;
    linkDetalle.className = "btn-icon";
    linkDetalle.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <span class="sr-only">Ver Detalles</span>
    `;

    actions.appendChild(linkDetalle);

    card.appendChild(infoGroup);
    card.appendChild(actions);

    cont.appendChild(card);
}
