// JavaScript/navbarUser.js
// Navbar dinámica según usuario y según si tiene habitaciones (propietario) o no (inquilino)

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {

        const zonaLog    = document.getElementById("zona-logueado");
        const zonaNoLog  = document.getElementById("zona-no-logueado");
        const spanNombre = document.getElementById("navbar-usuario-nombre");
        const links      = document.getElementById("navbar-links");

        if (!zonaLog || !zonaNoLog || !links) return;

        // 1. Leer usuario de sessionStorage
        const userJSON = sessionStorage.getItem("usuarioActual");
        if (!userJSON) {
            // MODO INVITADO
            zonaLog.style.display = "none";
            zonaNoLog.style.display = "flex";

            links.innerHTML = `
                <a href="Busqueda.html">Búsqueda</a>
                <a href="BusquedaGeolocalizacion.html">Búsqueda geolocalización</a>
            `;
            return;
        }

        // Hay usuario logueado
        zonaNoLog.style.display = "none";
        zonaLog.style.display = "flex";

        const usuario = JSON.parse(userJSON);
        spanNombre.textContent = "Hola, " + usuario.nombre;

        // 2. ABRIR BD para ver si el usuario tiene habitaciones → DETERMINA ROL
        let db = await abrirBD();
        const tx = db.transaction("habitacion", "readonly");
        const store = tx.objectStore("habitacion");
        const idx = store.index("porEmailPropietario");

        // Buscamos habitaciones del usuario
        const req = idx.getAll(usuario.email);

        req.onsuccess = () => {
            const habitaciones = req.result;

            const esPropietario = habitaciones.length > 0;

            if (esPropietario) {
                // PROPIETARIO
                links.innerHTML = `
                    <a href="mis_habitaciones.html">Mis Propiedades</a>
                    <a href="SolicitudesPropietario.html">Solicitudes de mis propiedades</a>
                    <a href="MisAlquileres.html">Mis Alquileres</a>
                    <a href="Busqueda.html">Búsqueda</a>
                    <a href="BusquedaGeolocalizacion.html">Búsqueda geolocalización</a>
                    <a href="HabitacionesHospedadas.html">Mis Hospedajes</a>
                    <a href="MisSolicitudesInquilino.html">Mis Solicitudes</a>                `;
            } else {
                // INQUILINO
                links.innerHTML = `
                     <a href="CreateHabitacion.html">Crear habitacion</a>
                    <a href="HabitacionesHospedadas.html">Mis Hospedajes</a>
                    <a href="MisSolicitudesInquilino.html">Mis Solicitudes</a>
                    <a href="Busqueda.html">Búsqueda</a>
                    <a href="BusquedaGeolocalizacion.html">Búsqueda geolocalización</a>
                `;
            }
        };

        req.onerror = () => {
            console.error("Error leyendo habitaciones en BD");
        };

    }, 50);
});


// ========================= LOGOUT ==========================
document.addEventListener("click", (e) => {
    if (e.target.id === "btn-logout") {
        sessionStorage.clear();
        localStorage.removeItem("usuarioActual");
        window.location.href = "Busqueda.html";
    }
});
