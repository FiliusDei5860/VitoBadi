// JavaScript/misAlquileres.js
// Lista de alquileres (propietario) usando datos MOCK

// Habitaciones de ejemplo (igual estilo que en detalleHabitacion)
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
        imagen: "./Public_icons/hab1.png" // de momento reutilizamos la misma imagen
    }
];

// Usuarios inquilinos de ejemplo (pueden ser los mismos que en login)
const USUARIOS_MOCK = [
    { email: "ane.arrieta@gmail.com",   nombre: "Ane Arrieta" },
    { email: "mikel.sarasola@gmail.com",nombre: "Mikel Sarasola" }
];

// Alquileres de ejemplo (tu modelo: idContrato, idHabi, emailInquilino, fechaInicioAlquiler, fechaFinAlquiler)
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
    const contenedor = document.getElementById("lista-alquileres");
    if (!contenedor) return;

    if (ALQUILERES_MOCK.length === 0) {
        const p = document.createElement("p");
        p.textContent = "No tienes alquileres registrados.";
        contenedor.appendChild(p);
        return;
    }

    ALQUILERES_MOCK.forEach((alquiler) => {
        const habitacion = HABITACIONES_MOCK.find(h => h.idHabi === alquiler.idHabi) || null;
        const inquilino  = USUARIOS_MOCK.find(u => u.email === alquiler.emailInquilino) || null;

        // Tarjeta reutilizando estilos de solicitudes
        const card = document.createElement("article");
        card.className = "solicitud-card";

        const infoGroup = document.createElement("div");
        infoGroup.className = "solicitud-info-group";

        // Imagen/placeholder
        const imgPlaceholder = document.createElement("div");
        imgPlaceholder.className = "solicitud-imagen-placeholder";

        if (habitacion && habitacion.imagen) {
            imgPlaceholder.style.backgroundImage = `url('${habitacion.imagen}')`;
            imgPlaceholder.style.backgroundSize = "cover";
            imgPlaceholder.style.backgroundPosition = "center";
        }

        // Texto principal
        const textWrapper = document.createElement("div");

        const titulo = document.createElement("h3");
        titulo.className = "solicitud-titulo";

        if (habitacion) {
            titulo.textContent = habitacion.direccion;
        } else {
            titulo.textContent = `Alquiler ${alquiler.idContrato}`;
        }

        const secundario = document.createElement("p");
        secundario.className = "solicitud-secundario";

        const ciudad  = habitacion ? habitacion.ciudad : "-";
        const precio  = habitacion ? `${habitacion.precio} €/mes` : "-";
        const nombreInq = inquilino ? inquilino.nombre : alquiler.emailInquilino;

        secundario.textContent =
            `${ciudad} · ${precio} · ${alquiler.fechaInicio} → ${alquiler.fechaFin} · Inquilino: ${nombreInq}`;

        textWrapper.appendChild(titulo);
        textWrapper.appendChild(secundario);

        infoGroup.appendChild(imgPlaceholder);
        infoGroup.appendChild(textWrapper);

        // Botón/ícono de ver detalle
        const btnVer = document.createElement("button");
        btnVer.type = "button";
        btnVer.className = "btn-icon";
        btnVer.title = "Ver detalle del alquiler";
        btnVer.textContent = "🔍";

        btnVer.addEventListener("click", (e) => {
            e.stopPropagation();
            // Más adelante crearemos DetalleAlquiler.html y usaremos este id
            window.location.href = `DetalleAlquiler.html?id=${alquiler.idContrato}`;
        });

        // También podemos hacer que toda la tarjeta sea clicable
        card.addEventListener("click", () => {
            window.location.href = `DetalleAlquiler.html?id=${alquiler.idContrato}`;
        });

        card.appendChild(infoGroup);
        card.appendChild(btnVer);

        contenedor.appendChild(card);
    });
});
