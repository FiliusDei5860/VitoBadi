// JavaScript/actualizarHabitacion.js
// Carga una habitación desde IndexedDB por id, muestra sus imágenes y permite actualizarlas (varias, base64)

document.addEventListener("DOMContentLoaded", () => {
    const form             = document.getElementById("update-room-form");
    const inputTitulo      = document.getElementById("titulo");
    const inputDescripcion = document.getElementById("descripcion");
    const inputPrecio      = document.getElementById("precio");
    const inputDireccion   = document.getElementById("direccion");
    const inputTamanio     = document.getElementById("tamanio");
    const inputImagenes    = document.getElementById("imagenes");
    const dropZone         = document.getElementById("drop-zone");
    const previewContainer = document.getElementById("preview-container");

    if (!form) return;

    let dbGlobal         = null;
    let habitacionActual = null;
    let selectedFiles    = []; // nuevas imágenes seleccionadas

    // --------- Auxiliar: leer archivo en base64 ----------
    function leerArchivoComoDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = () => resolve(reader.result);   // DataURL base64
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    // --------- Previsualización ----------
    function limpiarPreview() {
        if (previewContainer) {
            previewContainer.innerHTML = "";
        }
    }

    function mostrarPreviewDesdeBase64(listaBase64) {
        if (!previewContainer) return;
        limpiarPreview();

        (listaBase64 || []).forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            img.className = "w-full h-24 object-cover rounded-lg shadow-sm";
            previewContainer.appendChild(img);
        });
    }

    function mostrarPreviewDeFiles(files) {
        if (!previewContainer) return;
        limpiarPreview();

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.className = "w-full h-24 object-cover rounded-lg shadow-sm";
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    // --------- Drag & Drop ----------
    if (dropZone && inputImagenes) {

        // Click sobre la zona → abrir selector
        dropZone.addEventListener("click", () => {
            inputImagenes.click();
        });

        // Cambio en input file
        inputImagenes.addEventListener("change", (e) => {
            const files = Array.from(e.target.files || []);
            const images = files.filter(f => f.type.startsWith("image/"));
            selectedFiles = images;
            mostrarPreviewDeFiles(selectedFiles);
        });

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("border-indigo-500", "bg-indigo-50");
        });

        dropZone.addEventListener("dragleave", (e) => {
            e.preventDefault();
            dropZone.classList.remove("border-indigo-500", "bg-indigo-50");
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("border-indigo-500", "bg-indigo-50");

            const files  = Array.from(e.dataTransfer.files || []);
            const images = files.filter(f => f.type.startsWith("image/"));

            if (images.length > 0) {
                selectedFiles = images;
                mostrarPreviewDeFiles(selectedFiles);
            }
        });
    }

    // --------- Obtener id desde la URL (?id=... o ?idHabitacion=...) ----------
    const params  = new URLSearchParams(window.location.search);
    const idParam = params.get("idHabitacion") || params.get("id");

    if (!idParam) {
        console.warn("No se ha proporcionado id de habitación en la URL.");
    }

    // --------- Cargar BD y habitación ----------
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

                // Rellenar campos básicos
                if (hab.titulo)        inputTitulo.value      = hab.titulo;
                if (hab.descripcion)   inputDescripcion.value = hab.descripcion;
                if (hab.precio != null)    inputPrecio.value    = hab.precio;
                if (hab.direccion)     inputDireccion.value   = hab.direccion;
                if (hab.tamanio != null)  inputTamanio.value    = hab.tamanio;

                // Mostrar imágenes actuales:
                //  - Si tiene array imagenes, usamos ese
                //  - Si no, pero tiene imagen, usamos esa única
                const listaBase64 = Array.isArray(hab.imagenes) && hab.imagenes.length > 0
                    ? hab.imagenes
                    : (hab.imagen ? [hab.imagen] : []);

                mostrarPreviewDesdeBase64(listaBase64);
            };

            req.onerror = (event) => {
                console.error("Error leyendo habitación:", event.target.error);
                alert("Error al cargar los datos de la habitación.");
            };
        })
        .catch(err => {
            console.error("Error al abrir BD en ActualizarHabitacion:", err);
        });

    // --------- Submit ----------
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!dbGlobal || !habitacionActual) {
            alert("No se ha podido cargar la habitación a actualizar.");
            return;
        }

        // Actualizar campos de texto/número
        habitacionActual.titulo      = inputTitulo.value.trim();
        habitacionActual.descripcion = inputDescripcion.value.trim();
        habitacionActual.precio      = Number(inputPrecio.value);
        habitacionActual.direccion   = inputDireccion.value.trim();
        habitacionActual.tamanio     = Number(inputTamanio.value);

        try {
            // Si el usuario ha seleccionado nuevas imágenes,
            // sustituimos las anteriores por completo
            if (selectedFiles && selectedFiles.length > 0) {
                const imagenesBase64 = await Promise.all(
                    selectedFiles.map(leerArchivoComoDataURL)
                );
                habitacionActual.imagen  = imagenesBase64[0];
                habitacionActual.imagenes = imagenesBase64;
            }
            // Si NO ha seleccionado imágenes nuevas → se mantienen las que ya tenía

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

        } catch (err) {
            console.error("Error procesando imágenes en actualización:", err);
            alert("Error al procesar las imágenes.");
        }
    });
});
