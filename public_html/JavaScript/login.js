// JavaScript/login.js
// Login real contra IndexedDB (store: usuario)

document.addEventListener("DOMContentLoaded", () => {

    let dbGlobal = null;

    // ============================
    //  ABRIR BASE DE DATOS
    // ============================
    abrirBD()
        .then(db => {
            dbGlobal = db;
            console.log("BD lista en login:", db.name);
        })
        .catch(err => {
            console.error("Error al abrir BD:", err);
        });


    // ============================
    //  CAPTURA DE ELEMENTOS
    // ============================
    const formLogin     = document.getElementById("form-login");
    const inputEmail    = document.getElementById("login-email");
    const inputPassword = document.getElementById("login-password");
    const msgError      = document.getElementById("login-error"); // puede ser null

    if (!formLogin) return;


    // ============================
    //  FUNCIONES AUXILIARES
    // ============================
    function mostrarError(texto) {
        if (msgError) {
            msgError.textContent = texto;
            msgError.style.display = "block";
        } else {
            alert(texto);
        }
    }

    // ============================
    //  EVENTO DEL FORMULARIO
    // ============================
    formLogin.addEventListener("submit", (event) => {
        event.preventDefault(); // Evita recargar la página

        const email    = inputEmail    ? inputEmail.value.trim()    : "";
        const password = inputPassword ? inputPassword.value.trim() : "";

        if (!email || !password) {
            mostrarError("Debes rellenar todos los campos.");
            return;
        }

        if (!dbGlobal) {
            mostrarError("La base de datos todavía no está lista. Inténtalo de nuevo en unos segundos.");
            return;
        }

        // ============================
        //  LOGIN REAL CON INDEXEDDB
        // ============================
        const tx    = dbGlobal.transaction(STORE_USUARIO, "readonly");
        const store = tx.objectStore(STORE_USUARIO);
        const req   = store.get(email);

        req.onsuccess = (e) => {
            const usuario = e.target.result;

            // No existe el email en la BD
            if (!usuario) {
                mostrarError("Usuario no encontrado.");
                return;
            }

            // Contraseña incorrecta
            if (usuario.password !== password) {
                mostrarError("Contraseña incorrecta.");
                return;
            }

            // Login correcto
            console.log("Login correcto para:", usuario);

            // Guardamos usuario en storage (para otras vistas)
            sessionStorage.setItem("usuarioActual", JSON.stringify(usuario));
            localStorage.setItem("usuarioActual", usuario.email);

            // Redirección tras login correcto → a BÚSQUEDA
            window.location.href = "Busqueda.html";
        };

        req.onerror = (e) => {
            console.error("Error consultando usuario en IndexedDB:", e.target.error);
            mostrarError("Error interno al validar el usuario.");
        };
    });
});
