// JavaScript/detalleAlquiler.js
// Vista ampliada de un alquiler (propietario) usando datos MOCK

// Mocks iguales que en MisAlquileres.js para mantener coherencia
const HABITACIONES_MOCK = [
    {
        idHabi: 1,
        direccion: "C/ Gorbea 12, 3ºA",
        ciudad: "Vitoria-Gasteiz",
        precio: 350,
        latitud: 42.846,
        longitud: -2.672,
        estado: "Disponible",
        imagen: "./Public_icons/hab1.png"
    },
    {
        idHabi: 2,
        direccion: "Gran Vía 25, 2ºD",
        ciudad: "Bilbao",
        precio: 420,
        latitud: 43.262,
        longitud: -2.935,
        estado: "Ocupada",
        imagen: "./Public_icons/hab1.png"
    }
];

const USUARIOS_MOCK = [
    { email: "ane.arrieta@gmail.com",    nombre: "Ane Arrieta" },
    { email: "mikel.sarasola@gmail.com", nombre: "Mikel Sarasola" }
];

const ALQUILERES_MOCK = [
    {
        idContrato: 1,
        idHabi: 1,
        emailInquilino: "ane.arrieta@gmail.com",
        fechaInicio: "2025-01-01",
        fechaFin:    "2025-06-30"
    },
    {
        idContrato: 2,
        idHabi: 2,
        emailInquilino: "mikel.sarasola@gmail.com",
        fechaInicio: "2025-03-15",
        fechaFin:    "2025-09-15"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const spanDireccion       = document.getElementById("alq-direccion");
    const spanCiudad          = document.getElementById("alq-ciudad");
    const spanPrecio          = document.getElementById("alq-precio");
    const spanLatitud         = document.getElementById("alq-latitud");
    const spanLongitud        = document.getElementById("alq-longitud");
    const spanFechaInicio     = document.getElementById("alq-fecha-inicio");
    const spanFechaFin        = document.getElementById("alq-fecha-fin");
    const spanNombreInquilino = document.getElementById("alq-nombre-inquilino");
    const spanEmailInquilino  = document.getElementById("alq-email-inquilino");
    const imgHab              = document.getElementById("alq-imagen");
    const btnVolver           = document.getElementById("btn-volver");

    // 1. Obtener idContrato de la URL (?id=...)
    const params = new URLSearchParams(window.location.search);
    const idStr = params.get("id");
    const id = idStr ? parseInt(idStr, 10) : NaN;

    let alquiler = null;
    if (!isNaN(id)) {
        alquiler = ALQUILERES_MOCK.find(a => a.idContrato === id) || null;
    }

    if (!alquiler) {
        // Si no encontramos el alquiler, mostramos mensaje básico
        spanDireccion.textContent       = "Alquiler no encontrado";
        spanCiudad.textContent          = "-";
        spanPrecio.textContent          = "-";
        spanLatitud.textContent         = "-";
        spanLongitud.textContent        = "-";
        spanFechaInicio.textContent     = "-";
        spanFechaFin.textContent        = "-";
        spanNombreInquilino.textContent = "-";
        spanEmailInquilino.textContent  = "-";
        return;
    }

    // 2. Obtener habitación e inquilino relacionados
    const habitacion = HABITACIONES_MOCK.find(h => h.idHabi === alquiler.idHabi) || null;
    const inquilino  = USUARIOS_MOCK.find(u => u.email === alquiler.emailInquilino) || null;

    // 3. Rellenar datos básicos del alquiler
    if (habitacion) {
        spanDireccion.textContent = habitacion.direccion;
        spanCiudad.textContent    = habitacion.ciudad;
        spanPrecio.textContent    = habitacion.precio + " €/mes";
        spanLatitud.textContent   = habitacion.latitud;
        spanLongitud.textContent  = habitacion.longitud;

        if (habitacion.imagen) {
            imgHab.src = habitacion.imagen;
        }
    } else {
        spanDireccion.textContent = "(Habitación desconocida)";
        spanCiudad.textContent    = "-";
        spanPrecio.textContent    = "-";
        spanLatitud.textContent   = "-";
        spanLongitud.textContent  = "-";
    }

    spanFechaInicio.textContent = alquiler.fechaInicio;
    spanFechaFin.textContent    = alquiler.fechaFin;

    if (inquilino) {
        spanNombreInquilino.textContent = inquilino.nombre;
        spanEmailInquilino.textContent  = inquilino.email;
    } else {
        spanNombreInquilino.textContent = "(Inquilino desconocido)";
        spanEmailInquilino.textContent  = alquiler.emailInquilino;
    }

    // 4. Botón volver
    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            window.location.href = "MisAlquileres.html";
        });
    }
});

