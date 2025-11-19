// JavaScript/detalleHabitacion.js
// Vista ampliada de una habitación (datos de ejemplo, sin IndexedDB todavía)

const HABITACIONES_MOCK = [
    {
        idHabi: 1,
        direccion: "C/ Gorbea 12, 3ºA",
        ciudad: "Vitoria-Gasteiz",
        precio: 350,
        latitud: 42.846,
        longitud: -2.672,
        estado: "Disponible",
        imagen: "./Public_icons/hab1.png" // pon aquí cualquier imagen de prueba
    },
    {
        idHabi: 2,
        direccion: "Gran Vía 25, 2ºD",
        ciudad: "Bilbao",
        precio: 420,
        latitud: 43.262,
        longitud: -2.935,
        estado: "Ocupada",
        imagen: "./Public_icons/hab2.jpg"
    }
    // añade más si quieres
];

document.addEventListener("DOMContentLoaded", () => {
    const spanDireccion = document.getElementById("hab-direccion");
    const spanCiudad    = document.getElementById("hab-ciudad");
    const spanPrecio    = document.getElementById("hab-precio");
    const spanLatitud   = document.getElementById("hab-latitud");
    const spanLongitud  = document.getElementById("hab-longitud");
    const spanEstado    = document.getElementById("hab-estado");
    const imgHab        = document.getElementById("hab-imagen");
    const btnVolver     = document.getElementById("btn-volver");

    // 1. Leer parámetro ?id= de la URL
    const params = new URLSearchParams(window.location.search);
    const idStr = params.get("id");
    const id = idStr ? parseInt(idStr, 10) : NaN;

    // 2. Buscar habitación en el mock
    let habitacion = null;
    if (!isNaN(id)) {
        habitacion = HABITACIONES_MOCK.find(h => h.idHabi === id) || null;
    }

    if (!habitacion) {
        // Si no encontramos habitación, mostramos un mensaje sencillo
        spanDireccion.textContent = "Habitación no encontrada";
        spanCiudad.textContent    = "-";
        spanPrecio.textContent    = "-";
        spanLatitud.textContent   = "-";
        spanLongitud.textContent  = "-";
        spanEstado.textContent    = "-";
    } else {
        // Rellenar datos
        spanDireccion.textContent = habitacion.direccion;
        spanCiudad.textContent    = habitacion.ciudad;
        spanPrecio.textContent    = habitacion.precio + " €/mes";
        spanLatitud.textContent   = habitacion.latitud;
        spanLongitud.textContent  = habitacion.longitud;
        spanEstado.textContent    = habitacion.estado;

        if (habitacion.imagen) {
            imgHab.src = habitacion.imagen;
        }
    }

    // 3. Botón volver
    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            // De momento simplemente volvemos a "mis_habitaciones"
            window.location.href = "mis_habitaciones.html";
        });
    }
});

