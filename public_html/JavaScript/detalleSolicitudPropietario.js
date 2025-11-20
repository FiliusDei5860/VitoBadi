// JavaScript/detalleSolicitudPropietario.js
// Muestra y gestiona una solicitud REAL desde IndexedDB (sin datos mock)

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const idSolicitud = idParam ? Number(idParam) : NaN;

    const tituloSolicitud   = document.getElementById("titulo-solicitud");
    const divImagenHab      = document.getElementById("imagen-habitacion");
    const spanNombreInq     = document.getElementById("nombre-inquilino");
    const spanHabInfo       = document.getElementById("habitacion-info");
    const spanPrecio        = document.getElementById("precio-habitacion");
    const spanRangoFechas   = document.getElementById("rango-fechas");
    const spanMensaje       = document.getElementById("mensaje-inquilino");
    const badgeEstado       = document.getElementById("estado-badge");
    const btnAceptar        = document.getElementById("btn-aceptar");
    const btnRechazar       = document.getElementById("btn-rechazar");

    if (!idParam || isNaN(idSolicitud)) {
        if (tituloSolicitud) {
            tituloSolicitud.textContent = "Solicitud no encontrada (ID inválido)";
        }
        return;
    }

    let db;
    let solicitudActual = null;

    try {
        db = await abrirBD();
    } catch (err) {
        console.error("Error abriendo BD en detalleSolicitudPropietario:", err);
        if (tituloSolicitud) tituloSolicitud.textContent = "Error abriendo la base de datos.";
        return;
    }

    // ============================
    // 1) Cargar SOLICITUD desde BD
    // ============================
    solicitudActual = await cargarSolicitud(db, idSolicitud);

    if (!solicitudActual) {
        if (tituloSolicitud) {
            tituloSolicitud.textContent = "Solicitud no encontrada.";
        }
        return;
    }

    // ============================
    // 2) Cargar HABITACIÓN
    // ============================
    const habitacion = await cargarHabitacion(db, solicitudActual.idHabitacion);

    // ============================
    // 3) Cargar INQUILINO
    // ============================
    const inquilino = await cargarInquilino(db, solicitudActual.emailInquilinoPosible);

    // ============================
    // 4) Rellenar la pantalla
    // ============================
    if (tituloSolicitud) {
        tituloSolicitud.textContent =
            `Solicitud de ${inquilino?.nombre || solicitudActual.emailInquilinoPosible}`;
    }

    if (spanNombreInq) {
        spanNombreInq.textContent =
            inquilino?.nombre || solicitudActual.emailInquilinoPosible || "Inquilino desconocido";
    }

    if (spanHabInfo && habitacion) {
        spanHabInfo.textContent =
            `${habitacion.direccion || ""} · ${habitacion.ciudad || "-"}`;
    }

    if (spanPrecio) {
        const precioTxt =
            habitacion && habitacion.precio != null
                ? habitacion.precio + " €/mes"
                : "-";
        spanPrecio.textContent = precioTxt;
    }

    if (spanRangoFechas) {
        spanRangoFechas.textContent =
            solicitudActual.fechas || solicitudActual.fechaDeseada || "Sin fechas especificadas";
    }

    if (spanMensaje) {
        spanMensaje.textContent =
            solicitudActual.mensaje || "Sin mensaje incluido";
    }

    if (divImagenHab && habitacion) {
        let src = null;
        if (Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0) {
            src = habitacion.imagenes[0];
        } else if (habitacion.imagen) {
            src = habitacion.imagen;
        }

        if (src) {
            divImagenHab.style.backgroundImage = `url('${src}')`;
            divImagenHab.style.backgroundSize = "cover";
            divImagenHab.style.backgroundPosition = "center";
        }
    }

    const estadoInicial = solicitudActual.estado || "Pendiente";
    actualizarBadgeEstado(badgeEstado, estadoInicial);

    // ============================
    // 5) Botones Aceptar / Rechazar
    // ============================
    if (btnAceptar) {
        btnAceptar.addEventListener("click", async () => {
            await actualizarEstadoSolicitud(db, solicitudActual, "Aceptada");
            actualizarBadgeEstado(badgeEstado, "Aceptada");
            alert("Solicitud aceptada.");
        });
    }

    if (btnRechazar) {
        btnRechazar.addEventListener("click", async () => {
            await actualizarEstadoSolicitud(db, solicitudActual, "Rechazada");
            actualizarBadgeEstado(badgeEstado, "Rechazada");
            alert("Solicitud rechazada.");
        });
    }
});

// ============================
//  Funciones auxiliares BD
// ============================

function cargarSolicitud(db, idSolicitud) {
    return new Promise((resolve) => {
        const tx    = db.transaction(STORE_SOLICITUD, "readonly");
        const store = tx.objectStore(STORE_SOLICITUD);
        const req   = store.get(idSolicitud);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror   = () => resolve(null);
    });
}

function cargarHabitacion(db, idHabitacion) {
    if (idHabitacion == null) return Promise.resolve(null);

    return new Promise((resolve) => {
        const tx    = db.transaction(STORE_HABITACION, "readonly");
        const store = tx.objectStore(STORE_HABITACION);
        const req   = store.get(idHabitacion);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror   = () => resolve(null);
    });
}

function cargarInquilino(db, email) {
    if (!email) return Promise.resolve(null);

    return new Promise((resolve) => {
        const tx    = db.transaction(STORE_USUARIO, "readonly");
        const store = tx.objectStore(STORE_USUARIO);
        const req   = store.get(email);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror   = () => resolve(null);
    });
}

function actualizarEstadoSolicitud(db, solicitud, nuevoEstado) {
    return new Promise((resolve, reject) => {
        const tx    = db.transaction(STORE_SOLICITUD, "readwrite");
        const store = tx.objectStore(STORE_SOLICITUD);

        solicitud.estado = nuevoEstado;

        const req = store.put(solicitud);

        req.onsuccess = () => resolve();
        req.onerror   = (e) => {
            console.error("Error actualizando estado de solicitud:", e.target.error);
            reject(e.target.error);
        };
    });
}

function actualizarBadgeEstado(badge, estado) {
    if (!badge) return;

    const base = "px-3 py-1 rounded-full text-xs font-semibold text-center ";

    if (estado === "Aceptada") {
        badge.className = base + "bg-green-100 text-green-700";
    } else if (estado === "Rechazada") {
        badge.className = base + "bg-red-100 text-red-700";
    } else {
        badge.className = base + "bg-yellow-100 text-yellow-700";
    }

    badge.textContent = `Estado: ${estado}`;
}
