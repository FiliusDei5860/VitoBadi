// JavaScript/createHabitacion.js
// Crear una nueva habitación en IndexedDB con ID secuencial y VARIAS imágenes en base64

console.log("CARGADO createHabitacion.js");

document.addEventListener("DOMContentLoaded", () => {

    let dbGlobal = null;

    // Abrir BD
    abrirBD()
        .then(db => {
            dbGlobal = db;
            console.log("BD lista en CreateHabitacion:", db.name);
        })
        .catch(err => console.error("Error abriendo BD:", err));

    const form           = document.getElementById("create-room-form");
    const inputTitulo    = document.getElementById("titulo");
    const inputDesc      = document.getElementById("descripcion");
    const inputPrecio    = document.getElementById("precio");
    const inputDir       = document.getElementById("direccion");
    const inputTam       = document.getElementById("tamanio");
    const inputImagenes  = document.getElementById("imagenes");
    const dropZone       = document.getElementById("drop-zone");
    const previewContainer = document.getElementById("preview-container");

    if (!form) return;

    // Ficheros seleccionados (drag&drop o input)
    let selectedFiles = [];

    // ==============================
    //  Auxiliar: siguiente ID
    // ==============================
    function obtenerSiguienteIdHabitacion(db) {
        return new Promise((resolve, reject) => {
            const tx    = db.transaction(STORE_HABITACION, "readonly");
            const store = tx.objectStore(STORE_HABITACION);
            const req   = store.getAll();

            req.onsuccess = () => {
                const habitaciones = req.result || [];
                if (habitaciones.length === 0) {
                    resolve(1);
                    return;
                }
                const maxId = Math.max(...habitaciones.map(h => h.idHabitacion));
                resolve(maxId + 1);
            };

            req.onerror = () => reject(req.error);
        });
    }

    // ==============================
    //  Auxiliar: leer archivo → base64
    // ==============================
    function leerArchivoComoDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = () => resolve(reader.result);   // DataURL (base64)
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    // ==============================
    //  Previsualización
    // ==============================
    function limpiarPreview() {
        if (previewContainer) {
            previewContainer.innerHTML = "";
        }
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

    // ==============================
    //  Eventos drag & drop
    // ==============================
    if (dropZone && inputImagenes) {

        // Click en la zona → abrir selector
        dropZone.addEventListener("click", () => {
            inputImagenes.click();
        });

        // Cambio en el input file
        inputImagenes.addEventListener("change", (e) => {
            const files = Array.from(e.target.files || []);
            const images = files.filter(f => f.type.startsWith("image/"));
            selectedFiles = images;
            mostrarPreviewDeFiles(selectedFiles);
        });

        // Drag over
        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("border-indigo-500", "bg-indigo-50");
        });

        dropZone.addEventListener("dragleave", (e) => {
            e.preventDefault();
            dropZone.classList.remove("border-indigo-500", "bg-indigo-50");
        });

        // Drop
        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("border-indigo-500", "bg-indigo-50");

            const files = Array.from(e.dataTransfer.files || []);
            const images = files.filter(f => f.type.startsWith("image/"));

            if (images.length > 0) {
                selectedFiles = images;
                mostrarPreviewDeFiles(selectedFiles);
            }
        });
    }

    // ==============================
    //  Submit del formulario
    // ==============================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!dbGlobal) {
            alert("La base de datos aún no está lista.");
            return;
        }

        // Usuario logeado (propietario)
        let emailPropietario = null;
        try {
            const stored = sessionStorage.getItem("usuarioActual");
            if (stored) {
                const obj = JSON.parse(stored);
                emailPropietario = obj.email;
            }
        } catch (_) {}

        // Datos del formulario
        const titulo  = (inputTitulo?.value || "").trim();
        const desc    = (inputDesc?.value   || "").trim();
        const precio  = Number(inputPrecio?.value || 0);
        const dir     = (inputDir?.value    || "").trim();
        const tamanio = (inputTam?.value    || "").trim();

        if (!dir || !precio) {
            alert("Como mínimo debes indicar dirección y precio.");
            return;
        }

        // Imágenes obligatorias
        if (!selectedFiles || selectedFiles.length === 0) {
            alert("Debes seleccionar al menos una imagen de la habitación.");
            return;
        }

        try {
            // Obtenemos id secuencial + TODAS las imágenes en base64
            const [nuevoId, imagenesBase64] = await Promise.all([
                obtenerSiguienteIdHabitacion(dbGlobal),
                Promise.all(selectedFiles.map(leerArchivoComoDataURL))
            ]);

            const nuevaHabitacion = {
                idHabitacion: nuevoId,
                titulo: titulo || dir,
                direccion: dir,
                ciudad: "",              // se puede ampliar si queréis
                precio,
                disponibleDesde: "",
                latitud: null,
                longitud: null,
                tamanio,
                descripcion: desc,
                imagen: imagenesBase64[0],   // principal
                imagenes: imagenesBase64,    // array con todas
                emailPropietario
            };

            const tx    = dbGlobal.transaction(STORE_HABITACION, "readwrite");
            const store = tx.objectStore(STORE_HABITACION);
            const req   = store.add(nuevaHabitacion);

            req.onsuccess = () => {
                alert("Habitación creada con ID: " + nuevoId);
                window.location.href = "mis_habitaciones.html";
            };

            req.onerror = (ev) => {
                console.error("Error guardando habitación:", ev.target.error);
                alert("Error al guardar la habitación.");
            };

        } catch (err) {
            console.error("Error procesando la habitación:", err);
            alert("Error al procesar las imágenes o guardar en BD.");
        }
    });
});
