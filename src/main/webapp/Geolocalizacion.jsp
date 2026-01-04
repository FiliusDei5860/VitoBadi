<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List, java.util.Map" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Geolocalización – VitoBadi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/jpeg" href="./Public_icons/VitoBadiIcon.jpg">
    <link rel="stylesheet" href="CSS/style.css">
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Pon tu API KEY aquí antes de entregar -->
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB7fLImOI_55rqllm20r_JpgNHDElD43wQ&libraries=places,geometry&callback=initMap" async defer></script>
</head>

<body class="flex flex-col min-h-screen bg-gray-100">
<jsp:include page="NavBar.jsp" />




<%
    List<Map<String, String>> habs = (List<Map<String, String>>) request.getAttribute("habitacionesGeo");
%>

<main class="flex-grow py-8">
    <%
        Boolean logueado = (Boolean) request.getAttribute("logueado");
        if (logueado == null)
            logueado = false;
    %>


    <script>
  const LOGUEADO = <%= Boolean.TRUE.equals(request.getAttribute("logueado"))%>;
    </script>

    <div class="container mx-auto px-4 max-w-6xl">
        <h1 class="text-3xl font-bold text-center text-indigo-800 mb-2">Geolocalización</h1>
        <p class="text-center text-gray-600 mb-6">
            Se muestran todas las habitaciones excepto las tuyas. Al clicar, verás la fecha desde la que estaría disponible.
        </p>
        <div class="mb-4">
            <input id="searchAddress" type="text"
                   placeholder="Buscar por calle, ciudad…"
                   class="w-full border rounded-lg px-3 py-2"/>
        </div>
        
        <!-- PANEL DETALLE -->
        <div id="detalleBox" class="bg-white rounded-xl shadow p-4 mb-4 hidden">
            <div class="flex gap-4">
                <div class="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img id="detImg" src="" class="w-full h-full object-cover" alt="Habitación">
                </div>
                <div class="flex-grow">
                    <h3 id="detDir" class="font-bold text-gray-800"></h3>
                    <p id="detCity" class="text-sm text-indigo-600 font-medium"></p>
                    <p id="detPrice" class="text-sm text-gray-600"></p>
                    <p class="text-sm mt-2">
                        <strong>Disponible desde:</strong> <span id="detDisp"></span>
                    </p>

                    <% if (logueado) { %>
                    <a id="detLink" href="#" class="inline-block mt-3 text-indigo-600 font-semibold hover:underline">
                        Ver habitación →
                    </a>
                    <form action="FormularioSolicitud.jsp" method="get" class="mt-2">
                        <input type="hidden" name="codHabi" id="detCodHabi" value="">
                        <button class="bg-indigo-600 text-white text-sm px-3 py-2 rounded hover:bg-indigo-700">
                            Solicitar
                        </button>
                    </form>
                    <% } else { %>
                    <p class="mt-3 text-sm text-gray-600">Inicia sesión para ver el detalle y solicitar.</p>
                    <a href="Login.jsp" class="inline-block mt-2 text-indigo-600 font-semibold hover:underline">
                        Ir a login →
                    </a>
                    <% } %>



                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section class="lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div id="map" class="w-full h-[520px]"></div>
            </section>

            <section class="bg-white rounded-xl shadow border border-gray-200 p-4 overflow-auto max-h-[520px]">
                <h2 class="text-xl font-bold text-gray-800 mb-3">Listado</h2>

                <%
                    if (habs == null || habs.isEmpty()) {
                %>
                    <div class="text-center text-gray-500 py-8">No hay habitaciones para mostrar.</div>
                <%
                    } else {
                        for (Map<String, String> h : habs) {
                %>
                        <div class="habItem p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                             data-codhabi="<%= h.get("codHabi")%>"
                             data-dir="<%= h.get("direccion")%>"
                             data-city="<%= h.get("ciudad")%>"
                             data-price="<%= h.get("precioMes")%>"
                             data-img="<%= h.get("imagenHabitacion")%>"
                             data-disp="<%= h.get("disponibleDesde")%>">

                            <div class="font-bold"><%= h.get("direccion")%></div>
                            <div class="text-sm text-gray-600"><%= h.get("ciudad")%> · <%= h.get("precioMes")%> €/mes</div>
                            <div class="text-xs text-gray-500">Disponible desde: <%= h.get("disponibleDesde")%></div>
                        </div>

                <%
                        }
                    }
                %>
            </section>
        </div>
    </div>
</main>

<jsp:include page="Footer.jsp" />

