<%-- 
    Document   : CreateHabitacion
    Created on : 20 dic 2025, 6:45:55 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>VitoBadi - Crear Nueva Habitación</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCtizczsj_0KipWe9tcTp_hsOBFdlWGEeE"></script>

    <link rel="stylesheet" href="./Css/style.css">
</head>

<body class="bg-gray-100 font-sans flex flex-col min-h-screen">

<jsp:include page="NavBar.jsp" />

<main class="container mx-auto my-10 px-4 max-w-4xl flex-grow">
    <h1 class="text-3xl font-bold text-indigo-700 text-center mb-2">Crear Nueva Habitación</h1>
    <p class="text-center text-gray-600 mb-10">Introduce los datos de tu nueva habitación.</p>

    <form action="CrearHabitacionServlet" method="POST" enctype="multipart/form-data">

        <!-- =========================
             INFORMACIÓN BÁSICA (CAJÓN)
        ========================== -->
        <section class="bg-white rounded-xl shadow-md p-6 mb-10">
            <h2 class="text-xl font-bold text-indigo-700 mb-5 border-b pb-2">
                Información básica
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700">Precio mensual (€)</label>
                    <input type="number" name="precio" required min="1" step="1"
                           class="mt-1 block w-full border border-gray-300 rounded-lg p-2">
                </div>
            </div>
        </section>

        <!-- =========================
             UBICACIÓN (CAJÓN)
        ========================== -->
        <section class="bg-white rounded-xl shadow-md p-6 mb-10">
            <h2 class="text-xl font-bold text-indigo-700 mb-5 border-b pb-2">
                Ubicación
            </h2>

            <div class="grid grid-cols-1 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Dirección completa</label>
                    <input type="text" name="direccion" required
                           class="mt-1 block w-full border border-gray-300 rounded-lg p-2">
                    <p class="text-xs text-gray-500 mt-2">
                        Se rellena sola al fijar el pin (puedes editarla si quieres).
                    </p>
                </div>

                <div class="w-full md:w-1/3">
                    <label class="block text-sm font-medium text-gray-700">Ciudad</label>
                    <select name="ciudad" required
                            class="mt-1 block w-full border border-gray-300 rounded-lg p-2">
                        <option value="Vitoria-Gasteiz" selected>Vitoria-Gasteiz</option>
                        <option value="Bilbao">Bilbao</option>
                        <option value="Donostia-San Sebastián">Donostia-San Sebastián</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ubicación en el mapa</label>
                    <div id="map" class="w-full h-80 rounded-lg border"></div>
                    <p class="text-xs text-gray-500 mt-2">
                        Haz clic en el mapa o arrastra el pin: se rellenan latitud/longitud y la dirección.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Latitud</label>
                        <input type="text" name="latitud" readonly
                               class="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-lg p-2">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Longitud</label>
                        <input type="text" name="longitud" readonly
                               class="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-lg p-2">
                    </div>
                </div>
            </div>
        </section>

        <!-- =========================
             IMÁGENES (CAJÓN)
        ========================== -->
        <section class="bg-white rounded-xl shadow-md p-6 mb-10">
            <h2 class="text-xl font-bold text-indigo-700 mb-5 border-b pb-2">
                Imágenes
            </h2>

            <div>
                <input type="file" id="imagenes" name="imagenes" accept="image/*" multiple class="hidden">

                <div id="drop-zone"
                     class="border-2 border-dashed border-gray-400 p-8 rounded-lg text-center cursor-pointer hover:bg-indigo-50 transition">
                    <p class="text-gray-500">Arrastra imágenes aquí o haz clic para seleccionar</p>
                </div>

                <div id="preview-container" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4"></div>
            </div>
        </section>

        <!-- =========================
             BOTONES
        ========================== -->
        <div class="flex justify-end gap-4">
            <a href="MisHabitaciones.jsp"
               class="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">
                Cancelar
            </a>

            <button type="submit"
                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow">
                Guardar habitación
            </button>
        </div>

    </form>
</main>

<jsp:include page="Footer.jsp" />

<!-- =========================
     PREVIEW IMÁGENES
========================== -->
<script>
    const dropZone = document.getElementById('drop-zone');
    const inputFiles = document.getElementById('imagenes');
    const preview = document.getElementById('preview-container');

    dropZone.addEventListener('click', () => inputFiles.click());
    inputFiles.addEventListener('change', updatePreview);

    function updatePreview() {
        preview.innerHTML = '';
        Array.from(inputFiles.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = "w-full h-28 object-cover rounded border";
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
</script>

<!-- =========================
     GOOGLE MAPS (PIN + REVERSE GEOCODE)
========================== -->
<script>
    let map, marker, geocoder;

    const cityCenters = {
        "Vitoria-Gasteiz": { lat: 42.8460, lng: -2.6720, zoom: 13 },
        "Bilbao": { lat: 43.2620, lng: -2.9350, zoom: 13 },
        "Donostia-San Sebastián": { lat: 43.3140, lng: -1.9910, zoom: 13 }
    };

    function initMap() {
        geocoder = new google.maps.Geocoder();

        const citySelect = document.querySelector('select[name="ciudad"]');
        const initialCity = citySelect.value;
        const initialPos = cityCenters[initialCity] || cityCenters["Vitoria-Gasteiz"];

        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: initialPos.lat, lng: initialPos.lng },
            zoom: initialPos.zoom
        });

        marker = new google.maps.Marker({
            position: { lat: initialPos.lat, lng: initialPos.lng },
            map,
            draggable: true
        });

        setLatLng(initialPos.lat, initialPos.lng);
        reverseGeocode(initialPos.lat, initialPos.lng);

        map.addListener("click", (e) => {
            marker.setPosition(e.latLng);
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setLatLng(lat, lng);
            reverseGeocode(lat, lng);
        });

        marker.addListener("dragend", (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setLatLng(lat, lng);
            reverseGeocode(lat, lng);
        });

        citySelect.addEventListener("change", () => {
            const c = cityCenters[citySelect.value] || cityCenters["Vitoria-Gasteiz"];
            map.setCenter({ lat: c.lat, lng: c.lng });
            map.setZoom(c.zoom);
            marker.setPosition({ lat: c.lat, lng: c.lng });
            setLatLng(c.lat, c.lng);
            reverseGeocode(c.lat, c.lng);
        });
    }

    function setLatLng(lat, lng) {
        document.querySelector('input[name="latitud"]').value = lat.toFixed(4);
        document.querySelector('input[name="longitud"]').value = lng.toFixed(4);
    }

    function reverseGeocode(lat, lng) {
        if (!geocoder) return;

        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
                document.querySelector('input[name="direccion"]').value = results[0].formatted_address;
            }
        });
    }

    window.addEventListener("load", initMap);
</script>

</body>
</html>
