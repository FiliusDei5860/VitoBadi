/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


// JavaScript/misHabitacionesInquilino.js
// Lista las habitaciones donde el usuario está (o ha estado) hospedado como inquilino

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor-habitaciones-inquilino");

    if (!contenedor) {
        console.warn("No se encuentra el contenedor de habitaciones del inquilino.");
        return;
    }

    // 1. Comprobar usuario logueado
    const usuarioJSON = sessionStorage.getItem("usuarioActual");
    if (!usuarioJSON) {
        contenedor.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow-md text-center">
                <p class="text-gray-700 mb-2">
                    Debes iniciar sesión para ver las habitaciones donde estás hospedado.
                </p>
                <a href="login.html" class="btn btn-primary">Ir a login</a>
            </div>
        `;
        return;
    }

    let usuario;
    try {
        usuario = JSON.parse(usuarioJSON);
    } catch (e) {
        console.error("Error parseando usuarioActual:", e);
        contenedor.innerHTML = `
            <div class="bg-red-50 p-4 rounded-lg shadow-md text-center">
                <p class="text-red-700">
                    Ha ocurrido un error al leer tus datos de sesión. Inténtalo de nuevo.
                </p>
            </div>
        `;
        return;
    }

    const emailInquilino = usuario.email;

    // 2. Abrir BD y buscar alquileres del usuario
    abrirBD()
        .then(db => cargarAlquileresUsuario(db, emailInquilino, contenedor))
        .catch(err => {
            console.error("Error abriendo BD en misHabitacionesInquilino:", err);
            contenedor.innerHTML = `
                <div class="bg-red-50 p-4 rounded-lg shadow-md text-center">
                    <p class="text-red-700">
                        No se ha podido acceder a la base de datos. Vuelve a intentarlo más tarde.
                    </p>
                </div>
            `;
        });
});


function cargarAlquileresUsuario(db, emailInquilino, contenedor) {
    const tx = db.transaction(STORE_ALQUILER, "readonly");
    const store = tx.objectStore(STORE_ALQUILER);
    const index = store.index("porEmailInquilino");

    const req = index.getAll(emailInquilino);

    req.onsuccess = () => {
        const alquileres = req.result || [];

        if (alquileres.length === 0) {
            contenedor.innerHTML = `
                <div class="bg-white p-4 rounded-lg shadow-md text-center">
                    <p class="text-gray-700">
                        Actualmente no estás hospedado en ninguna habitación.
                    </p>
                </div>
            `;
            return;
        }

        // Si hay alquileres, para cada uno buscamos la habitación asociada
        alquileres.forEach(alquiler => {
            cargarHabitacionDeAlquiler(db, alquiler, contenedor);
        });
    };

    req.onerror = (e) => {
        console.error("Error consultando alquileres del usuario:", e.target.error);
        contenedor.innerHTML = `
            <div class="bg-red-50 p-4 rounded-lg shadow-md text-center">
                <p class="text-red-700">
                    Error al obtener tus alquileres. Inténtalo de nuevo.
                </p>
            </div>
        `;
    };
}


function cargarHabitacionDeAlquiler(db, alquiler, contenedor) {
    const tx = db.transaction(STORE_HABITACION, "readonly");
    const store = tx.objectStore(STORE_HABITACION);

    const req = store.get(alquiler.idHabitacion);

    req.onsuccess = () => {
        const habitacion = req.result;

        if (!habitacion) {
            console.warn("No se encuentra la habitación con id:", alquiler.idHabitacion);
            return;
        }

        // Pintar tarjeta
        const card = crearTarjetaHabitacionInquilino(habitacion, alquiler);
        contenedor.appendChild(card);
    };

    req.onerror = (e) => {
        console.error("Error obteniendo habitación para alquiler:", e.target.error);
    };
}


function crearTarjetaHabitacionInquilino(habitacion, alquiler) {
    const card = document.createElement("div");
    card.className = "solicitud-card";

    // Puedes adaptar estas clases a tu gusto, reutilizando estilos de solicitudes
    card.innerHTML = `
        <div class="solicitud-info-group">
            <div class="solicitud-imagen-placeholder">
                <!-- Aquí podrías mostrar imagen real en el futuro -->
            </div>
            <div>
                <div class="solicitud-titulo">
                    Habitación #${habitacion.idHabitacion} - ${habitacion.ciudad}
                </div>
                <div class="solicitud-secundario">
                    ${habitacion.direccion}
                </div>
                <div class="solicitud-secundario">
                    Precio: ${habitacion.precio} €/mes
                </div>
                <div class="solicitud-secundario mt-1">
                    <strong>Inicio:</strong> ${alquiler.fechaInicioAlquiler} |
                    <strong>Fin:</strong> ${alquiler.fechaFinAlquiler}
                </div>
            </div>
        </div>
    `;

    return card;
}
