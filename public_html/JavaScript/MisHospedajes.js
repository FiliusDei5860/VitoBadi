// JavaScript/MisHospedajes.js
// Vista de inquilino: alquileres donde el usuarioActual es emailInquilino

function normalizarSrc(raw) {
    if (!raw)
        return null;
    if (raw.startsWith("data:"))
        return raw;
    if (raw.startsWith("http") || raw.startsWith("./") || raw.startsWith("/"))
        return raw;
    return `data:image/jpeg;base64,${raw}`;
}

function leerUsuarioActual() {
    try {
        const raw = sessionStorage.getItem("usuarioActual");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const st = tx.objectStore(storeName);
        const req = st.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const cont = document.getElementById("lista-hospedajes");
    const msg = document.getElementById("msg-sin-hospedajes");
    if (!cont)
        return;

    const usuario = leerUsuarioActual();
    if (!usuario?.email) {
        // si no hay login, fuera
        window.location.href = "login.html";
        return;
    }

    let alquileres = [];
    let habitaciones = [];

    try {
        const db = await abrirBD();
        alquileres = await getAllFromStore(db, STORE_ALQUILER);
        habitaciones = await getAllFromStore(db, STORE_HABITACION);
    } catch (e) {
        console.error("Error leyendo BD:", e);
    }

    // alquileres donde soy inquilino
    let misHospedajes = alquileres.filter(a =>
        a.emailInquilino === usuario.email
    );

    // ordenar por fecha fin (más reciente primero)
    misHospedajes.sort((a, b) => {
        const fa = a.fechaFinAlquiler || a.fechaFin || "";
        const fb = b.fechaFinAlquiler || b.fechaFin || "";
        return fb.localeCompare(fa);
    });

    cont.innerHTML = "";
    if (misHospedajes.length === 0) {
        msg?.classList.remove("hidden");
        return;
    }
    msg?.classList.add("hidden");

    misHospedajes.forEach(alq => {
        const hab = habitaciones.find(h => h.idHabitacion === alq.idHabitacion);

        const card = document.createElement("article");
        card.className = "solicitud-card cursor-pointer";

        const infoGroup = document.createElement("div");
        infoGroup.className = "solicitud-info-group";

        const imgDiv = document.createElement("div");
        imgDiv.className = "solicitud-imagen-placeholder";

        // imagen de la habitación
        let imgSrc = null;
        if (hab) {
            if (Array.isArray(hab.imagenes) && hab.imagenes.length > 0)
                imgSrc = hab.imagenes[0];
            else if (hab.imagen)
                imgSrc = hab.imagen;
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
        titulo.textContent = hab?.titulo || hab?.direccion || `Habitación ${alq.idHabitacion}`;

        const secundario = document.createElement("p");
        secundario.className = "solicitud-secundario";
        secundario.textContent = `${hab?.ciudad || "-"} · ${hab?.precio ?? "-"} €/mes`;

        const fechas = document.createElement("p");
        fechas.className = "text-xs text-gray-600 mt-1";
        const ini = alq.fechaInicioAlquiler || alq.fechaInicio || "-";
        const fin = alq.fechaFinAlquiler || alq.fechaFin || "-";
        fechas.innerHTML = `<strong>Desde:</strong> ${ini} · <strong>Hasta:</strong> ${fin}`;

        const propietario = document.createElement("p");
        propietario.className = "text-xs text-gray-600 mt-1";
        propietario.innerHTML = `<strong>Propietario:</strong> ${hab?.emailPropietario || "-"} `;

        textWrap.appendChild(titulo);
        textWrap.appendChild(secundario);
        textWrap.appendChild(fechas);
        textWrap.appendChild(propietario);

        infoGroup.appendChild(imgDiv);
        infoGroup.appendChild(textWrap);

        card.appendChild(infoGroup);

        // si tienes DetalleAlquiler.html reutilizable:
        card.addEventListener("click", () => {
            window.location.href = `DetalleAlquiler.html?id=${alq.idContrato}`;
        });

        cont.appendChild(card);
    });
});
