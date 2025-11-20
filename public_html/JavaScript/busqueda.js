// JavaScript/busqueda.js
// Vista de búsqueda general (puede estar logeado o no)

document.addEventListener("DOMContentLoaded", () => {

    let dbGlobal = null;

    // ============================
    //  ABRIR BASE DE DATOS
    // ============================
    abrirBD()
        .then(db => {
            dbGlobal = db;
            console.log("BD lista en búsqueda:", db.name);
        })
        .catch(err => {
            console.error("Error al abrir BD en búsqueda:", err);
        });


    // ============================
    //  CAPTURA DE ELEMENTOS
    // ============================
    const formBusqueda = document.getElementById("form-busqueda");
    const selectCiudad = document.getElementById("ciudad");
    const inputFecha   = document.getElementById("fecha");
    const linkLogin    = document.getElementById("link-login");

    if (!formBusqueda) return;


    // ============================
    //  MOSTRAR ESTADO DE LOGIN EN NAVBAR
    // ============================
    try {
        const usuarioActualJSON = sessionStorage.getItem("usuarioActual");
        if (usuarioActualJSON && linkLogin) {
            const usuario = JSON.parse(usuarioActualJSON);
            const nombre  = usuario.nombre || usuario.email || "usuario";

            // Cambiamos el texto del enlace de Login
            linkLogin.textContent = `Hola, ${nombre}`;
            // Y lo mandamos, por ejemplo, a la lista de habitaciones
            linkLogin.href = "ListaHabitaciones.html";
        }
    } catch (e) {
        console.error("Error leyendo usuarioActual de sessionStorage:", e);
    }


    // ============================
    //  ENVÍO DEL FORMULARIO
    // ============================
    formBusqueda.addEventListener("submit", (event) => {
        event.preventDefault();

        const ciudad = selectCiudad ? (selectCiudad.value || "") : "";
        const fecha  = inputFecha   ? (inputFecha.value   || "") : "";

        const params = new URLSearchParams();

        if (ciudad) params.set("ciudad", ciudad);
        if (fecha)  params.set("fecha",  fecha);

        const query = params.toString();
        const urlDestino = query
            ? `ListaHabitaciones.html?${query}`
            : "ListaHabitaciones.html";

        window.location.href = urlDestino;
    });
});
