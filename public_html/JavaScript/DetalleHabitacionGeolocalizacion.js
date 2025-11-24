// JavaScript/DetalleHabitacionGeolocalizacion.js
// Detalle de habitación + enviar solicitud usando emailInquilinoPosible

document.addEventListener("DOMContentLoaded", async () => {

    // ======= Referencias HTML =======
    const imgEl = document.getElementById("detalle-imagen");
    const tituloEl = document.getElementById("detalle-titulo");
    const subtituloEl = document.getElementById("detalle-subtitulo");

    const dirEl = document.getElementById("detalle-direccion");
    const ciudadEl = document.getElementById("detalle-ciudad");
    const precioEl = document.getElementById("detalle-precio");
    const tamanoEl = document.getElementById("detalle-tamano");
    const descEl = document.getElementById("detalle-descripcion");

    const btnSolicitar = document.getElementById("btn-solicitar");
    const msgEl = document.getElementById("detalle-msg");

    // ======= Helpers =======
    function getUsuarioActual() {
        try {
            return JSON.parse(sessionStorage.getItem("usuarioActual"));
        } catch {
            return null;
        }
    }

    function getIdFromQuery() {
        const params = new URLSearchParams(window.location.search);
        return Number(params.get("id"));
    }

    function setMsg(t, tipo = "info") {
        msgEl.textContent = t;
        msgEl.className =
                "text-sm " + (tipo === "ok" ? "text-green-600" :
                        tipo === "error" ? "text-red-600" :
                        "text-gray-600");
    }

    function aplicarBlurImagen(logeado) {
        imgEl.classList.toggle("room-card-image-blurred", !logeado);
    }

    function getAllFromStore(db, store) {
        return new Promise((resolve, reject) => {
            const req = db.transaction(store, "readonly")
                    .objectStore(store).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    function addToStore(db, store, obj) {
        return new Promise((resolve, reject) => {
            const req = db.transaction(store, "readwrite")
                    .objectStore(store).add(obj);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    // ======== LÓGICA PRINCIPAL ========
    const usuario = getUsuarioActual();
    const logeado = !!usuario?.email;
    aplicarBlurImagen(logeado);

    const idHabitacion = getIdFromQuery();
    if (!idHabitacion) {
        subtituloEl.textContent = "ID no válido.";
        btnSolicitar.disabled = true;
        return;
    }

    let db = null;
    try {
        db = await abrirBD();
    } catch {
        subtituloEl.textContent = "Error abriendo BD.";
        btnSolicitar.disabled = true;
        return;
    }

    // ====== CARGAR HABITACIÓN ======
    let habitacion = await new Promise(resolve => {
        const req = db.transaction(STORE_HABITACION, "readonly")
                .objectStore(STORE_HABITACION)
                .get(idHabitacion);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
    });

    if (!habitacion) {
        subtituloEl.textContent = "Habitación no encontrada.";
        btnSolicitar.disabled = true;
        return;
    }

    // ====== Pintar datos ======
    tituloEl.textContent = habitacion.titulo || habitacion.direccion;
    subtituloEl.textContent = "Detalle de la habitación";

    dirEl.textContent = habitacion.direccion || "-";
    ciudadEl.textContent = habitacion.ciudad || "-";
    precioEl.textContent = habitacion.precio + " €/mes";
    tamanoEl.textContent = habitacion.tamano || "-";
    descEl.textContent = habitacion.descripcion || "-";

    // Imagen
    let imgSrc = null;
    if (habitacion.imagenes?.length > 0)
        imgSrc = habitacion.imagenes[0];
    else if (habitacion.imagen)
        imgSrc = habitacion.imagen;

    imgEl.src = imgSrc || "./Public_icons/hab1.png";

    aplicarBlurImagen(logeado);

    // PROPIETARIO → NO puede solicitar
    if (habitacion.emailPropietario === usuario?.email) {
        btnSolicitar.textContent = "Es tu habitación";
        btnSolicitar.disabled = true;
        setMsg("No puedes solicitar tu propia habitación.", "error");
        return;
    }

    // NO LOGEADO
    if (!logeado) {
        btnSolicitar.textContent = "Login para solicitar";
        btnSolicitar.onclick = () => window.location.href = "login.html";
        setMsg("Inicia sesión para solicitar.");
        return;
    }

    // ====== Comprobar si ya tiene solicitud ======
    const todasSolicitudes = await getAllFromStore(db, STORE_SOLICITUD);

    const yaSolicitada = todasSolicitudes.some(
            s => s.idHabitacion === idHabitacion &&
                s.emailInquilinoPosible === usuario.email
    );

    if (yaSolicitada) {
        btnSolicitar.textContent = "Solicitud ya enviada";
        btnSolicitar.disabled = true;
        setMsg("Ya habías enviado una solicitud.", "info");
        return;
    }

    // ====== ENVIAR SOLICITUD ======
    btnSolicitar.onclick = async () => {
        const nuevaSolicitud = {
            idSolicitud: Date.now(),
            idHabitacion,
            emailInquilinoPosible: usuario.email,
            fechaSolicitud: new Date().toISOString().slice(0, 10)
        };

        try {
            await addToStore(db, STORE_SOLICITUD, nuevaSolicitud);
            btnSolicitar.textContent = "Solicitud enviada";
            btnSolicitar.disabled = true;
            setMsg("Solicitud enviada correctamente.", "ok");

        } catch (e) {
            console.error(e);
            setMsg("Error enviando solicitud.", "error");
        }
    };

});
