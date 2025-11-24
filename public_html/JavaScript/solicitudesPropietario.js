// JavaScript/solicitudesPropietario.js
// Lista REAL de solicitudes recibidas por habitaciones del propietario logeado

document.addEventListener("DOMContentLoaded", async () => {
    const cont = document.getElementById("lista-solicitudes-prop");
    const msg  = document.getElementById("msg-no-solicitudes");
    if (!cont) return;

    // leer usuario logeado
    let usuarioActual = null;
    try {
        const raw = sessionStorage.getItem("usuarioActual");
        usuarioActual = raw ? JSON.parse(raw) : null;
    } catch (e) {}

    if (!usuarioActual?.email) {
        cont.innerHTML = "<p>Debes iniciar sesión.</p>";
        if (msg) msg.classList.add("hidden");
        return;
    }

    try {
        const db = await abrirBD();

        const [solicitudes, habitaciones, usuarios, alquileres] = await Promise.all([
            getAllFromStore(db, STORE_SOLICITUD),
            getAllFromStore(db, STORE_HABITACION),
            getAllFromStore(db, STORE_USUARIO),
            getAllFromStore(db, STORE_ALQUILER)
        ]);

        const mapaHab = new Map(habitaciones.map(h => [h.idHabitacion, h]));
        const mapaUsr = new Map(usuarios.map(u => [u.email, u]));

        // solicitudes solo de habitaciones del propietario logeado
        let solsProp = solicitudes.filter(s => {
            const hab = mapaHab.get(s.idHabitacion);
            return hab && hab.emailPropietario === usuarioActual.email;
        });

        // opcional: si ya hay alquiler activo de esa habitación, no mostrar solicitudes
        const hoyISO = new Date().toISOString().slice(0,10);
        const setOcupadas = new Set(
            alquileres
              .filter(a => !a.fechaFinAlquiler || a.fechaFinAlquiler >= hoyISO)
              .map(a => a.idHabitacion)
        );
        solsProp = solsProp.filter(s => !setOcupadas.has(s.idHabitacion));

        cont.innerHTML = "";

        if (solsProp.length === 0) {
            if (msg) msg.classList.remove("hidden");
            return;
        }
        if (msg) msg.classList.add("hidden");

        // orden más reciente primero (si hay fechaSolicitud)
        solsProp.sort((a,b) => (b.fechaSolicitud || "").localeCompare(a.fechaSolicitud || ""));

        solsProp.forEach(sol => {
            const hab = mapaHab.get(sol.idHabitacion);
            const inq = mapaUsr.get(sol.emailInquilinoPosible);

            const card = document.createElement("article");
            card.className = "solicitud-card cursor-pointer";

            const left = document.createElement("div");
            left.className = "solicitud-info-group";

            const img = document.createElement("div");
            img.className = "solicitud-imagen-placeholder";

            let imgSrc = null;
            if (hab) {
                if (Array.isArray(hab.imagenes) && hab.imagenes.length) imgSrc = hab.imagenes[0];
                else if (hab.imagen) imgSrc = hab.imagen;
            }
            if (imgSrc) {
                img.style.backgroundImage = `url('${imgSrc}')`;
                img.style.backgroundSize = "cover";
                img.style.backgroundPosition = "center";
            }

            const text = document.createElement("div");
            text.innerHTML = `
                <h4 class="solicitud-titulo">${hab?.titulo || hab?.direccion || "Habitación"}</h4>
                <p class="solicitud-secundario">${hab?.direccion || "-"} – ${hab?.ciudad || "-"}</p>
                <p class="font-bold text-indigo-600">${hab?.precio != null ? hab.precio + " €/mes" : "-"}</p>
                <p class="text-xs mt-1"><strong>Inquilino:</strong> ${inq?.nombre || sol.emailInquilinoPosible}</p>
                ${sol.fechaInicio ? `<p class="text-xs">${sol.fechaInicio} → ${sol.fechaFin || "-"}</p>` : ""}
            `;

            left.appendChild(img);
            left.appendChild(text);

            const right = document.createElement("div");
            right.className = "flex flex-col gap-2 min-w-[150px]";

            const badge = document.createElement("span");
            const estado = sol.estado || "Pendiente";
            const base = "px-3 py-1 rounded-full text-xs font-semibold text-center ";
            badge.className =
                estado === "Aceptada" ? base + "bg-green-100 text-green-700" :
                estado === "Rechazada" ? base + "bg-red-100 text-red-700" :
                base + "bg-yellow-100 text-yellow-700";
            badge.textContent = `Estado: ${estado}`;

            const btnAceptar = document.createElement("button");
            btnAceptar.className = "btn btn-primary";
            btnAceptar.textContent = "Aceptar";
            btnAceptar.disabled = estado !== "Pendiente";

            const btnRechazar = document.createElement("button");
            btnRechazar.className = "btn btn-secondary";
            btnRechazar.textContent = "Rechazar";
            btnRechazar.disabled = estado !== "Pendiente";

            btnAceptar.addEventListener("click", async (e) => {
                e.stopPropagation();
                await aceptarSolicitud(db, sol);
                location.reload();
            });

            btnRechazar.addEventListener("click", async (e) => {
                e.stopPropagation();
                await rechazarSolicitud(db, sol.idSolicitud);
                location.reload();
            });

            right.appendChild(badge);
            right.appendChild(btnAceptar);
            right.appendChild(btnRechazar);

            card.appendChild(left);
            card.appendChild(right);

            // ir al detalle
            card.addEventListener("click", () => {
                window.location.href = `DetalleSolicitudPropietario.html?id=${sol.idSolicitud}`;
            });

            cont.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        cont.innerHTML = "<p>Error cargando solicitudes.</p>";
    }
});

// --------- Acciones BD ---------

async function aceptarSolicitud(db, sol) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_ALQUILER, STORE_SOLICITUD], "readwrite");
        const stAlq = tx.objectStore(STORE_ALQUILER);
        const stSol = tx.objectStore(STORE_SOLICITUD);

        // calcular idContrato siguiente
        const reqAll = stAlq.getAll();
        reqAll.onsuccess = () => {
            const all = reqAll.result || [];
            const nextId = all.reduce((m,a)=>Math.max(m, a.idContrato||0), 0) + 1;

            const nuevoAlquiler = {
                idContrato: nextId,
                idHabitacion: sol.idHabitacion,
                emailInquilino: sol.emailInquilinoPosible,
                fechaInicioAlquiler: sol.fechaInicio || sol.fechaInicioAlquiler || new Date().toISOString().slice(0,10),
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

async function rechazarSolicitud(db, idSolicitud) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SOLICITUD, "readwrite");
        tx.objectStore(STORE_SOLICITUD).delete(idSolicitud);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Aux
function getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const st = tx.objectStore(storeName);
        const req = st.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}
