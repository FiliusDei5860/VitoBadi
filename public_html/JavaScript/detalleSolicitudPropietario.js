// JavaScript/detalleSolicitudPropietario.js
// Detalle de solicitud del propietario leyendo IndexedDB

document.addEventListener("DOMContentLoaded", async () => {

    const elTitulo = document.getElementById("titulo-solicitud");
    const elImgHab = document.getElementById("imagen-habitacion");
    const elNomInq = document.getElementById("nombre-inquilino");
    const elHabInfo = document.getElementById("habitacion-info");
    const elPrecioHab = document.getElementById("precio-habitacion");
    const elRangoFech = document.getElementById("rango-fechas");
    const elMensajeInq = document.getElementById("mensaje-inquilino");
    const elBadge = document.getElementById("estado-badge");
    const btnAceptar = document.getElementById("btn-aceptar");
    const btnRechazar = document.getElementById("btn-rechazar");

    // id desde URL
    const params = new URLSearchParams(window.location.search);
    const idStr = params.get("id");
    const idSolicitud = idStr ? Number(idStr) : null;

    if (!idSolicitud || Number.isNaN(idSolicitud)) {
        if (elTitulo)
            elTitulo.textContent = "Solicitud no válida";
        desactivarBotones();
        return;
    }

    try {
        const db = await abrirBD();

        // 1) Leer solicitud
        const solicitud = await getByKey(db, STORE_SOLICITUD, idSolicitud);
        if (!solicitud) {
            if (elTitulo)
                elTitulo.textContent = "Solicitud no encontrada";
            desactivarBotones();
            return;
        }

        // 2) Leer habitación vinculada
        const habitacion = await getByKey(db, STORE_HABITACION, solicitud.idHabitacion);

        // 3) Leer usuario inquilino posible
        const inquilino = await getByKey(db, STORE_USUARIO, solicitud.emailInquilinoPosible);

        // --------- Pintar datos ----------
        if (elTitulo)
            elTitulo.textContent = `Solicitud #${solicitud.idSolicitud}`;

        // Imagen habitación (si existe)
        let imgSrc = null;
        if (habitacion) {
            if (Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0) {
                imgSrc = habitacion.imagenes[0];
            } else if (habitacion.imagen) {
                imgSrc = habitacion.imagen;
            }
        }
        if (elImgHab) {
            if (imgSrc) {
                elImgHab.src = imgSrc;
            } else {
                elImgHab.removeAttribute("src"); // se queda sin imagen
                elImgHab.alt = "Sin imagen";
            }
        }

        if (elNomInq) {
            elNomInq.textContent = inquilino?.nombre || solicitud.emailInquilinoPosible || "-";
        }

        if (elHabInfo) {
            const dir = habitacion?.direccion || "";
            const ciu = habitacion?.ciudad || "";
            elHabInfo.textContent = `${dir}${dir && ciu ? " · " : ""}${ciu}` || `Hab ${solicitud.idHabitacion}`;
        }

        if (elPrecioHab) {
            elPrecioHab.textContent =
                    habitacion?.precio != null ? `${habitacion.precio} €/mes` : "-";
        }

        // Fechas deseadas (si existen en la solicitud)
        const fIni = solicitud.fechaInicioDeseada || solicitud.fechaInicio || "";
        const fFin = solicitud.fechaFinDeseada || solicitud.fechaFin || "";
        if (elRangoFech) {
            elRangoFech.textContent = (fIni || fFin) ? `${fIni || "?"} → ${fFin || "?"}` : "-";
        }

        if (elMensajeInq) {
            elMensajeInq.textContent = solicitud.mensaje || solicitud.comentario || "-";
        }

        // Estado
        actualizarBadge(solicitud.estado || "Pendiente");

        // Si ya está resuelta, no permitimos cambio
        const estadoActual = (solicitud.estado || "Pendiente");
        if (estadoActual !== "Pendiente") {
            desactivarBotones();
        } else {
            // Botones aceptar / rechazar
            if (btnAceptar) {
                btnAceptar.addEventListener("click", async () => {
                    await cambiarEstado(db, solicitud, "Aceptada");
                });
            }
            if (btnRechazar) {
                btnRechazar.addEventListener("click", async () => {
                    await cambiarEstado(db, solicitud, "Rechazada");
                });
            }
        }

    } catch (err) {
        console.error("Error detalleSolicitudPropietario:", err);
        if (elTitulo)
            elTitulo.textContent = "Error cargando solicitud";
        desactivarBotones();
    }

    // ---------------- helpers ----------------

    function desactivarBotones() {
        if (btnAceptar)
            btnAceptar.disabled = true;
        if (btnRechazar)
            btnRechazar.disabled = true;
    }

    function actualizarBadge(estado) {
        if (!elBadge)
            return;
        const base = "px-3 py-1 rounded-full text-xs font-semibold ";
        elBadge.className =
                estado === "Aceptada" ? base + "bg-green-100 text-green-700" :
                estado === "Rechazada" ? base + "bg-red-100 text-red-700" :
                base + "bg-yellow-100 text-yellow-700";
        elBadge.textContent = `Estado: ${estado}`;
    }

    async function cambiarEstado(db, solicitud, nuevoEstado) {
        solicitud.estado = nuevoEstado;

        await putItem(db, STORE_SOLICITUD, solicitud);

        actualizarBadge(nuevoEstado);
        desactivarBotones();

        alert(`Solicitud ${nuevoEstado.toLowerCase()}.`);
        // opcional: volver a lista
        // window.location.href = "SolicitudesPropietario.html";
    }
});

function getByKey(db, storeName, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const st = tx.objectStore(storeName);
        const req = st.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
}

function putItem(db, storeName, item) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const st = tx.objectStore(storeName);
        const req = st.put(item);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}
