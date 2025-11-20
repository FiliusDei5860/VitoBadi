// JavaScript/busqueda.js
// Gestiona la búsqueda general y la navegación hacia ListaHabitaciones

document.addEventListener("DOMContentLoaded", () => {
    const formBusqueda = document.getElementById("form-busqueda");
    const selectCiudad = document.getElementById("ciudad");
    const inputFecha   = document.getElementById("fecha");
    const linkLogin    = document.getElementById("link-login");

    // ==========================
    //  Estado de login en cabecera
    // ==========================
    if (linkLogin) {
        try {
            const stored = sessionStorage.getItem("usuarioActual");
            if (stored) {
                const usuario = JSON.parse(stored);

                // Mostrar algo más útil que "login"
                linkLogin.textContent = usuario.nombre || usuario.email || "Cerrar sesión";

                // Al hacer clic, cerrar sesión y volver a login
                linkLogin.addEventListener("click", (e) => {
                    e.preventDefault();
                    sessionStorage.removeItem("usuarioActual");
                    localStorage.removeItem("usuarioActual");
                    window.location.href = "login.html";
                });
            }
        } catch (e) {
            console.warn("No se ha podido leer usuarioActual de sessionStorage:", e);
        }
    }

    if (!formBusqueda) return;

    // ==========================
    //  Rellenar formulario si vienen filtros por URL (opcional)
    // ==========================
    const params = new URLSearchParams(window.location.search);
    const ciudadURL = params.get("ciudad") || "";
    const fechaURL  = params.get("fecha")  || "";

    if (ciudadURL && selectCiudad) {
        selectCiudad.value = ciudadURL;
    }
    if (fechaURL && inputFecha) {
        inputFecha.value = fechaURL;
    }

    // ==========================
    //  Envío del formulario
    // ==========================
    formBusqueda.addEventListener("submit", (event) => {
        event.preventDefault();

        const ciudad = selectCiudad ? selectCiudad.value : "";
        const fecha  = inputFecha   ? inputFecha.value   : "";

        const searchParams = new URLSearchParams();

        if (ciudad) {
            searchParams.set("ciudad", ciudad);
        }
        if (fecha) {
            searchParams.set("fecha", fecha);
        }

        // Redirigimos a la lista de habitaciones con los filtros
        const query = searchParams.toString();
        const urlDestino = "ListaHabitaciones.html" + (query ? "?" + query : "");

        window.location.href = urlDestino;
    });
});
