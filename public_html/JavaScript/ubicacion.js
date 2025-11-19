/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
let map;
let userMarker;
let userCircle;
let currentMarkers = []; // Almacena los marcadores de resultados para poder eliminarlos
let userLocation = null; // Almacena la ubicación actual para re-búsquedas

// Marcadores de ejemplo (se mantiene el array de habitaciones)
const mockHabitaciones = [
    { lat: 42.8616922, lng: -2.7380206, name: "Aligobeo (Lejos)", precio: 500, direccion: "C/ Lejos 1" },
    { lat: 42.8412704, lng: -2.6762743, name: "Parque de la Florida (Cerca)", precio: 380, direccion: "Pza. Nueva 2" },
    { lat: 42.8403004, lng: -2.6845562, name: "Estadio de Mendizorrotza (Cerca)", precio: 450, direccion: "C/ Estadio 5" },
    { lat: 42.8501865, lng: -2.6433496, name: "Elorriaga (Lejos)", precio: 600, direccion: "Paseo de la Montaña 8" }
];

// Función para inicializar/actualizar el mapa
function initMap(lat, lng, radiusKm) {
    const radiusMeters = radiusKm * 1000;
    userLocation = { lat, lng };

    // 1. Inicializar el mapa si no existe
    if (!map) {
        map = new google.maps.Map(document.getElementById("map"), {
            center: userLocation,
            zoom: 14,
        });
    } else {
        // Mover el centro si el mapa ya existe (re-búsqueda)
        map.setCenter(userLocation);
        map.setZoom(14);
    }
    
    // 2. Actualizar o crear el marcador del usuario
    if (!userMarker) {
        userMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Tu ubicación",
            icon: {
                url: "http://googlemaps.google.com/mapfiles/ms/icons/blue-dot.png", // Ícono más claro
            },
        });
    } else {
        userMarker.setPosition(userLocation);
    }

    // 3. Actualizar o crear el círculo de radio
    if (!userCircle) {
        userCircle = new google.maps.Circle({
            map: map,
            fillColor: "#4f46e5", // Color Índigo de Tailwind
            fillOpacity: 0.2,
            strokeColor: "#4f46e5",
            strokeOpacity: 0.8,
            strokeWeight: 2,
        });
    }
    userCircle.setCenter(userLocation);
    userCircle.setRadius(radiusMeters); // Actualizar radio en metros

    // 4. Mostrar y listar los marcadores dentro del radio
    showMarkersInRadius(userLocation, radiusMeters);
}

// Limpia los marcadores anteriores
function clearMarkers() {
    currentMarkers.forEach(marker => marker.setMap(null));
    currentMarkers = [];
}

// Calcular distancia entre dos coordenadas (Función Haversine se mantiene)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; 
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

// Mostrar marcadores en el mapa y en la lista de resultados
function showMarkersInRadius(userLocation, radiusMeters) {
    clearMarkers();
    const resultsContainer = document.getElementById("results-list"); // Asumimos un ID en el contenedor de resultados
    const noResultsMessage = document.getElementById("no-results");
    
    // Limpiar resultados anteriores
    resultsContainer.innerHTML = '';
    let foundCount = 0;

    mockHabitaciones.forEach((habitacion) => {
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            habitacion.lat,
            habitacion.lng
        );

        if (distance <= radiusMeters) {
            foundCount++;
            
            // 1. Agregar Marcador al Mapa
            const newMarker = new google.maps.Marker({
                position: { lat: habitacion.lat, lng: habitacion.lng },
                map: map,
                title: habitacion.name,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });
            currentMarkers.push(newMarker);
            
            // 2. Agregar resultado a la Lista
            const resultCard = createResultCard(habitacion);
            resultsContainer.appendChild(resultCard);
        }
    });
    
    // Mostrar u ocultar el mensaje de no resultados
    if (foundCount === 0) {
        noResultsMessage.classList.remove('hidden');
    } else {
        noResultsMessage.classList.add('hidden');
    }
}

// Crea el HTML de la tarjeta de resultado
function createResultCard(habitacion) {
    const div = document.createElement('div');
    // Usamos las clases de estilo que definimos en style.css y Tailwind
    div.className = 'resultado-card mb-4 cursor-pointer hover:bg-gray-50'; 
    div.innerHTML = `
        <div class="resultado-info-group">
            <div class="resultado-imagen-placeholder"></div>
            <div>
                <h4 class="text-sm font-semibold">${habitacion.name}</h4>
                <p class="text-xs text-gray-500">${habitacion.direccion}</p>
                <p class="text-sm font-bold text-indigo-600">${habitacion.precio} €</p>
            </div>
        </div>
    `;
    return div;
}

// =========================================================
// GESTIÓN DE EVENTOS (Adaptado a tu HTML: BusquedaGeolocalizacion.html)
// =========================================================

// Dispara la búsqueda al hacer clic en el botón
document.getElementById("getLocation").addEventListener("click", () => {
    // 1. Obtener radio actual del slider (en KM)
    const radiusKm = parseFloat(document.getElementById("radioBusqueda").value);

    // 2. Obtener ubicación (simulación con geolocalización)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Iniciar/Actualizar mapa con la ubicación del usuario y el radio
                initMap(latitude, longitude, radiusKm);
            },
            (error) => {
                alert("Error al obtener la ubicación: " + error.message);
            }
        );
    } else {
        alert("Geolocalización no soportada por este navegador.");
    }
});

// Actualiza el texto del radio al mover el slider
document.addEventListener('DOMContentLoaded', () => {
    const radioSlider = document.getElementById('radioBusqueda');
    const radioValueSpan = document.getElementById('radioValue');

    // Muestra el valor inicial
    radioValueSpan.textContent = radioSlider.value + ' KM';
    
    radioSlider.addEventListener('input', function() {
        radioValueSpan.textContent = this.value + ' KM';
        
        // Opcional: Re-buscar si la ubicación ya se conoce y el radio cambia
        if (userLocation) {
            const newRadiusKm = parseFloat(this.value);
            initMap(userLocation.lat, userLocation.lng, newRadiusKm);
        }
    });
});