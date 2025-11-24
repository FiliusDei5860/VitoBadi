/* 
 * Gestión de carga dinámica de componentes (Navbar y Footer)
 */

// Función para cargar contenido de un archivo HTML en un elemento del DOM
function loadComponent(elementId, filePath) {

    // 1. Obtiene el contenedor (por ejemplo, el <div> vacío)
    const container = document.getElementById(elementId);

    // 🔥 Si el contenedor NO existe (login.html, etc.) → NO HACER NADA
    if (!container) {
        console.warn(`⚠️ No existe el contenedor '${elementId}' en esta página. No se carga ${filePath}.`);
        return;
    }

    // 2. Realiza la solicitud
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar: ${filePath}`);
            }
            return response.text();
        })
        .then(html => {
            // 3. Inserta el contenido HTML
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Error al cargar componente:', error);
            container.innerHTML = `<p style="color: red;">Error al cargar componente.</p>`;
        });
}


// --- FAVICON ---
function loadFavicon() {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = "./Public_icons/VitoBadiIcon.jpg";
    document.head.appendChild(link);
}


// --- EJECUCIÓN ---
document.addEventListener('DOMContentLoaded', () => {

    loadFavicon();

    // Navbar (solo si existe el div)
    loadComponent('navbar-placeholder', 'NavBar.html');

    // Footer (solo si existe el div)
    loadComponent('footer-placeholder', 'Footer.html');
});
