// =========================================
// JavaScript/ubicacion.js
// Búsqueda manual con mapa + lista resultados con imagen
// =========================================

// Variables Globales
let map;
let userMarker;
let userCircle;
let currentMarkers = [];
let habitacionesMapa = []; // Datos de IndexedDB
const VITORIA_COORDS = {lat: 42.8467, lng: -2.6716};

// Login
let usuarioActual = null;
let estaLogeado = false;

// ------------------------------
// Helpers
// ------------------------------
function normalizarSrc(raw) {
    if (!raw)
        return null;
    if (raw.startsWith("data:"))
        return raw;                 // ya es dataURL
    if (raw.startsWith("http") || raw.startsWith("./") || raw.startsWith("/"))
        return raw;
    // base64 pelado
    return `data:image/jpeg;base64,${raw}`;
}

// ---------------------------------------------------------
// INICIALIZACIÓN Y EVENTOS
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const latInput = document.getElementById("txtLat");
    const lngInput = document.getElementById("txtLng");
    const radioSlider = document.getElementById("radioBusqueda");
    const radioValue = document.getElementById("radioValue");
    const btnBuscar = document.getElementById("btnBuscar");

    // Leer usuario logeado
    try {
        const stored = sessionStorage.getItem("usuarioActual");
        if (stored) {
            usuarioActual = JSON.parse(stored);
            estaLogeado = !!usuarioActual?.email;
        }
    } catch (e) {
        console.warn("No se ha podido leer usuarioActual:", e);
    }

    // Slider
    if (radioSlider && radioValue) {
        radioValue.textContent = radioSlider.value + " KM";
        radioSlider.addEventListener("input", function () {
            radioValue.textContent = this.value + " KM";
        });
    }

    // Mapa inicial
    initMap(VITORIA_COORDS.lat, VITORIA_COORDS.lng, 1);

    // Cargar habitaciones IndexedDB
    abrirBD()
            .then(db => cargarHabitacionesMapa(db))
            .catch(err => console.error("Error abriendo BD en ubicacion:", err));

    // Buscar manual
    if (btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            const latStr = latInput.value;
            const lngStr = lngInput.value;
            const km = parseFloat(radioSlider.value);

            if (!latStr || !lngStr) {
                alert("Introduce Latitud y Longitud.");
                return;
            }
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);
            if (isNaN(lat) || isNaN(lng)) {
                alert("Latitud/Longitud deben ser números.");
                return;
            }
            initMap(lat, lng, km);
        });
    }
});

