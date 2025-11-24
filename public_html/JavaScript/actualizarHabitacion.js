// JavaScript/actualizarHabitacion.js
// Carga una habitación desde IndexedDB por id, muestra sus imágenes y permite actualizarlas (varias, base64)
// JavaScript/actualizarHabitacion.js
// Actualiza ÚNICAMENTE el precio de una habitación en IndexedDB

document.addEventListener("DOMContentLoaded", () => {
    const form        = document.getElementById("update-room-form");
    const inputPrecio = document.getElementById("precio");

    if (!form || !inputPrecio) {
        console.warn("No se encuentra el formulario o el input de precio en ActualizarHabitacion.");
        return;
    }

    let dbGlobal         = null;
    let habitacionActual = null;

    // 1) Obtener id de habitación desde la URL (?idHabitacion=... o ?id=...)
    const params  = new URLSearchParams(window.location.search);
    const idParam = params.get("idHabitacion") || params.get("id");

    if (!idParam) {
        console.warn("No se ha proporcionado id de habitación en la URL.");
        alert("No se ha especificado ninguna habitación a actualizar.");
        return;
    }

    // 2) Abrir BD y cargar la habitación
    abrirBD()
        .then(db => {
            dbGlobal = db;
            console.log("BD lista en ActualizarHabitacion:", db.name);

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

                // Rellenar el campo de precio con el valor actual
                if (hab.precio != null) {
                    inputPrecio.value = hab.precio;
                }
            };

            req.onerror = (event) => {
                console.error("Error leyendo habitación:", event.target.error);
                alert("Error al cargar los datos de la habitación.");
            };
        })
        .catch(err => {
            console.error("Error al abrir BD en ActualizarHabitacion:", err);
            alert("No se ha podido abrir la base de datos.");
        });

    // 3) Enviar formulario → actualizar SOLO el precio
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!dbGlobal || !habitacionActual) {
            alert("No se ha podido cargar la habitación a actualizar.");
            return;
        }

        const precioValor = inputPrecio.value;
        const precioNum   = Number(precioValor);

        // Validación básica del precio
        if (!precioValor || Number.isNaN(precioNum) || precioNum <= 0) {
            alert("El precio debe ser un número mayor que 0.");
            return;
        }

        // Actualizamos ÚNICAMENTE el precio
        habitacionActual.precio = precioNum;

        const tx    = dbGlobal.transaction(STORE_HABITACION, "readwrite");
        const store = tx.objectStore(STORE_HABITACION);
        const req   = store.put(habitacionActual);

        req.onsuccess = () => {
            console.log("Habitación actualizada (solo precio):", habitacionActual);
            alert("Precio actualizado correctamente.");
        };

        tx.oncomplete = () => {
            // Volver a Mis Habitaciones
            window.location.href = "mis_habitaciones.html";
        };

        tx.onerror = (event) => {
            console.error("Error actualizando habitación:", event.target.error);
            alert("Se ha producido un error al actualizar el precio de la habitación.");
        };
    });
});
