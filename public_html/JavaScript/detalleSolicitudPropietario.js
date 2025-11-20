// JavaScript/detalleSolicitudPropietario.js
// Muestra los datos ampliados de la solicitud según el id recibido en la URL

const SOLICITUDES_MOCK = {
    "1": {
        nombreInquilino: "Juan Pérez",
        habitacion: "Habitación Casco Viejo",
        direccion: "C/ Mayor 10, Bilbao",
        ciudad: "Bilbao",
        precio: "380€",
        fechas: "Del 1 de marzo al 30 de junio",
        mensaje: "Busco habitación cerca del centro para estancia por estudios.",
        imagen: "./Public_icons/hab1.png",
        estado: "Pendiente"
    },
    "2": {
        nombreInquilino: "María García",
        habitacion: "Estudio Zona Universitaria",
        direccion: "Avda. Universidades 5, Bilbao",
        ciudad: "Bilbao",
        precio: "550€",
        fechas: "Del 15 de febrero al 31 de julio",
        mensaje: "Me interesa para curso completo, soy estudiante de máster.",
        imagen: "./Public_icons/hab1.png",
        estado: "Pendiente"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const sol = SOLICITUDES_MOCK[id];
    if (!sol) {
        document.getElementById("titulo-solicitud").textContent =
            "Solicitud no encontrada";
        return;
    }

    // Rellenar textos
    document.getElementById("titulo-solicitud").textContent =
        `Solicitud de ${sol.nombreInquilino}`;
    document.getElementById("nombre-inquilino").textContent =
        `Solicitud de ${sol.nombreInquilino}`;
    document.getElementById("habitacion-info").textContent =
        `${sol.habitacion} – ${sol.direccion} (${sol.ciudad})`;
    document.getElementById("precio-habitacion").textContent = sol.precio;
    document.getElementById("rango-fechas").textContent = sol.fechas;
    document.getElementById("mensaje-inquilino").textContent = sol.mensaje;

    const imgDiv = document.getElementById("imagen-habitacion");
    if (imgDiv && sol.imagen) {
        imgDiv.style.backgroundImage = `url('${sol.imagen}')`;
        imgDiv.style.backgroundSize = "cover";
    }

    const badge = document.getElementById("estado-badge");
    actualizarBadgeEstado(badge, sol.estado);

    const btnAceptar = document.getElementById("btn-aceptar");
    const btnRechazar = document.getElementById("btn-rechazar");

    btnAceptar.addEventListener("click", () => {
        sol.estado = "Aceptada";
        actualizarBadgeEstado(badge, sol.estado);
        alert("Solicitud aceptada (demo, sin BD).");
    });

    btnRechazar.addEventListener("click", () => {
        sol.estado = "Rechazada";
        actualizarBadgeEstado(badge, sol.estado);
        alert("Solicitud rechazada (demo, sin BD).");
    });
});

function actualizarBadgeEstado(badge, estado) {
    if (!badge) return;

    let base = "px-3 py-1 rounded-full text-xs font-semibold text-center ";
    if (estado === "Aceptada") {
        badge.className = base + "bg-green-100 text-green-700";
    } else if (estado === "Rechazada") {
        badge.className = base + "bg-red-100 text-red-700";
    } else {
        badge.className = base + "bg-yellow-100 text-yellow-700";
    }
    badge.textContent = `Estado: ${estado}`;
}
