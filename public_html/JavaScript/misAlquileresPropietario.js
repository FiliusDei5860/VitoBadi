// JavaScript/misAlquileresPropietario.js
// Alquileres de habitaciones donde el usuario actual ES PROPIETARIO

function normalizarSrc(raw) {
    if (!raw)
        return null;
    if (raw.startsWith("data:"))
        return raw;
    if (raw.startsWith("http") || raw.startsWith("./") || raw.startsWith("/"))
        return raw;
    return `data:image/jpeg;base64,${raw}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("lista-alquileres");
    if (!contenedor)
        return;

    let usuarioActual = null;
    try {
        const stored = sessionStorage.getItem("usuarioActual");
        usuarioActual = stored ? JSON.parse(stored) : null;
    } catch {
    }

    if (!usuarioActual?.email) {
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

            // ✅ SOLO alquileres de MIS habitaciones
            const alquileresPropietario = alquileres.filter(a => {
                const hab = mapaHab.get(a.idHabitacion);
                return hab && hab.emailPropietario === usuarioActual.email;
            });

            contenedor.innerHTML = "";

            if (alquileresPropietario.length === 0) {
                contenedor.innerHTML = "<p>No tienes alquileres de tus propiedades.</p>";
                return;
            }

            alquileresPropietario.forEach(a => {
                const hab = mapaHab.get(a.idHabitacion);
                const inq = mapaUsr.get(a.emailInquilino);

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
                imgSrc = normalizarSrc(imgSrc);

                if (imgSrc) {
                    imgDiv.style.backgroundImage = `url('${imgSrc}')`;
                    imgDiv.style.backgroundSize = "cover";
                    imgDiv.style.backgroundPosition = "center";
                }

                const textWrap = document.createElement("div");

                const titulo = document.createElement("h3");
                titulo.className = "solicitud-titulo";
                titulo.textContent = hab?.direccion || hab?.titulo || "Habitación";

                const p1 = document.createElement("p");
                p1.className = "solicitud-secundario";

                const ciudadTxt = hab?.ciudad || "-";
                const precioTxt = hab?.precio != null ? hab.precio + " €/mes" : "-";
                const fIni = a.fechaInicioAlquiler || "-";
                const fFin = a.fechaFinAlquiler || "-";

                p1.textContent = `${ciudadTxt} · ${precioTxt} · ${fIni} → ${fFin}`;

                const p2 = document.createElement("p");
                p2.className = "solicitud-secundario";

                const estadoTxt = (a.fechaFinAlquiler && a.fechaFinAlquiler < hoyISO)
                        ? "Histórico"
                        : "Activo";

                p2.textContent = `Inquilino: ${inq?.nombre || a.emailInquilino} · Estado: ${estadoTxt}`;

                textWrap.appendChild(titulo);
                textWrap.appendChild(p1);
                textWrap.appendChild(p2);

                infoGroup.appendChild(imgDiv);
                infoGroup.appendChild(textWrap);
                card.appendChild(infoGroup);

                card.addEventListener("click", () => {
                    window.location.href = `DetalleAlquiler.html?id=${a.idContrato}`;
                });

                contenedor.appendChild(card);
            });

        } catch (err) {
            console.error("Error en misAlquileresPropietario:", err);
            contenedor.innerHTML = "<p>Error al cargar tus alquileres de propiedades.</p>";
        }
    })();
});

function getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const st = tx.objectStore(storeName);
        const req = st.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}
