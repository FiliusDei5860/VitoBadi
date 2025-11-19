/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
// js/login.js - versión sencilla integrada en el proyecto del compañero

// 1. Usuarios de prueba (realistas)
const USUARIOS_MOCK = [
    { email: "ane.arrieta@gmail.com",       password: "aaa", nombre: "Ane Arrieta" },
    { email: "ibon.bilbao@gmail.com",       password: "bbb", nombre: "Ibon Bilbao" },
    { email: "maite.lopez@gmail.com",       password: "ccc", nombre: "Maite López" },
    { email: "javier.garcia@gmail.com",     password: "ddd", nombre: "Javier García" },
    { email: "nerea.uribe@gmail.com",       password: "eee", nombre: "Nerea Uribe" },
    { email: "mikel.sarasola@gmail.com",    password: "fff", nombre: "Mikel Sarasola" },
    { email: "leire.mendizabal@gmail.com",  password: "ggg", nombre: "Leire Mendizabal" },
    { email: "andoni.saenz@gmail.com",      password: "hhh", nombre: "Andoni Sáenz" }
];

// 2. Esperar a que el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los elementos del formulario
    const formLogin      = document.getElementById("form-login");
    const inputEmail     = document.getElementById("login-email");
    const inputPassword  = document.getElementById("login-password");

    const errorEmail     = document.getElementById("error-email");
    const errorPassword  = document.getElementById("error-password");
    const errorGeneral   = document.getElementById("error-general");

    console.log("✅ login.js cargado (proyecto compañero)");

    // Seguridad: por si algo no existe
    if (!formLogin || !inputEmail || !inputPassword) {
        console.error("❌ Faltan elementos en Login.html, revisa los id.");
        return;
    }

    // 3. Gestionar el envío del formulario
    formLogin.addEventListener("submit", (event) => {
        event.preventDefault(); // evita recargar la página

        // Limpiar mensajes anteriores
        limpiarError(errorEmail);
        limpiarError(errorPassword);
        limpiarErrorGeneral(errorGeneral);

        const email = inputEmail.value.trim();
        const pass  = inputPassword.value;

        // Validaciones
        if (!email) {
            mostrarError(errorEmail, "El email es obligatorio.");
            return;
        }

        // 🔴 VALIDACIÓN IMPORTANTE: texto@texto.com
        const regexEmail = /^[^@]+@[^@]+\.com$/;

        if (!regexEmail.test(email)) {
            mostrarError(errorEmail, "El email debe ser del tipo texto@texto.com");
            return;
        }

        if (!pass) {
            mostrarError(errorPassword, "La contraseña es obligatoria.");
            return;
        }

        // 4. Comprobar credenciales contra los usuarios de prueba
        const usuarioEncontrado = USUARIOS_MOCK.find(
            (u) => u.email === email && u.password === pass
        );

        if (!usuarioEncontrado) {
            mostrarErrorGeneral(errorGeneral, "Email o contraseña incorrectos.");
            return;
        }

        // 5. Si todo va bien, por ahora solo mostramos un mensaje
        alert("Login correcto (simulado) para: " + usuarioEncontrado.nombre);
        console.log("Usuario logueado (simulado):", usuarioEncontrado);

        // Más adelante aquí redirigiremos a la página principal de tu compañero
        // window.location.href = "index.html";  // por ejemplo
    });
});

// --- Funciones auxiliares para mostrar/limpiar errores ---

function mostrarError(span, mensaje) {
    if (!span) return;
    span.textContent = mensaje;
}

function limpiarError(span) {
    if (!span) return;
    span.textContent = "";
}

function mostrarErrorGeneral(div, mensaje) {
    if (!div) return;
    div.textContent = mensaje;
    div.hidden = false;
}

function limpiarErrorGeneral(div) {
    if (!div) return;
    div.textContent = "";
    div.hidden = true;
}


