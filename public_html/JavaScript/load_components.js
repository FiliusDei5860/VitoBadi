// JavaScript/load_components.js
// Carga NavBar.html + Footer.html y ajusta menú según sesión/rol

function loadComponent(elementId, filePath, onLoaded) {
    const container = document.getElementById(elementId);
    if (!container) return Promise.resolve();

    return fetch(filePath)
        .then(res => {
            if (!res.ok) throw new Error(`No se pudo cargar ${filePath}`);
            return res.text();
        })
        .then(html => {
            container.innerHTML = html;
            if (typeof onLoaded === "function") onLoaded();
        })
        .catch(err => {
            console.error("Error cargando componente:", err);
            container.innerHTML =
                `<p style="color:red">Error al cargar ${filePath}</p>`;
        });
}

// Añade favicon si alguna página no lo tiene
function ensureFavicon() {
    const already = document.querySelector("link[rel='icon']");
    if (already) return;

    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/jpeg";
    link.href = "./Public_icons/VitoBadiIcon.jpg";
    document.head.appendChild(link);
}

function getUsuarioActual() {
    try {
        const raw = sessionStorage.getItem("usuarioActual");
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn("usuarioActual corrupto:", e);
        return null;
    }
}

function estaLogeadoUsuario() {
    const usr = getUsuarioActual();
    return !!usr?.email;
}


function getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const st = tx.objectStore(storeName);
        const req = st.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

async function activarNavbar() {
    const usuario = getUsuarioActual();

    // Elementos de la navbar
    const spanSaludo  = document.getElementById("navbar-saludo");
    const btnLoginOut = document.getElementById("navbar-login-logout");
    const iconPerfil  = document.getElementById("nav-perfil");

    const nodosAuth  = document.querySelectorAll(".nav-auth");
    const nodosOwner = document.querySelectorAll(".nav-owner");

    const logeado = !!usuario?.email;

    // --- calcular si es propietario desde BD ---
    let esPropietario = false;
    if (logeado) {
        try {
            const db = await abrirBD();
            const habitaciones = await getAllFromStore(db, STORE_HABITACION);
            esPropietario = habitaciones.some(h => h.emailPropietario === usuario.email);
        } catch (e) {
            console.warn("No se pudo calcular esPropietario:", e);
        }
    }

    // Saludo
    if (spanSaludo) {
        spanSaludo.textContent = logeado
            ? `Hola, ${usuario.nombre || usuario.email}`
            : "";
    }

    // Perfil
    if (iconPerfil) {
        iconPerfil.style.display = logeado ? "inline-block" : "none";
    }

    // Mostrar / ocultar items
    nodosAuth.forEach(n => n.style.display = logeado ? "" : "none");
    nodosOwner.forEach(n => n.style.display = esPropietario ? "" : "none");

    // Botón Login / Logout
    if (btnLoginOut) {
        if (!logeado) {
            btnLoginOut.textContent = "Login";
            btnLoginOut.href = "login.html";
            btnLoginOut.onclick = null;
        } else {
            btnLoginOut.textContent = "Logout";
            btnLoginOut.href = "#";
            btnLoginOut.onclick = (e) => {
                e.preventDefault();
                sessionStorage.removeItem("usuarioActual");
                localStorage.removeItem("usuarioActual");
                window.location.href = "Busqueda.html";
            };
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    ensureFavicon();

    await loadComponent("navbar-placeholder", "NavBar.html", activarNavbar);
    await loadComponent("footer-placeholder", "Footer.html");
});
