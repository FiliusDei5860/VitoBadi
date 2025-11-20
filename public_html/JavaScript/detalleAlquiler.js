// JavaScript/detalleAlquiler.js
// Vista ampliada de un alquiler usando IndexedDB (sin datos MOCK)

document.addEventListener("DOMContentLoaded", () => {

    const spanDireccion       = document.getElementById("alq-direccion");
    const spanCiudad          = document.getElementById("alq-ciudad");
    const spanPrecio          = document.getElementById("alq-precio");
    const spanLatitud         = document.getElementById("alq-latitud");
    const spanLongitud        = document.getElementById("alq-longitud");
    const spanFechaInicio     = document.getElementById("alq-fecha-inicio");
    const spanFechaFin        = document.getElementById("alq-fecha-fin");
    const spanNombreInquilino = document.getElementById("alq-nombre-inquilino");
    const spanEmailInquilino  = document.getElementById("alq-email-inquilino");
    const imgHab              = document.getElementById("alq-imagen");
    const btnVolver           = document.getElementById("btn-volver");

    // Obtener idContrato por query string: ?id=1
    const params  = new URLSearchParams(window.location.search);
    const idStr   = params.get("id");
    const idContrato = idStr ? Number(idStr) : NaN;

    if (!idStr || isNaN(idContrato)) {
        if (spanDireccion)       spanDireccion.textContent       = "ID de alquiler no válido.";
        if (spanCiudad)          spanCiudad.textContent          = "-";
        if (spanPrecio)          spanPrecio.textContent          = "-";
        if (spanLatitud)         spanLatitud.textContent         = "-";
        if (spanLongitud)        spanLongitud.textContent        = "-";
        if (spanFechaInicio)     spanFechaInicio.textContent     = "-";
        if (spanFechaFin)        spanFechaFin.textContent        = "-";
        if (spanNombreInquilino) spanNombreInquilino.textContent = "-";
        if (spanEmailInquilino)  spanEmailInquilino.textContent  = "-";
        return;
    }

    // Abrimos la BD
    abrirBD()
        .then(db => {
            const tx    = db.transaction(STORE_ALQUILER, "readonly");
            const store = tx.objectStore(STORE_ALQUILER);
            const req   = store.get(idContrato);

            req.onsuccess = () => {
                const alquiler = req.result;

                if (!alquiler) {
                    if (spanDireccion)       spanDireccion.textContent       = "Alquiler no encontrado.";
                    if (spanCiudad)          spanCiudad.textContent          = "-";
                    if (spanPrecio)          spanPrecio.textContent          = "-";
                    if (spanLatitud)         spanLatitud.textContent         = "-";
                    if (spanLongitud)        spanLongitud.textContent        = "-";
                    if (spanFechaInicio)     spanFechaInicio.textContent     = "-";
                    if (spanFechaFin)        spanFechaFin.textContent        = "-";
                    if (spanNombreInquilino) spanNombreInquilino.textContent = "-";
                    if (spanEmailInquilino)  spanEmailInquilino.textContent  = "-";
                    if (imgHab) {
                        imgHab.removeAttribute("src");
                    }
                    return;
                }

                // Rellenar fechas del alquiler
                if (spanFechaInicio) spanFechaInicio.textContent =
                    alquiler.fechaInicioAlquiler || "-";
                if (spanFechaFin)    spanFechaFin.textContent =
                    alquiler.fechaFinAlquiler || "-";

                // Ahora necesitamos la habitación y el inquilino
                cargarHabitacionEInquilino(db, alquiler);
            };

            req.onerror = (e) => {
                console.error("Error leyendo alquiler:", e.target.error);
                if (spanDireccion) spanDireccion.textContent = "Error cargando el alquiler.";
            };
        })
        .catch(err => {
            console.error("Error abriendo BD en detalleAlquiler:", err);
            if (spanDireccion) spanDireccion.textContent = "Error abriendo la base de datos.";
        });

    // Botón volver
    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            window.location.href = "MisAlquileres.html";
        });
    }

    // -----------------------------------------
    //  Función auxiliar: cargar habitación + inquilino
    // -----------------------------------------
    function cargarHabitacionEInquilino(db, alquiler) {
        const idHab   = alquiler.idHabitacion;
        const emailInq = alquiler.emailInquilino;

        // 1) Obtener habitación
        const txHab    = db.transaction(STORE_HABITACION, "readonly");
        const storeHab = txHab.objectStore(STORE_HABITACION);
        const reqHab   = storeHab.get(idHab);

        reqHab.onsuccess = () => {
            const habitacion = reqHab.result;

            if (habitacion) {
                if (spanDireccion) spanDireccion.textContent =
                    habitacion.direccion || "";
                if (spanCiudad)    spanCiudad.textContent =
                    habitacion.ciudad || "-";
                if (spanPrecio)    spanPrecio.textContent =
                    (habitacion.precio != null ? habitacion.precio + " €/mes" : "-");
                if (spanLatitud)   spanLatitud.textContent =
                    habitacion.latitud  ?? "-";
                if (spanLongitud)  spanLongitud.textContent =
                    habitacion.longitud ?? "-";

                if (imgHab) {
                    if (habitacion.imagen) {
                        imgHab.src = habitacion.imagen;
                    } else {
                        // si no tiene imagen, podemos dejar la que haya por defecto
                    }
                }
            } else {
                if (spanDireccion) spanDireccion.textContent = "Habitación no encontrada.";
                if (spanCiudad)    spanCiudad.textContent    = "-";
                if (spanPrecio)    spanPrecio.textContent    = "-";
                if (spanLatitud)   spanLatitud.textContent   = "-";
                if (spanLongitud)  spanLongitud.textContent  = "-";
            }
        };

        reqHab.onerror = (e) => {
            console.error("Error leyendo habitación:", e.target.error);
        };

        // 2) Obtener inquilino
        const txUser    = db.transaction(STORE_USUARIO, "readonly");
        const storeUser = txUser.objectStore(STORE_USUARIO);
        const reqUser   = storeUser.get(emailInq);

        reqUser.onsuccess = () => {
            const inquilino = reqUser.result;

            if (inquilino) {
                if (spanNombreInquilino) spanNombreInquilino.textContent =
                    inquilino.nombre || inquilino.email;
                if (spanEmailInquilino)  spanEmailInquilino.textContent =
                    inquilino.email || emailInq;
            } else {
                if (spanNombreInquilino) spanNombreInquilino.textContent =
                    "(Inquilino desconocido)";
                if (spanEmailInquilino)  spanEmailInquilino.textContent =
                    emailInq || "-";
            }
        };

        reqUser.onerror = (e) => {
            console.error("Error leyendo usuario inquilino:", e.target.error);
        };
    }
});