// ---------------------------------------------------------
// MAPA
// ---------------------------------------------------------
function initMap(lat, lng, radiusKm) {
    const radiusMeters = (radiusKm || 1) * 1000;

    if (!map) {
        map = new google.maps.Map(document.getElementById("map"), {
            center: {lat, lng},
            zoom: 14
        });
    } else {
        map.setCenter({lat, lng});
        map.setZoom(14);
    }

    // Marker usuario
    if (!userMarker) {
        userMarker = new google.maps.Marker({
            position: {lat, lng},
            map,
            title: "Ubicación de búsqueda",
            icon: {url: "http://googlemaps.google.com/mapfiles/ms/icons/blue-dot.png"}
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

    map.fitBounds(userCircle.getBounds());

    showMarkersInRadius({lat, lng}, radiusMeters);
}

function showMarkersInRadius(center, radiusMeters) {
    const resultsContainer = document.getElementById("results-list");
    const noResultsMessage = document.getElementById("no-results");

    currentMarkers.forEach(m => m.setMap(null));
    currentMarkers = [];
    if (resultsContainer)
        resultsContainer.innerHTML = "";

    let habitacionesEncontradas = [];
    habitacionesMapa.forEach(h => {
        const distance = haversineDistance(center.lat, center.lng, h.lat, h.lng);
        if (distance <= radiusMeters) {
            h.distance = distance;
            habitacionesEncontradas.push(h);
        }
    });

    habitacionesEncontradas.sort((a, b) => {
        const precioA = a.precio != null ? Number(a.precio) : Infinity;
        const precioB = b.precio != null ? Number(b.precio) : Infinity;
        return precioA - precioB;
    });

    habitacionesEncontradas.forEach(h => {
        const marker = new google.maps.Marker({
            position: {lat: h.lat, lng: h.lng},
            map,
            title: h.name,
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        });
        currentMarkers.push(marker);

        const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="text-align:center;">
                <b>${h.name}</b><br>
                ${h.direccion}<br>
                <strong style="color:#4f46e5">${h.precio} €</strong><br>
                <a href="SolicitarGeolocalizacion.html?id=${h.idHabitacion}">Ver detalles</a>
              </div>`
        });
        marker.addListener("click", () => infoWindow.open({anchor: marker, map}));

        if (resultsContainer) {
            resultsContainer.appendChild(createResultCard(h));
        }
    });

    if (noResultsMessage) {
        noResultsMessage.classList.toggle("hidden", habitacionesEncontradas.length !== 0);
    }
}

// ---------------------------------------------------------
// BD + UTILIDADES
// ---------------------------------------------------------
function cargarHabitacionesMapa(db) {
    const tx = db.transaction(STORE_HABITACION, "readonly");
    const store = tx.objectStore(STORE_HABITACION);
    const req = store.getAll();

    req.onsuccess = () => {
        let todas = req.result || [];

        // Excluir habitaciones propias si logeado
        if (estaLogeado) {
            const emailProp = usuarioActual.email;
            todas = todas.filter(h => h.emailPropietario !== emailProp);
        }

        habitacionesMapa = todas
                .filter(h => h.latitud != null && h.longitud != null)
                .map(h => ({
                        lat: parseFloat(h.latitud),
                        lng: parseFloat(h.longitud),
                        name: h.titulo || h.direccion || `Hab ${h.idHabitacion}`,
                        precio: h.precio,
                        direccion: h.direccion || "",
                        idHabitacion: h.idHabitacion,
                        imagenes: h.imagenes || null, // <<< CLAVE
                        imagen: h.imagen || null        // por si tenéis una sola
                    }));

        if (map && userMarker) {
            const currentPos = userMarker.getPosition();
            const currentRadius = userCircle ? userCircle.getRadius() : 1000;
            showMarkersInRadius(
                    {lat: currentPos.lat(), lng: currentPos.lng()},
                    currentRadius
                    );
        }
    };

    req.onerror = e => {
        console.error("Error leyendo habitaciones:", e.target.error);
        habitacionesMapa = [];
    };
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = x => x * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createResultCard(h) {
    const card = document.createElement("article");
    card.className = "solicitud-card cursor-pointer";

    const infoGroup = document.createElement("div");
    infoGroup.className = "solicitud-info-group";

    const imgDiv = document.createElement("div");
    imgDiv.className = "solicitud-imagen-placeholder";

    let imgSrc = null;
    if (Array.isArray(h.imagenes) && h.imagenes.length > 0) {
        imgSrc = h.imagenes[0];
    } else if (h.imagen) {
        imgSrc = h.imagen;
    }
    imgSrc = normalizarSrc(imgSrc);

    if (imgSrc) {
        imgDiv.style.backgroundImage = `url('${imgSrc}')`;
        imgDiv.style.backgroundSize = "cover";
        imgDiv.style.backgroundPosition = "center";
        imgDiv.style.backgroundRepeat = "no-repeat";
    }

    if (!estaLogeado) {
        imgDiv.classList.add("room-card-image-blurred");
    }

    const textWrap = document.createElement("div");

    const titulo = document.createElement("h3");
    titulo.className = "solicitud-titulo text-indigo-700";
    titulo.textContent = h.name;

    const direccion = document.createElement("p");
    direccion.className = "solicitud-secundario";
    direccion.textContent = h.direccion || "-";

    const precio = document.createElement("p");
    precio.className = "solicitud-secundario font-bold text-green-600";
    precio.textContent = h.precio != null ? `${h.precio} €/mes` : "-";

    textWrap.append(titulo, direccion, precio);
    infoGroup.append(imgDiv, textWrap);
    card.appendChild(infoGroup);

    card.addEventListener("click", () => {
        window.location.href = `SolicitarGeolocalizacion.html?id=${h.idHabitacion}`;
    });

    return card;
}
