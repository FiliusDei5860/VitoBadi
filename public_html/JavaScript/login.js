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
    const msgError      = document.getElementById("login-error");

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

    function limpiarError() {
        if (msgError) {
            msgError.textContent = "";
            msgError.style.display = "none";
        }
    }

    // ============================
    //  EVENTO DEL FORMULARIO
    // ============================
    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();
        limpiarError();

        const email    = inputEmail.value.trim();
        const password = inputPassword.value.trim();

        // 1) Campos obligatorios
        if (!email || !password) {
            mostrarError("Debes rellenar todos los campos.");
            return;
        }

        // 2) Formato texto@texto.com
        const regexEmail = /^[^@]+@[^@]+\.com$/;
        if (!regexEmail.test(email)) {
            mostrarError("El email debe ser del tipo texto@texto.com.");
            return;
        }

        // 3) BD lista
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

            if (!usuario) {
                mostrarError("Usuario no encontrado.");
                return;
            }

            if (usuario.password !== password) {
                mostrarError("Contraseña incorrecta.");
                return;
            }

            // LOGIN CORRECTO
            console.log("Login correcto para:", usuario);

            const usuarioSession = {
                email:    usuario.email,
                password: usuario.password,
                nombre:   usuario.nombre,
                foto:     usuario.foto
            };

            // Guardado correcto:
            // - una tupla con clave email (como pide la profe)
            // - "usuarioActual" (lo usa tu navbar)
            sessionStorage.clear();
            sessionStorage.setItem(usuario.email, JSON.stringify(usuarioSession));
            sessionStorage.setItem("usuarioActual", JSON.stringify(usuarioSession));

            // Mantenemos tu comportamiento original para la navbar
            localStorage.setItem("usuarioActual", usuario.email);

            // Redirección tras login
            window.location.href = "Busqueda.html";
        };

        req.onerror = (e) => {
            console.error("Error consultando usuario en IndexedDB:", e.target.error);
            mostrarError("Error interno al validar el usuario.");
        };
    });
});
