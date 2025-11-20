// JavaScript/detalleHabitacion.js
// Vista ampliada de una habitación usando IndexedDB (sin datos MOCK)

document.addEventListener("DOMContentLoaded", () => {

    const spanDireccion = document.getElementById("hab-direccion");
    const spanCiudad    = document.getElementById("hab-ciudad");
    const spanPrecio    = document.getElementById("hab-precio");
    const spanLatitud   = document.getElementById("hab-latitud");
    const spanLongitud  = document.getElementById("hab-longitud");
    const spanEstado    = document.getElementById("hab-estado");
    const imgHab        = document.getElementById("hab-imagen");
    const btnVolver     = document.getElementById("btn-volver");

    // Obtener id de la URL: ?id=15 o ?idHabitacion=15
    const params   = new URLSearchParams(window.location.search);
    const idParam  = params.get("idHabitacion") || params.get("id");
    const id       = idParam ? Number(idParam) : NaN;

    if (!idParam || isNaN(id)) {
        if (spanDireccion) spanDireccion.textContent = "ID de habitación no válido.";
        if (spanCiudad)    spanCiudad.textContent    = "-";
        if (spanPrecio)    spanPrecio.textContent    = "-";
        if (spanLatitud)   spanLatitud.textContent   = "-";
        if (spanLongitud)  spanLongitud.textContent  = "-";
        if (spanEstado)    spanEstado.textContent    = "Desconocido";
        return;
    }

    // Abrir BD y leer habitación
    abrirBD()
        .then(db => {
            const tx    = db.transaction(STORE_HABITACION, "readonly");
            const store = tx.objectStore(STORE_HABITACION);
            const req   = store.get(id);

            req.onsuccess = () => {
                const habitacion = req.result;

                if (!habitacion) {
                    if (spanDireccion) spanDireccion.textContent = "Habitación no encontrada.";
                    if (spanCiudad)    spanCiudad.textContent    = "-";
                    if (spanPrecio)    spanPrecio.textContent    = "-";
                    if (spanLatitud)   spanLatitud.textContent   = "-";
                    if (spanLongitud)  spanLongitud.textContent  = "-";
                    if (spanEstado)    spanEstado.textContent    = "Desconocido";
                    // Dejamos la imagen por defecto del HTML
                    return;
                }

                // Campos principales
                if (spanDireccion) spanDireccion.textContent =
                    habitacion.direccion || "";
                if (spanCiudad)    spanCiudad.textContent    =
                    habitacion.ciudad || "-";
                if (spanPrecio)    spanPrecio.textContent   =
                    (habitacion.precio != null ? habitacion.precio + " €/mes" : "-");
                if (spanLatitud)   spanLatitud.textContent  =
                    habitacion.latitud  ?? "-";
                if (spanLongitud)  spanLongitud.textContent =
                    habitacion.longitud ?? "-";

                // Estado (si no existe, asumimos "Disponible")
                if (spanEstado) {
                    spanEstado.textContent = habitacion.estado || "Disponible";
                }

                // Imagen:
                // - Si hay array imagenes y tiene algo → usamos la primera
                // - Si no, pero hay imagen suelta → usamos esa
                // - Si no hay ninguna → se queda el icono por defecto del HTML
                if (imgHab) {
                    let src = null;

                    if (Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0) {
                        src = habitacion.imagenes[0];
                    } else if (habitacion.imagen) {
                        src = habitacion.imagen;
                    }

                    if (src) {
                        imgHab.src = src;
                    }
                }
            };

            req.onerror = (e) => {
                console.error("Error leyendo habitación:", e.target.error);
                if (spanDireccion) spanDireccion.textContent = "Error cargando la habitación.";
            };
        })
        .catch(err => {
            console.error("Error abriendo BD en detalleHabitacion:", err);
            if (spanDireccion) spanDireccion.textContent = "Error abriendo la base de datos.";
        });

    // Botón volver
    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            window.location.href = "mis_habitaciones.html";
        });
    }
});
