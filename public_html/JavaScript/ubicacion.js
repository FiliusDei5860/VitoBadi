// =========================================
// JavaScript/ubicacion.js - VERSIÓN BÚSQUEDA MANUAL (CORREGIDO Y ORDENADO)
// El enlace de la tarjeta y el InfoWindow apunta a SolicitarGeolocalizacion.html
// =========================================

// Variables Globales
let map;
let userMarker;
let userCircle;
let currentMarkers = [];
let habitacionesMapa = []; // Datos de IndexedDB
const VITORIA_COORDS = {lat: 42.8467, lng: -2.6716}; // Coordenadas de Vitoria

// ********************************************
// * NUEVAS VARIABLES GLOBALES PARA LOGIN *
// ********************************************
let usuarioActual = null;
let estaLogeado = false;
// ********************************************

// ---------------------------------------------------------
// INICIALIZACIÓN Y EVENTOS
// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los inputs del usuario
    const latInput = document.getElementById("txtLat");
    const lngInput = document.getElementById("txtLng");
    const radioSlider = document.getElementById("radioBusqueda");
    const radioValue = document.getElementById("radioValue");
    const btnBuscar = document.getElementById("btnBuscar");

    // =========================
    //  Leer usuario logeado (Copia de ListaHabitaciones.js)
    // =========================
    try {
        const stored = sessionStorage.getItem("usuarioActual");
        if (stored) {
            usuarioActual = JSON.parse(stored);
            estaLogeado = !!usuarioActual?.email;
        }
    } catch (e) {
        console.warn("No se ha podido leer usuarioActual de sessionStorage:", e);
    }
    // =========================

    // Configuración del Slider
    if (radioSlider && radioValue) {
        radioValue.textContent = radioSlider.value + " KM";
        radioSlider.addEventListener("input", function () {
            radioValue.textContent = this.value + " KM";
        });
    }

    // 1. Inicializar el mapa al centro de Vitoria al cargar
    initMap(VITORIA_COORDS.lat, VITORIA_COORDS.lng, 1);

    // 2. Cargar habitaciones desde IndexedDB
    // NOTA: Asegúrate de que 'abrirBD' y 'STORE_HABITACION' estén en db.js
    abrirBD()
            .then((db) => cargarHabitacionesMapa(db))
            .catch(err => console.error("Error abriendo BD en ubicacion:", err));

    // 3. Evento de Búsqueda Manual
    if (btnBuscar) {
        btnBuscar.addEventListener("click", realizarBusqueda);
    }

    function realizarBusqueda() {
        const latStr = latInput.value;
        const lngStr = lngInput.value;
        const km = parseFloat(radioSlider.value);

        // Validación
        if (!latStr || !lngStr) {
            alert("Por favor, introduce valores válidos para Latitud y Longitud.");
            return;
        }

        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);

        if (isNaN(lat) || isNaN(lng)) {
            alert("Los valores de Latitud y Longitud deben ser números válidos.");
            return;
        }

        // Ejecutar la lógica de mapa y búsqueda con las coordenadas del usuario
        initMap(lat, lng, km);
    }
});

// ---------------------------------------------------------
// LÓGICA DE MAPA Y BÚSQUEDA
// ---------------------------------------------------------

function initMap(lat, lng, radiusKm) {
    const radiusMeters = (radiusKm || 1) * 1000;

    // Crear/Centrar el mapa
    if (!map) {
        map = new google.maps.Map(document.getElementById("map"), {
            center: {lat, lng},
            zoom: 14
        });
    } else {
        map.setCenter({lat, lng});
        map.setZoom(14);
    }

    // Marcador usuario (Azul)
    if (!userMarker) {
        userMarker = new google.maps.Marker({
            position: {lat, lng},
            map,
            title: "Ubicación de búsqueda",
            icon: {
                url: "http://googlemaps.google.com/mapfiles/ms/icons/blue-dot.png" // Icono azul
            }
        });
    } else {
        userMarker.setPosition({lat, lng});
    }

    // Círculo
    if (!userCircle) {
        userCircle = new google.maps.Circle({
            map,
            fillColor: "#4f46e5",
            fillOpacity: 0.2,
            strokeColor: "#4f46e5",
            strokeWeight: 2
        });
    }
    userCircle.setCenter({lat, lng});
    userCircle.setRadius(radiusMeters);

    // Ajustar zoom para que quepa el círculo
    map.fitBounds(userCircle.getBounds());

    showMarkersInRadius({lat, lng}, radiusMeters);
}

