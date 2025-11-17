/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


// Función para cargar contenido de un archivo HTML en un elemento del DOM
function loadComponent(elementId, filePath) {
    // 1. Obtiene el contenedor (por ejemplo, el <div> vacío)
    const container = document.getElementById(elementId);
    
    // 2. Realiza una solicitud HTTP para obtener el contenido del archivo
    fetch(filePath)
        .then(response => {
            // Verifica que la respuesta sea exitosa (código 200)
            if (!response.ok) {
                throw new Error(`No se pudo cargar el archivo: ${filePath}`);
            }
            return response.text(); // Devuelve el contenido como texto
        })
        .then(html => {
            // 3. Inserta el contenido HTML dentro del contenedor
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Error al cargar el componente:', error);
            // Mensaje de fallback en caso de error
            container.innerHTML = `<p style="color: red;">Error al cargar la navegación.</p>`;
        });
}

function loadFavicon() {
    // 1. Crea el elemento <link>
    const link = document.createElement('link');
    
    // 2. Define los atributos
    link.rel = 'icon';
    link.type = 'image/png';
    // CLAVE: La ruta sigue siendo la misma. Usa '?v=' para evitar la caché.
    link.href = "./Public_icons/VitoBadiIcon.jpg";

    // 3. Inserta el elemento en la sección <head>
    document.head.appendChild(link);
}
// Llama a la función para cargar la barra de navegación
document.addEventListener('DOMContentLoaded', () => {
    // CARGA EL FAVICON PRIMERO 
    loadFavicon();
    // CARGA LA NAVBAR 
    loadComponent('navbar-placeholder', 'navbar.html'); 
    // CARGA EL FOOTER 
    loadComponent('footer-placeholder', 'footer.html');
});