<script>
  let map;
  const markersById = {};
  const markers = []; // para filtrar por distancia con Autocomplete

  function initMap() {
    const centerDefault = { lat: 42.8460, lng: -2.6720 }; // Vitoria
    map = new google.maps.Map(document.getElementById("map"), {
      center: centerDefault,
      zoom: 12
    });

    const data = [
    <% if (habs != null) {
              for (int i = 0; i < habs.size(); i++) {
                  Map<String, String> h = habs.get(i);
    %>
      {
        codHabi: "<%= h.get("codHabi")%>",
        direccion: "<%= h.get("direccion").replace("\"", "\\\"")%>",
        ciudad: "<%= h.get("ciudad").replace("\"", "\\\"")%>",
        precioMes: "<%= h.get("precioMes")%>",
        img: "<%= h.get("imagenHabitacion")%>",
        disponibleDesde: "<%= h.get("disponibleDesde")%>",
        lat: parseFloat("<%= h.get("latitudH")%>"),
        lng: parseFloat("<%= h.get("longitudH")%>")
      }<%= (i < habs.size() - 1) ? "," : ""%>
    <% }
          }%>
    ];

    const bounds = new google.maps.LatLngBounds();

    data.forEach(h => {
      // evita NaN si algo viene vacío
      if (isNaN(h.lat) || isNaN(h.lng)) return;

      const pos = { lat: h.lat, lng: h.lng };
      bounds.extend(pos);

      const marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: h.direccion
      });

      markers.push(marker);

        const botonHtml = LOGUEADO
          ? '<a href="DetalleHabitacionServlet?id=' + h.codHabi + '&returnTo=BusquedaGeolocalizacion"'
              + ' style="display:inline-block;background:#4f46e5;color:#fff;padding:7px 10px;'
              + 'border-radius:10px;font-size:12px;text-decoration:none">'
              + 'Ver detalle</a>'
          : '<a href="Login.jsp"'
              + ' style="display:inline-block;background:#111;color:#fff;padding:7px 10px;'
              + 'border-radius:10px;font-size:12px;text-decoration:none">'
              + 'Inicia sesión para ver</a>';

        const info = new google.maps.InfoWindow({
          content:
            '<div style="max-width:260px;font-family:Arial,sans-serif">' +

              '<div style="display:flex;gap:10px;align-items:center">' +
                '<img src="' + (h.img || 'Public_icons/hab1.png') + '" ' +
                     'style="width:72px;height:54px;object-fit:cover;border-radius:8px;background:#f2f2f2" />' +

                '<div style="flex:1">' +
                  '<div style="font-weight:700;font-size:13px;margin-bottom:2px">' +
                    h.direccion +
                  '</div>' +
                  '<div style="color:#4f46e5;font-size:12px;font-weight:600">' +
                    h.ciudad +
                  '</div>' +
                  '<div style="font-size:12px"><b>' + h.precioMes + ' €/mes</b></div>' +
                '</div>' +
              '</div>' +

              '<div style="margin-top:8px;font-size:12px;color:#555">' +
                'Disponible desde: <b>' + h.disponibleDesde + '</b>' +
              '</div>' +

              '<div style="margin-top:10px">' +
                botonHtml +
              '</div>' +

            '</div>'
        });


        marker.addListener("click", () => {
          info.open(map, marker);

          // Rellena el panel detalle (igual que al clicar en la lista)
          mostrarDetalle({
            codhabi: h.codHabi,
            dir: h.direccion,
            city: h.ciudad,
            price: h.precioMes,
            img: h.img,
            disp: h.disponibleDesde
          });
        });

      markersById[h.codHabi] = { marker, info };
    });

    if (data.length > 0) map.fitBounds(bounds);

    // ===== Autocomplete (Places) =====
    const input = document.getElementById("searchAddress");
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["geocode"],
      componentRestrictions: { country: "es" }
    });

    autocomplete.addListener("place_changed", () => {
  const place = autocomplete.getPlace();
  if (!place.geometry) return;

  if (place.geometry.viewport) {
    map.fitBounds(place.geometry.viewport);
  } else if (place.geometry.location) {
    map.panTo(place.geometry.location);
    map.setZoom(14);
  }

  const center = place.geometry.location;
  if (!center) return;

  const maxKm = 20;
  markers.forEach(m => {
    const dKm = google.maps.geometry.spherical
      .computeDistanceBetween(center, m.getPosition()) / 1000;
    m.setVisible(dKm <= maxKm);
  });
});

  }

  function focusMarker(codHabi) {
    const item = markersById[codHabi];
    if (!item) return;
    map.panTo(item.marker.getPosition());
    map.setZoom(14);
    item.info.open(map, item.marker);
  }
</script>

<script>
  function mostrarDetalle(data) {
    const box = document.getElementById("detalleBox");
    document.getElementById("detImg").src = data.img || "Public_icons/hab1.png";
    document.getElementById("detDir").textContent = data.dir || "";
    document.getElementById("detCity").textContent = data.city || "";
    document.getElementById("detPrice").textContent = (data.price ? (data.price + " €/mes") : "");
    document.getElementById("detDisp").textContent = data.disp || "";
    document.getElementById("detCodHabi").value = data.codhabi;


    // link opcional a la ficha
    document.getElementById("detLink").href = "DetalleHabitacionServlet?id=" + encodeURIComponent(data.codhabi) + "&returnTo=BusquedaGeolocalizacion";

    box.classList.remove("hidden");
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  document.querySelectorAll(".habItem").forEach(item => {
    item.addEventListener("click", (e) => {
        const d = {
          codhabi: item.dataset.codhabi,
          dir: item.dataset.dir,
          city: item.dataset.city,
          price: item.dataset.price,
          img: item.dataset.img,
          disp: item.dataset.disp
        };
        mostrarDetalle(d);
        focusMarker(d.codhabi);   // <-- AÑADE ESTA LÍNEA
      });

  });
</script>


</body>
</html>
