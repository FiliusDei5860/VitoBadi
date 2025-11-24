/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// JavaScript/DetalleHabitacionGeolocalizacion.js

document.addEventListener("DOMContentLoaded", () => {
    // Elementos de la vista
    const btnVolver = document.getElementById("btn-volver");
    const btnSolicitar = document.getElementById("btnSolicitar");
    const msgLogin = document.getElementById("msg-login");

    // Elementos de detalle de la habitación
    const habDir = document.getElementById("hab-direccion");
    const habCiudad = document.getElementById("hab-ciudad");
    const habPrecio = document.getElementById("hab-precio");
    const habLat = document.getElementById("hab-latitud");
    const habLong = document.getElementById("hab-longitud");
    const habEstado = document.getElementById("hab-estado");
    const habImagen = document.getElementById("hab-imagen");

    let dbGlobal = null;
    let habitacionActual = null;
    let usuarioActual = null;
    let estaLogeado = false;
    let idHabitacion = null;

    // =========================
    //  Leer usuario logeado
    // =========================
    try {
        const stored = sessionStorage.getItem("usuarioActual");
        if (stored) {
            usuarioActual = JSON.parse(stored);
            estaLogeado = !!usuarioActual?.email;
        }
    } catch (e) {
        console.warn("No se ha podido leer usuarioActual de sessionStorage:", e);
    }

    // =========================
    //  Abrir BD e inicializar
    // =========================
    abrirBD()
        .then(db => {
            dbGlobal = db;
            console.log("BD lista en DetalleHabitacionGeolocalizacion:", db.name);
           
            const params = new URLSearchParams(window.location.search);
            idHabitacion = params.get("id");

            if (idHabitacion) {
                cargarDetalleHabitacion(idHabitacion);
            } else {
                console.error("ID de habitación no válido.");
                if (habDir) habDir.textContent = "ID de habitación no válido.";
            }
        })
        .catch(err => {
            console.error("Error abriendo BD en DetalleHabitacionGeolocalizacion:", err);
            if (habDir) habDir.textContent = "Error de conexión a la base de datos.";
        });
       
    // =========================
    //  Cargar datos de la habitación
    // =========================
    function cargarDetalleHabitacion(id) {
        if (!dbGlobal) return;

        const tx = dbGlobal.transaction(STORE_HABITACION, "readonly");
        const store = tx.objectStore(STORE_HABITACION);
        // IndexedDB guarda las claves como números, hay que parsear el ID
        const req = store.get(parseInt(id));

        req.onsuccess = () => {
            const habitacion = req.result;
            if (habitacion) {
                habitacionActual = habitacion;
                pintarDetalle(habitacion);
            } else {
                console.error("Habitación no encontrada con ID:", id);
                if (habDir) habDir.textContent = "Habitación no encontrada.";
            }
        };

        req.onerror = (e) => {
            console.error("Error leyendo habitación:", e.target.error);
        };
    }

    // =========================
    //  Pintar datos en la vista
    // =========================
    function pintarDetalle(habitacion) {
        if (!habDir) return; // Evitar errores si los elementos no existen

        habDir.textContent = habitacion.direccion || "-";
        habCiudad.textContent = habitacion.ciudad || "-";
        habPrecio.textContent = (habitacion.precio != null) ? habitacion.precio + " €/mes" : "-";
        habLat.textContent = habitacion.latitud ?? "-";
        habLong.textContent = habitacion.longitud ?? "-";
        habEstado.textContent = habitacion.estado || "-";

        let src = null;
        if (Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0) {
            src = habitacion.imagenes[0];
        } else if (habitacion.imagen) {
            src = habitacion.imagen;
        }

        if (src) {
            habImagen.src = src;
        }
       
        // Si no está logueado, difuminamos la imagen
        // Asumiendo que "room-card-image-blurred" es una clase CSS
        habImagen.classList.toggle("room-card-image-blurred", !estaLogeado);

        // Actualizar el texto del botón basado en el estado de login
        if (!estaLogeado) {
            btnSolicitar.textContent = "Login para solicitar";
        } else {
            btnSolicitar.textContent = "Solicitar Habitación";
        }
    }

    // =========================
    //  EVENTO BOTÓN SOLICITAR: Manejo de login y solicitud real
    // =========================
    if (btnSolicitar) {
        btnSolicitar.addEventListener("click", () => {
            if (!habitacionActual) {
                alert("Primero debes cargar una habitación válida.");
                return;
            }

            if (!estaLogeado) {
                // Si no está logueado, muestra el mensaje y redirige a login
                if (msgLogin) {
                    msgLogin.textContent = "Debes iniciar sesión para poder solicitar esta habitación. Redirigiendo...";
                    msgLogin.classList.remove("hidden");
                }
               
                // Redirigir a login con el parámetro para volver a esta misma vista/ID
                setTimeout(() => {
                    window.location.href = `login.html?redirect=SolicitarGeolocalizacion.html?id=${idHabitacion}`;
                }, 1500);

            } else {
                // SI ESTÁ LOGUEADO: Ejecuta la función de guardado real
                crearSolicitudParaHabitacion(habitacionActual);
            }
        });
    }
   
    // =========================
    //  Crear solicitud en BD (Lógica REAL con REDIRECCIÓN a MiSSolicitudesInquilino.html)
    // =========================
    function crearSolicitudParaHabitacion(habitacion) {
        if (!dbGlobal || !usuarioActual) {
            alert("Error: No se puede conectar a la base de datos o falta el usuario.");
            return;
        }

        // 1. Iniciar transacción y obtener todas las solicitudes para calcular el ID
        const txSol = dbGlobal.transaction(STORE_SOLICITUD, "readwrite");
        const store = txSol.objectStore(STORE_SOLICITUD);
        const getAll = store.getAll();

        getAll.onsuccess = () => {
            const todas = getAll.result || [];
            let nuevoId = 1;
            if (todas.length > 0) {
                // Calcular el nuevo ID, sumando 1 al máximo ID existente
                nuevoId = Math.max(...todas.map(s => s.idSolicitud || 0)) + 1;
            }

            const hoy = new Date().toISOString().slice(0, 10);

            const nuevaSolicitud = {
                idSolicitud: nuevoId,
                idHabitacion: habitacion.idHabitacion,
                emailInquilinoPosible: usuarioActual.email,
                mensaje: "Solicitud automática desde la búsqueda por geolocalización.",
                fechas: `A partir de ${habitacion.disponibleDesde || 'fecha sin especificar'}`,
                fechaSolicitud: hoy,
                estado: "Pendiente"
            };

            // 2. Insertar la nueva solicitud
            const addReq = store.add(nuevaSolicitud);

            addReq.onsuccess = () => {
                alert("✅ Solicitud registrada correctamente. Redirigiendo a Mis Solicitudes...");
               
                // Opcional: Deshabilitar el botón
                btnSolicitar.textContent = "Solicitud Enviada";
                btnSolicitar.disabled = true;
               
                // *** REDIRECCIÓN A LA VISTA DE SOLICITUDES DEL INQUILINO ***
                setTimeout(() => {
                    window.location.href = 'MiSSolicitudesInquilino.html';
                }, 1000); // Espera 1 segundo para que el usuario vea la alerta
            };

            addReq.onerror = (e) => {
                console.error("Error guardando solicitud:", e.target.error);
                alert("❌ Error al registrar la solicitud.");
            };
        };

        getAll.onerror = (e) => {
            console.error("Error leyendo solicitudes para calcular nuevo id:", e.target.error);
            alert("No se ha podido registrar la solicitud.");
        };
    }
   
    // =========================
    //  Eventos de navegación
    // =========================
    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            // Asumiendo que el flujo vuelve a la vista del mapa/búsqueda
            window.history.back();
        });
    }
});