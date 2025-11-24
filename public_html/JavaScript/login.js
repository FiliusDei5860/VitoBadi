// JavaScript/login.js
// Login real contra IndexedDB (store: usuario)

document.addEventListener("DOMContentLoaded", () => {

    let dbGlobal = null;

    abrirBD()
        .then(db => {
            dbGlobal = db;
            console.log("BD lista en login:", db.name);
        })
        .catch(err => console.error("Error al abrir BD:", err));

    // IDs reales del HTML
    const formLogin     = document.getElementById("login-form");
    const inputEmail    = document.getElementById("email");
    const inputPassword = document.getElementById("password");

    if (!formLogin) return;

    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();

        const email    = inputEmail.value.trim();
        const password = inputPassword.value.trim();

        if (!email || !password) {
            alert("Debes rellenar todos los campos.");
            return;
        }

        if (!dbGlobal) {
            alert("La base de datos no está lista. Espera un momento.");
            return;
        }

        const tx    = dbGlobal.transaction(STORE_USUARIO, "readonly");
        const store = tx.objectStore(STORE_USUARIO);
        const req   = store.get(email);

        req.onsuccess = (e) => {
            const usuario = e.target.result;

            if (!usuario) {
                alert("Usuario no encontrado.");
                return;
            }
            if (usuario.password !== password) {
                alert("Contraseña incorrecta.");
                return;
            }

            sessionStorage.setItem("usuarioActual", JSON.stringify(usuario));
            localStorage.setItem("usuarioActual", usuario.email);

            window.location.href = "Busqueda.html";
        };

        req.onerror = () => alert("Error interno al validar el usuario.");
    });
});
