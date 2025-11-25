// JavaScript/misAlquileres.js
// Lista de alquileres donde el usuario actual participa (como propietario o inquilino)

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("lista-alquileres");
    if (!contenedor)
        return;

    let usuarioActual = null;

    // Leer usuario logeado
    try {
        const stored = sessionStorage.getItem("usuarioActual");
        if (stored) {
            usuarioActual = JSON.parse(stored);
        }
    } catch (e) {
        console.warn("No se ha podido leer usuarioActual:", e);
    }

    if (!usuarioActual || !usuarioActual.email) {
        contenedor.innerHTML = "<p>Debes iniciar sesión para ver tus alquileres.</p>";
        return;
    }

    (async () => {
        try {
            const db = await abrirBD();

            const [alquileres, habitaciones, usuarios] = await Promise.all([
                getAllFromStore(db, STORE_ALQUILER),
                getAllFromStore(db, STORE_HABITACION),
                getAllFromStore(db, STORE_USUARIO)
            ]);

            const mapaHab = new Map(habitaciones.map(h => [h.idHabitacion, h]));
            const mapaUsr = new Map(usuarios.map(u => [u.email, u]));

            const hoyISO = new Date().toISOString().slice(0, 10);

            // Filtrar alquileres donde el usuario es propietario o inquilino
            const alquileresUsuario = alquileres.filter(a => {
                const hab = mapaHab.get(a.idHabitacion);
                if (!hab)
                    return false;
                const soyInquilino = a.emailInquilino === usuarioActual.email;
                const soyPropietario = hab.emailPropietario === usuarioActual.email;
                return soyInquilino || soyPropietario;
            });

            contenedor.innerHTML = "";

            if (alquileresUsuario.length === 0) {
                contenedor.innerHTML = "<p>No tienes alquileres registrados.</p>";
                return;
            }

            alquileresUsuario.forEach(a => {
                const hab = mapaHab.get(a.idHabitacion);
                const inq = mapaUsr.get(a.emailInquilino);

                const soyInquilino = a.emailInquilino === usuarioActual.email;
                const soyPropietario = hab && hab.emailPropietario === usuarioActual.email;

                const card = document.createElement("article");
                card.className = "solicitud-card";

                const infoGroup = document.createElement("div");
                infoGroup.className = "solicitud-info-group";

                const imgDiv = document.createElement("div");
                imgDiv.className = "solicitud-imagen-placeholder";

                let imgSrc = null;
                if (hab) {
                    if (Array.isArray(hab.imagenes) && hab.imagenes.length > 0) {
                        imgSrc = hab.imagenes[0];
                    } else if (hab.imagen) {
                        imgSrc = hab.imagen;
                    }
                }
                if (imgSrc) {
                    imgDiv.style.backgroundImage = `url('${imgSrc}')`;
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
                const fIni = a.fechaInicioAlquiler || "-";
                const fFin = a.fechaFinAlquiler || "-";

                p1.textContent = `${ciudadTxt} · ${precioTxt} · ${fIni} → ${fFin}`;

                const p2 = document.createElement("p");
                p2.className = "solicitud-secundario";

                let rolTxt = "";
                if (soyPropietario && soyInquilino) {
                    rolTxt = "Tú eres propietario e inquilino (caso raro).";
                } else if (soyPropietario) {
                    rolTxt = `Inquilino: ${inq?.nombre || a.emailInquilino}`;
                } else if (soyInquilino) {
                    rolTxt = `Propietario: ${hab?.emailPropietario || "-"}`;
                }

                const estadoTxt = (a.fechaFinAlquiler && a.fechaFinAlquiler < hoyISO)
                        ? "Histórico"
                        : "Activo";

                p2.textContent = `${rolTxt} · Estado: ${estadoTxt}`;

                textWrap.appendChild(titulo);
                textWrap.appendChild(p1);
                textWrap.appendChild(p2);

                infoGroup.appendChild(imgDiv);
                infoGroup.appendChild(textWrap);

                card.appendChild(infoGroup);

                // Enlace a detalle
                card.addEventListener("click", () => {
                    window.location.href = `DetalleAlquiler.html?id=${a.idContrato}`;
                });

                contenedor.appendChild(card);
            });

        } catch (err) {
            console.error("Error en misAlquileres:", err);
            contenedor.innerHTML = "<p>Se ha producido un error al cargar tus alquileres.</p>";
        }
    })();
});

// Auxiliar: leer todos los registros de un store
function getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const st = tx.objectStore(storeName);
        const req = st.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}
