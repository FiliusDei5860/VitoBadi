// JavaScript/misHabitaciones.js
// Lista de habitaciones donde el usuario actual es propietario

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("lista-mis-habitaciones");
    const msgVacio   = document.getElementById("mensaje-sin-habitaciones");
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
        contenedor.innerHTML = "<p>Debes iniciar sesión para ver tus habitaciones.</p>";
        if (msgVacio) msgVacio.classList.add("hidden");
        return;
    }

    (async () => {
        try {
            const db = await abrirBD();

            const habitaciones = await new Promise((resolve, reject) => {
                const tx    = db.transaction(STORE_HABITACION, "readonly");
                const store = tx.objectStore(STORE_HABITACION);
                const req   = store.index("porCiudad") ? store.getAll() : store.getAll();
                // da igual el índice, usamos getAll

                req.onsuccess = () => resolve(req.result || []);
                req.onerror   = () => reject(req.error);
            });

            const mias = habitaciones.filter(h => h.emailPropietario === usuarioActual.email);

            contenedor.innerHTML = "";

            if (mias.length === 0) {
                if (msgVacio) msgVacio.classList.remove("hidden");
                return;
            } else {
                if (msgVacio) msgVacio.classList.add("hidden");
            }

            mias.forEach(h => {
                const card = document.createElement("article");
                card.className = "solicitud-card";

                const infoGroup = document.createElement("div");
                infoGroup.className = "solicitud-info-group";

                const imgDiv = document.createElement("div");
                imgDiv.className = "solicitud-imagen-placeholder";

                let src = null;
                if (Array.isArray(h.imagenes) && h.imagenes.length > 0) {
                    src = h.imagenes[0];
                } else if (h.imagen) {
                    src = h.imagen;
                }
                if (src) {
                    imgDiv.style.backgroundImage = `url('${src}')`;
                    imgDiv.style.backgroundSize = "cover";
                    imgDiv.style.backgroundPosition = "center";
                }

                const textWrap = document.createElement("div");

                const titulo = document.createElement("h3");
                titulo.className = "solicitud-titulo";
                titulo.textContent = h.titulo || h.direccion || "Habitación";

                const p1 = document.createElement("p");
                p1.className = "solicitud-secundario";

                const ciudadTxt = h.ciudad || "-";
                const precioTxt = h.precio != null ? h.precio + " €/mes" : "-";
                const tamTxt    = h.tamanio != null ? h.tamanio + " m²" : "";

                p1.textContent = `${ciudadTxt} · ${precioTxt}${tamTxt ? " · " + tamTxt : ""}`;

                textWrap.appendChild(titulo);
                textWrap.appendChild(p1);

                infoGroup.appendChild(imgDiv);
                infoGroup.appendChild(textWrap);

                card.appendChild(infoGroup);

                // Acciones
                const acciones = document.createElement("div");
                acciones.className = "flex gap-2 mt-2";

                const btnDetalle = document.createElement("button");
                btnDetalle.type = "button";
                btnDetalle.className = "btn btn-secondary";
                btnDetalle.textContent = "Ver detalle";
                btnDetalle.addEventListener("click", (e) => {
                    e.stopPropagation();
                    window.location.href = `DetalleHabitacion.html?id=${h.idHabitacion}`;
                });

                const btnEditar = document.createElement("button");
                btnEditar.type = "button";
                btnEditar.className = "btn btn-primary";
                btnEditar.textContent = "Editar";
                btnEditar.addEventListener("click", (e) => {
                    e.stopPropagation();
                    window.location.href = `ActualizarHabitacion.html?id=${h.idHabitacion}`;
                });

                acciones.appendChild(btnDetalle);
                acciones.appendChild(btnEditar);

                card.appendChild(acciones);

                contenedor.appendChild(card);
            });

        } catch (err) {
            console.error("Error en misHabitaciones:", err);
            contenedor.innerHTML = "<p>Se ha producido un error al cargar tus habitaciones.</p>";
            if (msgVacio) msgVacio.classList.add("hidden");
        }
    })();
});
