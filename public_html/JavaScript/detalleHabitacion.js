// JavaScript/detalleHabitacion.js
// Vista ampliada de una habitación usando IndexedDB

document.addEventListener("DOMContentLoaded", () => {

    const spanDireccion = document.getElementById("det-direccion");
    const spanCiudad    = document.getElementById("det-ciudad");
    const spanPrecio    = document.getElementById("det-precio");
    const spanLatitud   = document.getElementById("det-latitud");
    const spanLongitud  = document.getElementById("det-longitud");
    const spanEstado    = document.getElementById("det-estado");
    const imgHab        = document.getElementById("det-imagen");

    // Obtener id por query string: ?id=15
    const params = new URLSearchParams(window.location.search);
    const idStr  = params.get("id");
    const id     = idStr ? Number(idStr) : NaN;

    if (!idStr || isNaN(id)) {
        if (spanDireccion) spanDireccion.textContent = "ID de habitación no válido.";
        return;
    }

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
                    if (imgHab) {
                        imgHab.removeAttribute("src");
                        imgHab.style.display = "none";
                    }
                    return;
                }

                if (spanDireccion) spanDireccion.textContent = habitacion.direccion || "";
                if (spanCiudad)    spanCiudad.textContent    = habitacion.ciudad || "-";
                if (spanPrecio)    spanPrecio.textContent    =
                    (habitacion.precio != null ? habitacion.precio + " €/mes" : "-");
                if (spanLatitud)   spanLatitud.textContent   = habitacion.latitud  ?? "-";
                if (spanLongitud)  spanLongitud.textContent  = habitacion.longitud ?? "-";
                if (spanEstado)    spanEstado.textContent    = habitacion.estado || "Disponible";

                if (imgHab) {
                    if (habitacion.imagen) {
                        imgHab.src = habitacion.imagen;
                        imgHab.style.display = "block";
                    } else {
                        imgHab.removeAttribute("src");
                        imgHab.style.display = "none";
                    }
                }
            };

            req.onerror = () => {
                console.error("Error leyendo habitación:", req.error);
                if (spanDireccion) spanDireccion.textContent = "Error cargando la habitación.";
            };
        })
        .catch(err => {
            console.error("Error abriendo BD en detalleHabitacion:", err);
            if (spanDireccion) spanDireccion.textContent = "Error abriendo la base de datos.";
        });
});
