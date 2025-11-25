// JavaScript/NavBar.js
// Controla visibilidad del navbar según login y rol propietario

(async function () {

    function leerUsuario() {
        try {
            const raw = sessionStorage.getItem("usuarioActual");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function estaLogeado(u) {
        return !!u?.email;
    }

    // Si el usuario no trae flag de propietario, lo inferimos mirando habitaciones
    async function inferirPropietarioPorHabitaciones(email) {
        try {
            const db = await abrirBD();
            const habitaciones = await getAllFromStore(db, STORE_HABITACION);
            return habitaciones.some(h => h.emailPropietario === email);
        } catch (e) {
            console.warn("No puedo inferir propietario:", e);
            return false;
        }
    }

    async function calcularEsPropietario(u) {
        if (!u)
            return false;

        // 1) Si ya viene el indicador en el usuario, úsalo
        if (typeof u.esPropietario === "boolean")
            return u.esPropietario;
        if (typeof u.propietario === "boolean")
            return u.propietario;
        if (typeof u.isOwner === "boolean")
            return u.isOwner;

        // 2) Si no, miramos habitaciones en BD
        if (u.email)
            return await inferirPropietarioPorHabitaciones(u.email);

        return false;
    }

    function aplicarVisibilidad( { logeado, propietario }) {
        // nav-auth: solo logeado
        document.querySelectorAll(".nav-auth").forEach(el => {
            el.style.display = logeado ? "" : "none";
        });

        // nav-owner: solo propietario
        document.querySelectorAll(".nav-owner").forEach(el => {
            el.style.display = propietario ? "" : "none";
        });
    }

    function pintarSaludo(u) {
        const saludoEl = document.getElementById("navbar-saludo");
        if (!saludoEl)
            return;

        if (u?.nombre)
            saludoEl.textContent = `Hola, ${u.nombre}`;
        else if (u?.email)
            saludoEl.textContent = `Hola, ${u.email}`;
        else
            saludoEl.textContent = "";
    }

    function configurarLoginLogout(logeado) {
        const btn = document.getElementById("navbar-login-logout");
        if (!btn)
            return;

        if (logeado) {
            btn.textContent = "Logout";
            btn.href = "#";
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                sessionStorage.removeItem("usuarioActual");
                // si guardáis filtros u otras cosas, no los borres aquí
                window.location.href = "login.html";
            });
        } else {
            btn.textContent = "Login";
            btn.href = "login.html";
        }
    }

    // Espera a que el NavBar.html esté inyectado
    function esperarNavbarListo() {
        return new Promise((resolve) => {
            if (document.getElementById("navbar-saludo"))
                return resolve();

            const obs = new MutationObserver(() => {
                if (document.getElementById("navbar-saludo")) {
                    obs.disconnect();
                    resolve();
                }
            });
            obs.observe(document.body, {childList: true, subtree: true});
        });
    }

    // Aux de BD (por si no está expuesto en global en alguna vista)
    function getAllFromStore(db, storeName) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, "readonly");
            const st = tx.objectStore(storeName);
            const req = st.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    await esperarNavbarListo();

    const usuario = leerUsuario();
    const logeado = estaLogeado(usuario);
    const propietario = logeado ? await calcularEsPropietario(usuario) : false;

    aplicarVisibilidad({logeado, propietario});
    pintarSaludo(usuario);
    configurarLoginLogout(logeado);

})();
