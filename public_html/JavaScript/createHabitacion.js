// JavaScript/createHabitacion.js
// Crear una nueva habitación en IndexedDB con ID secuencial e imagen en base64

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

    const form        = document.getElementById("create-room-form");
    const inputTitulo = document.getElementById("titulo");
    const inputDesc   = document.getElementById("descripcion");
    const inputPrecio = document.getElementById("precio");
    const inputDir    = document.getElementById("direccion");
    const inputTam    = document.getElementById("tamanio");
    const inputImagen = document.getElementById("imagenes");

    if (!form) return;

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
    //  Submit del formulario
    // ==============================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!dbGlobal) {
            alert("La base de datos aún no está lista.");
            return;
        }

        // Usuario logeado
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

        // Imagen obligatoria
        const file = inputImagen?.files?.[0] || null;
        if (!file) {
            alert("Debes seleccionar al menos una imagen de la habitación.");
            return;
        }

        try {
            // Obtenemos id secuencial + imagen base64 en paralelo
            const [nuevoId, imagenBase64] = await Promise.all([
                obtenerSiguienteIdHabitacion(dbGlobal),
                leerArchivoComoDataURL(file)
            ]);

            const nuevaHabitacion = {
                idHabitacion: nuevoId,
                titulo: titulo || dir,
                direccion: dir,
                ciudad: "",              // podrás ampliarlo si quieres
                precio,
                disponibleDesde: "",     // idem
                latitud: null,
                longitud: null,
                tamanio,
                descripcion: desc,
                imagen: imagenBase64,    // AQUÍ guardamos el base64
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
            alert("Error al procesar la imagen o guardar en BD.");
        }
    });
});
