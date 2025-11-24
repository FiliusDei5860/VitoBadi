// JavaScript/detalleSolicitudPropietario.js
// Detalle REAL de solicitud + aceptar/rechazar

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idSolicitud = Number(params.get("id"));

    const tituloEl = document.getElementById("titulo-solicitud");
    const nombreEl = document.getElementById("nombre-inquilino");
    const habInfoEl = document.getElementById("habitacion-info");
    const precioEl = document.getElementById("precio-habitacion");
    const fechasEl = document.getElementById("rango-fechas");
    const mensajeEl = document.getElementById("mensaje-inquilino");
    const imgDiv = document.getElementById("imagen-habitacion");
    const badgeEl = document.getElementById("estado-badge");
    const btnAceptar = document.getElementById("btn-aceptar");
    const btnRechazar = document.getElementById("btn-rechazar");

    // usuario logeado
    let usuarioActual = null;
    try {
        const raw = sessionStorage.getItem("usuarioActual");
        usuarioActual = raw ? JSON.parse(raw) : null;
    } catch (e) {
    }

    if (!usuarioActual?.email) {
        if (tituloEl)
            tituloEl.textContent = "Debes iniciar sesión.";
        if (btnAceptar)
            btnAceptar.disabled = true;
        if (btnRechazar)
            btnRechazar.disabled = true;
        return;
    }

    if (!idSolicitud) {
        if (tituloEl)
            tituloEl.textContent = "Solicitud no encontrada";
        return;
    }

    try {
        const db = await abrirBD();

        const sol = await getByKey(db, STORE_SOLICITUD, idSolicitud);
        if (!sol) {
            if (tituloEl)
                tituloEl.textContent = "Solicitud no encontrada";
            return;
        }

        const hab = await getByKey(db, STORE_HABITACION, sol.idHabitacion);
        if (!hab || hab.emailPropietario !== usuarioActual.email) {
            if (tituloEl)
                tituloEl.textContent = "No tienes permiso para ver esta solicitud.";
            if (btnAceptar)
                btnAceptar.disabled = true;
            if (btnRechazar)
                btnRechazar.disabled = true;
            return;
        }

        const inq = await getByKey(db, STORE_USUARIO, sol.emailInquilinoPosible);

        // pintar UI
        if (tituloEl)
            tituloEl.textContent = `Solicitud de ${inq?.nombre || sol.emailInquilinoPosible}`;
        if (nombreEl)
            nombreEl.textContent = inq?.nombre || sol.emailInquilinoPosible;
        if (habInfoEl)
            habInfoEl.textContent = `${hab.titulo || "Habitación"} – ${hab.direccion} (${hab.ciudad})`;
        if (precioEl)
            precioEl.textContent = `${hab.precio} €/mes`;

        const fIni = sol.fechaInicio || sol.fechaInicioAlquiler || "-";
        const fFin = sol.fechaFin || sol.fechaFinAlquiler || "-";
        if (fechasEl)
            fechasEl.textContent = `${fIni} → ${fFin}`;

        if (mensajeEl)
            mensajeEl.textContent = sol.mensaje || "(sin mensaje)";

        let imgSrc = null;
        if (Array.isArray(hab.imagenes) && hab.imagenes.length)
            imgSrc = hab.imagenes[0];
        else if (hab.imagen)
            imgSrc = hab.imagen;
        if (imgDiv && imgSrc) {
            imgDiv.style.backgroundImage = `url('${imgSrc}')`;
            imgDiv.style.backgroundSize = "cover";
            imgDiv.style.backgroundPosition = "center";
        }

        const estado = sol.estado || "Pendiente";
        actualizarBadgeEstado(badgeEl, estado);
        btnAceptar.disabled = estado !== "Pendiente";
        btnRechazar.disabled = estado !== "Pendiente";

        btnAceptar.addEventListener("click", async () => {
            await aceptarSolicitud(db, sol);
            alert("Solicitud aceptada.");
            window.location.href = "MisAlquileres.html";
        });

        btnRechazar.addEventListener("click", async () => {
            await rechazarSolicitud(db, sol.idSolicitud);
            alert("Solicitud rechazada.");
            window.location.href = "SolicitudesPropietario.html";
        });

    } catch (err) {
        console.error(err);
        if (tituloEl)
            tituloEl.textContent = "Error cargando detalle.";
    }
});

// ---------- helpers DB ----------
function getByKey(db, storeName, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const st = tx.objectStore(storeName);
        const req = st.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
}

function aceptarSolicitud(db, sol) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_ALQUILER, STORE_SOLICITUD], "readwrite");
        const stAlq = tx.objectStore(STORE_ALQUILER);
        const stSol = tx.objectStore(STORE_SOLICITUD);

        const reqAll = stAlq.getAll();
        reqAll.onsuccess = () => {
            const all = reqAll.result || [];
            const nextId = all.reduce((m, a) => Math.max(m, a.idContrato || 0), 0) + 1;

            const nuevoAlquiler = {
                idContrato: nextId,
                idHabitacion: sol.idHabitacion,
                emailInquilino: sol.emailInquilinoPosible,
                fechaInicioAlquiler: sol.fechaInicio || sol.fechaInicioAlquiler || new Date().toISOString().slice(0, 10),
                fechaFinAlquiler: sol.fechaFin || sol.fechaFinAlquiler || null
            };

            stAlq.add(nuevoAlquiler);
            stSol.delete(sol.idSolicitud);
        };
        reqAll.onerror = () => reject(reqAll.error);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function rechazarSolicitud(db, idSolicitud) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SOLICITUD, "readwrite");
        tx.objectStore(STORE_SOLICITUD).delete(idSolicitud);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function actualizarBadgeEstado(badge, estado) {
    if (!badge)
        return;
    const base = "px-3 py-1 rounded-full text-xs font-semibold text-center ";
    badge.className =
            estado === "Aceptada" ? base + "bg-green-100 text-green-700" :
            estado === "Rechazada" ? base + "bg-red-100 text-red-700" :
            base + "bg-yellow-100 text-yellow-700";
    badge.textContent = `Estado: ${estado}`;
}
