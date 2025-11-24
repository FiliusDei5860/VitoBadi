// JavaScript/actualizarHabitacion.js
// Carga una habitación desde IndexedDB por id y permite actualizar SOLO el precio

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("update-room-form");
    if (!form) return;

    const inputPrecio = document.getElementById("precio");

    let dbGlobal = null;
    let habitacionActual = null;

    // Obtener id desde la URL (?id=... o ?idHabitacion=...)
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("idHabitacion") || params.get("id");

    abrirBD()
        .then(db => {
            dbGlobal = db;
            console.log("BD lista en ActualizarHabitacion:", db.name);

            if (!idParam) {
                console.warn("No se ha proporcionado id de habitación en la URL.");
                return;
            }

            const id = isNaN(Number(idParam)) ? idParam : Number(idParam);

            const tx = dbGlobal.transaction(STORE_HABITACION, "readonly");
            const store = tx.objectStore(STORE_HABITACION);
            const req = store.get(id);

            req.onsuccess = (event) => {
                const hab = event.target.result;
                if (!hab) {
                    alert("No se ha encontrado la habitación a editar.");
                    return;
                }

                habitacionActual = hab;

                // Solo rellenamos precio
                if (hab.precio != null) inputPrecio.value = hab.precio;
            };

            req.onerror = (event) => {
                console.error("Error leyendo habitación:", event.target.error);
                alert("Error al cargar los datos de la habitación.");
            };
        })
        .catch(err => {
            console.error("Error al abrir BD en ActualizarHabitacion:", err);
        });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!dbGlobal || !habitacionActual) {
            alert("No se ha podido cargar la habitación a actualizar.");
            return;
        }

        const nuevoPrecio = Number(inputPrecio.value);
        if (Number.isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
            alert("Introduce un precio válido.");
            return;
        }

        habitacionActual.precio = nuevoPrecio;

        const tx = dbGlobal.transaction(STORE_HABITACION, "readwrite");
        const store = tx.objectStore(STORE_HABITACION);
        const req = store.put(habitacionActual);

        req.onsuccess = () => {
            console.log("Precio actualizado:", habitacionActual);
            alert("Precio actualizado correctamente.");
        };

        tx.oncomplete = () => {
            window.location.href = "mis_habitaciones.html";
        };

        tx.onerror = (event) => {
            console.error("Error actualizando habitación:", event.target.error);
            alert("Se ha producido un error al actualizar el precio.");
        };
    });
});