function showMarkersInRadius(center, radiusMeters) {
    const resultsContainer = document.getElementById("results-list");
    const noResultsMessage = document.getElementById("no-results");

    // Limpiar marcadores y resultados antiguos
    currentMarkers.forEach(m => m.setMap(null));
    currentMarkers = [];
    if (resultsContainer) {
        resultsContainer.innerHTML = "";
    }

    // 1. Filtrar las habitaciones dentro del radio
    let habitacionesEncontradas = [];
    habitacionesMapa.forEach(h => {
        const distance = haversineDistance(
                center.lat, center.lng,
                h.lat, h.lng
                );

        if (distance <= radiusMeters) {
            h.distance = distance;
            habitacionesEncontradas.push(h);
        }
    });

    // 2. ORDENAR DE MENOR A MAYOR PRECIO
    habitacionesEncontradas.sort((a, b) => {
        const precioA = a.precio != null ? Number(a.precio) : Infinity;
        const precioB = b.precio != null ? Number(b.precio) : Infinity;
        return precioA - precioB;
    });

    // 3. Crear marcadores y tarjetas
    habitacionesEncontradas.forEach(h => {
        // Crear marcador de Habitación (Rojo)
        const marker = new google.maps.Marker({
            position: {lat: parseFloat(h.lat), lng: parseFloat(h.lng)},
            map,
            title: h.name,
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" // Icono rojo
        });
        currentMarkers.push(marker);

        // Crear InfoWindow (Popup) al hacer click
        const infoWindow = new google.maps.InfoWindow({
            // Enlace al nuevo HTML
            content: `<div style="text-align:center;"><b>${h.name}</b><br>${h.direccion}<br><strong style="color:#4f46e5">${h.precio} €</strong><br><a href="SolicitarGeolocalizacion.html?id=${h.idHabitacion}">Ver detalles</a></div>`
        });
        marker.addListener('click', () => {
            infoWindow.open({anchor: marker, map});
        });

        // Añadir tarjeta a la lista de resultados
        if (resultsContainer) {
            const card = createResultCard(h);
            resultsContainer.appendChild(card);
        }
    });

    // Mostrar mensaje de no resultados
    if (noResultsMessage) {
        if (habitacionesEncontradas.length === 0) {
            noResultsMessage.classList.remove("hidden");
        } else {
            noResultsMessage.classList.add("hidden");
        }
    }
}

// ---------------------------------------------------------
// UTILIDADES (BD, DISTANCIA Y TARJETA)
// ---------------------------------------------------------

function cargarHabitacionesMapa(db) {
    // Asegúrate de que STORE_HABITACION esté definido en db.js o globalmente
    const tx = db.transaction(STORE_HABITACION, "readonly");
    const store = tx.objectStore(STORE_HABITACION);
    const req = store.getAll();

    req.onsuccess = () => {
        let todas = req.result || [];

        // ********************************************
        // * NUEVO FILTRO: EXCLUIR HABITACIONES PROPIAS *
        // ********************************************
        if (estaLogeado) {
            const emailArrendador = usuarioActual.email;
            todas = todas.filter(h => h.emailPropietario !== emailArrendador);
        }
        // ********************************************

        habitacionesMapa = todas
                .filter(h => h.latitud != null && h.longitud != null)
                .map(h => ({
                        lat: parseFloat(h.latitud),
                        lng: parseFloat(h.longitud),
                        name: h.titulo || h.direccion || `Hab ${h.idHabitacion}`,
                        precio: h.precio,
                        direccion: h.direccion || "",
                        idHabitacion: h.idHabitacion // Asegúrate de tener el ID
                    }));

        // Forzar una nueva búsqueda en el mapa con los datos filtrados
        // Esto es necesario si los datos se cargan después de que initMap ya se ejecutó con el centro de Vitoria
        if (map && userMarker) {
            const currentPos = userMarker.getPosition();
            // El radio se toma del círculo ya dibujado o se asume 1000m si no hay círculo
            const currentRadius = userCircle ? userCircle.getRadius() : 1000;
            showMarkersInRadius({lat: currentPos.lat(), lng: currentPos.lng()}, currentRadius);
        } else {
            // Si el mapa aún no está listo, se llamará a showMarkersInRadius al final de initMap.
        }
    };

    req.onerror = (e) => {
        console.error("Error leyendo habitaciones para mapa:", e.target.error);
        habitacionesMapa = [];
    };
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    const R = 6371000; // metros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Crea la tarjeta de resultado y añade el evento de clic para navegar.
 * @param {Object} h Objeto habitación con idHabitacion
 */
function createResultCard(h) {
    const card = document.createElement("div");
    card.className = "p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-50";

    const titulo = document.createElement("h4");
    titulo.className = "text-sm font-semibold text-indigo-700";
    titulo.textContent = h.name;

    const direccion = document.createElement("p");
    direccion.className = "text-xs text-gray-500";
    direccion.textContent = h.direccion || "[Dirección no disponible]";

    const precio = document.createElement("p");
    precio.className = "text-sm font-bold text-green-600 mt-1";
    precio.textContent =
            h.precio != null ? `${h.precio} €` : "Precio no disponible";

    card.appendChild(titulo);
    card.appendChild(direccion);
    card.appendChild(precio);

    // Redirección al clic
    card.addEventListener("click", () => {
        if (h.idHabitacion != null) {
            window.location.href = `SolicitarGeolocalizacion.html?id=${h.idHabitacion}`;
        }
    });

    return card;
}