// JavaScript/ubicacion.js
// Búsqueda por geolocalización usando Google Maps + IndexedDB

let map;
let userMarker;
let userCircle;
let currentMarkers = [];
let userLocation = null;
let habitacionesMapa = []; // vienen de IndexedDB

document.addEventListener("DOMContentLoaded", () => {
    const radioSlider   = document.getElementById("radioBusqueda");
    const radioValue    = document.getElementById("radioValue");
    const btnLocation   = document.getElementById("getLocation");

    if (radioSlider && radioValue) {
        radioValue.textContent = radioSlider.value + " KM";
        radioSlider.addEventListener("input", function () {
            radioValue.textContent = this.value + " KM";
            if (userLocation) {
                const newKm = parseFloat(this.value);
                initMap(userLocation.lat, userLocation.lng, newKm);
            }
        });
    }

    // Cargar habitaciones desde IndexedDB
    abrirBD()
        .then((db) => cargarHabitacionesMapa(db))
        .catch(err => console.error("Error abriendo BD en ubicacion:", err));

    if (btnLocation) {
        btnLocation.addEventListener("click", () => {
            if (!navigator.geolocation) {
                alert("Geolocalización no soportada por este navegador.");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    userLocation = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                    const km = parseFloat(radioSlider?.value || "1");
                    initMap(userLocation.lat, userLocation.lng, km);
                },
                (err) => {
                    console.error("Error geolocalización:", err);
                    alert("No se ha podido obtener tu ubicación.");
                }
            );
        });
    }
});

function cargarHabitacionesMapa(db) {
    const tx    = db.transaction(STORE_HABITACION, "readonly");
    const store = tx.objectStore(STORE_HABITACION);
    const req   = store.getAll();

    req.onsuccess = () => {
        const todas = req.result || [];
        habitacionesMapa = todas
            .filter(h => h.latitud != null && h.longitud != null)
            .map(h => ({
                lat: h.latitud,
                lng: h.longitud,
                name: h.titulo || h.direccion || `Hab ${h.idHabitacion}`,
                precio: h.precio,
                direccion: h.direccion || "",
                idHabitacion: h.idHabitacion
            }));
    };

    req.onerror = (e) => {
        console.error("Error leyendo habitaciones para mapa:", e.target.error);
        habitacionesMapa = [];
    };
}

function initMap(lat, lng, radiusKm) {
    const radiusMeters = (radiusKm || 1) * 1000;

    if (!map) {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat, lng },
            zoom: 14
        });
    } else {
        map.setCenter({ lat, lng });
        map.setZoom(14);
    }

    // Marcador usuario
    if (!userMarker) {
        userMarker = new google.maps.Marker({
            position: { lat, lng },
            map,
            title: "Tu ubicación",
            icon: {
                url: "http://googlemaps.google.com/mapfiles/ms/icons/blue-dot.png"
            }
        });
    } else {
        userMarker.setPosition({ lat, lng });
    }

    // Círculo
    if (!userCircle) {
        userCircle = new google.maps.Circle({
            map,
            fillColor: "#4f46e5",
            fillOpacity: 0.2,
            strokeColor: "#4f46e5",
            strokeOpacity: 0.8,
            strokeWeight: 2
        });
    }
    userCircle.setCenter({ lat, lng });
    userCircle.setRadius(radiusMeters);

    showMarkersInRadius({ lat, lng }, radiusMeters);
}

function showMarkersInRadius(center, radiusMeters) {
    const resultsContainer = document.getElementById("results-list");
    const noResultsMessage = document.getElementById("no-results");

    // Limpiar marcadores antiguos
    currentMarkers.forEach(m => m.setMap(null));
    currentMarkers = [];

    // Limpiar lista
    if (resultsContainer) {
        resultsContainer.innerHTML = "";
    }

    let foundCount = 0;

    habitacionesMapa.forEach(h => {
        const distance = haversineDistance(
            center.lat, center.lng,
            h.lat, h.lng
        );

        if (distance <= radiusMeters) {
            foundCount++;

            const marker = new google.maps.Marker({
                position: { lat: h.lat, lng: h.lng },
                map,
                title: h.name,
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            });
            currentMarkers.push(marker);

            if (resultsContainer) {
                const card = createResultCard(h);
                resultsContainer.appendChild(card);
            }
        }
    });

    if (noResultsMessage) {
        if (foundCount === 0) {
            noResultsMessage.classList.remove("hidden");
        } else {
            noResultsMessage.classList.add("hidden");
        }
    }
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

function createResultCard(h) {
    const card = document.createElement("div");
    card.className = "resultado-card";

    const infoGroup = document.createElement("div");
    infoGroup.className = "resultado-info-group";

    const imgDiv = document.createElement("div");
    imgDiv.className = "resultado-imagen-placeholder";

    const textWrap = document.createElement("div");

    const titulo = document.createElement("h4");
    titulo.className = "text-sm font-semibold";
    titulo.textContent = h.name;

    const direccion = document.createElement("p");
    direccion.className = "text-xs text-gray-500";
    direccion.textContent = h.direccion || "[Dirección no disponible]";

    const precio = document.createElement("p");
    precio.className = "text-sm font-bold text-indigo-600";
    precio.textContent =
        h.precio != null ? `${h.precio} €` : "Precio no disponible";

    textWrap.appendChild(titulo);
    textWrap.appendChild(direccion);
    textWrap.appendChild(precio);

    infoGroup.appendChild(imgDiv);
    infoGroup.appendChild(textWrap);

    card.appendChild(infoGroup);

    card.addEventListener("click", () => {
        if (h.idHabitacion != null) {
            window.location.href = `DetalleHabitacion.html?id=${h.idHabitacion}`;
        }
    });

    return card;
}
