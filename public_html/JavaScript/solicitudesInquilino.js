// JavaScript/solicitudesInquilino.js
// Lista y gestión de solicitudes realizadas por el inquilino actual

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("lista-solicitudes-inq");
    const msgVacio   = document.getElementById("msg-no-solicitudes-inq");
    if (!contenedor) return;

    let usuarioActual = null;

    try {
        const stored = sessionStorage.getItem("usuarioActual");
        if (stored) {
            usuarioActual = JSON.parse(stored);
        }
    } catch (e) {
        console.warn("No se ha podido leer usuarioActual:", e);
    }

    if (!usuarioActual || !usuarioActual.email) {
        contenedor.innerHTML = "<p>Debes iniciar sesión para ver tus solicitudes.</p>";
        if (msgVacio) msgVacio.classList.add("hidden");
        return;
    }

    (async () => {
        try {
            const db = await abrirBD();

            const [solicitudes, habitaciones] = await Promise.all([
                getAllFromStore(db, STORE_SOLICITUD),
                getAllFromStore(db, STORE_HABITACION)
            ]);

            const mapaHab = new Map(habitaciones.map(h => [h.idHabitacion, h]));

            // Filtrar solicitudes del inquilino actual
            const mias = solicitudes.filter(s => s.emailInquilinoPosible === usuarioActual.email);

            contenedor.innerHTML = "";

            if (mias.length === 0) {
                if (msgVacio) msgVacio.classList.remove("hidden");
                return;
            } else {
                if (msgVacio) msgVacio.classList.add("hidden");
            }

            mias.forEach(s => {
                const hab = mapaHab.get(s.idHabitacion);

                const card = document.createElement("article");
                card.className = "solicitud-card";

                const infoGroup = document.createElement("div");
                infoGroup.className = "solicitud-info-group";

                const imgDiv = document.createElement("div");
                imgDiv.className = "solicitud-imagen-placeholder";

                let src = null;
                if (hab) {
                    if (Array.isArray(hab.imagenes) && hab.imagenes.length > 0) {
                        src = hab.imagenes[0];
                    } else if (hab.imagen) {
                        src = hab.imagen;
                    }
                }
                if (src) {
                    imgDiv.style.backgroundImage = `url('${src}')`;
                    imgDiv.style.backgroundSize = "cover";
                    imgDiv.style.backgroundPosition = "center";
                }

                const textWrap = document.createElement("div");

                const titulo = document.createElement("h3");
                titulo.className = "solicitud-titulo";
                titulo.textContent = hab
                    ? (hab.direccion || "Habitación")
                    : "Habitación desconocida";

                const p1 = document.createElement("p");
                p1.className = "solicitud-secundario";

                const ciudadTxt = hab?.ciudad || "-";
                const precioTxt = hab?.precio != null ? hab.precio + " €/mes" : "-";
                const estado    = s.estado || "Pendiente";

                p1.textContent = `${ciudadTxt} · ${precioTxt} · Estado: ${estado}`;

                const p2 = document.createElement("p");
                p2.className = "solicitud-secundario";
                const fechaSol = s.fechaSolicitud || "";
                p2.textContent = fechaSol ? `Fecha solicitud: ${fechaSol}` : "";

                textWrap.appendChild(titulo);
                textWrap.appendChild(p1);
                if (fechaSol) textWrap.appendChild(p2);

                infoGroup.appendChild(imgDiv);
                infoGroup.appendChild(textWrap);

                card.appendChild(infoGroup);

                // Acciones: ver habitación + cancelar solicitud
                const acciones = document.createElement("div");
                acciones.className = "flex gap-2 mt-2";

                const btnVer = document.createElement("button");
                btnVer.type = "button";
                btnVer.className = "btn btn-secondary";
                btnVer.textContent = "Ver habitación";
                btnVer.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (hab) {
                        window.location.href = `DetalleHabitacion.html?id=${hab.idHabitacion}`;
                    }
                });

                const btnEliminar = document.createElement("button");
                btnEliminar.type = "button";
                btnEliminar.className = "btn btn-danger";
                btnEliminar.textContent = "Cancelar solicitud";
                btnEliminar.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const confirmar = confirm("¿Seguro que quieres cancelar esta solicitud?");
                    if (!confirmar) return;

                    try {
                        await eliminarSolicitud(db, s.idSolicitud);
                        card.remove();
                        // Si ya no quedan más, mostrar mensaje vacío
                        if (!contenedor.children.length && msgVacio) {
                            msgVacio.classList.remove("hidden");
                        }
                    } catch (err) {
                        console.error("Error eliminando solicitud:", err);
                        alert("No se ha podido cancelar la solicitud.");
                    }
                });

                acciones.appendChild(btnVer);
                acciones.appendChild(btnEliminar);

                card.appendChild(acciones);

                contenedor.appendChild(card);
            });

        } catch (err) {
            console.error("Error en solicitudesInquilino:", err);
            contenedor.innerHTML = "<p>Se ha producido un error al cargar tus solicitudes.</p>";
            if (msgVacio) msgVacio.classList.add("hidden");
        }
    })();
});

function getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const st = tx.objectStore(storeName);
        const req = st.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror   = () => reject(req.error);
    });
}

function eliminarSolicitud(db, idSolicitud) {
    return new Promise((resolve, reject) => {
        const tx    = db.transaction(STORE_SOLICITUD, "readwrite");
        const store = tx.objectStore(STORE_SOLICITUD);
        const req   = store.delete(idSolicitud);

        req.onsuccess = () => resolve();
        req.onerror   = () => reject(req.error);
    });
}
