// JavaScript/actualizarHabitacion.js
// Carga una habitación desde IndexedDB por id y permite actualizarla

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("update-room-form");
    if (!form) return;

    const inputTitulo      = document.getElementById("titulo");
    const inputDescripcion = document.getElementById("descripcion");
    const inputPrecio      = document.getElementById("precio");
    const inputDireccion   = document.getElementById("direccion");
    const inputTamanio     = document.getElementById("tamanio");

    let dbGlobal         = null;
    let habitacionActual = null;

    // Obtener id desde la URL (?id=... o ?idHabitacion=...)
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("idHabitacion") || params.get("id");

    if (!idParam) {
        console.warn("No se ha proporcionado id de habitación en la URL.");
    }

    abrirBD()
        .then(db => {
            dbGlobal = db;
            console.log("BD lista en ActualizarHabitacion:", db.name);

            if (!idParam) return;

            const id = isNaN(Number(idParam)) ? idParam : Number(idParam);

            const tx    = dbGlobal.transaction(STORE_HABITACION, "readonly");
            const store = tx.objectStore(STORE_HABITACION);
            const req   = store.get(id);

            req.onsuccess = (event) => {
                const hab = event.target.result;
                if (!hab) {
                    alert("No se ha encontrado la habitación a editar.");
                    return;
                }
                habitacionActual = hab;

                // Rellenar campos si existen
                if (hab.titulo)      inputTitulo.value      = hab.titulo;
                if (hab.descripcion) inputDescripcion.value = hab.descripcion;
                if (hab.precio != null)     inputPrecio.value    = hab.precio;
                if (hab.direccion)   inputDireccion.value   = hab.direccion;
                if (hab.tamanio != null)   inputTamanio.value    = hab.tamanio;
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

        habitacionActual.titulo      = inputTitulo.value.trim();
        habitacionActual.descripcion = inputDescripcion.value.trim();
        habitacionActual.precio      = Number(inputPrecio.value);
        habitacionActual.direccion   = inputDireccion.value.trim();
        habitacionActual.tamanio     = Number(inputTamanio.value);

        const tx    = dbGlobal.transaction(STORE_HABITACION, "readwrite");
        const store = tx.objectStore(STORE_HABITACION);
        const req   = store.put(habitacionActual);

        req.onsuccess = () => {
            console.log("Habitación actualizada:", habitacionActual);
            alert("Habitación actualizada correctamente.");
        };

        tx.oncomplete = () => {
            // Volvemos a Mis Habitaciones
            window.location.href = "mis_habitaciones.html";
        };

        tx.onerror = (event) => {
            console.error("Error actualizando habitación:", event.target.error);
            alert("Se ha producido un error al actualizar la habitación.");
        };
    });
});
