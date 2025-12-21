 <%-- 

    Document   : Geolocalizacion
    Created on : 20 dic 2025, 9:16:13 a.m.
    Author     : Resen
--%><%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.time.LocalDate" %>
<%
    String nombre = (String) session.getAttribute("nombreUsuario");
    String hoy = LocalDate.now().toString();

    // Recuperar valores de la URL para persistir la búsqueda tras el envío
    String latVal = request.getParameter("lat") != null ? request.getParameter("lat") : "";
    String lngVal = request.getParameter("lng") != null ? request.getParameter("lng") : "";
    String radioVal = request.getParameter("radio") != null ? request.getParameter("radio") : "2.5";
    String fechaVal = request.getParameter("fecha") != null ? request.getParameter("fecha") : hoy;
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VitoBadi - Mapa de Habitaciones</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="Css/style.css">
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAWfEboKAvFexFjk3QH7-fdBTO7jc4xHfo" async defer></script>
</head>
<body class="bg-gray-100 font-sans flex flex-col min-h-screen">
    
    <jsp:include page="navbar.jsp" />

    <main class="container mx-auto my-8 px-4 max-w-7xl flex-grow">
        <h2 class="text-3xl font-bold text-indigo-700 text-center mb-6">Explorar por Mapa</h2>
        
        <div class="bg-white p-6 rounded-xl shadow-lg mb-8 border-t-4 border-indigo-600">
            <form action="UbicacionServlet" method="POST" class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase">Latitud</label>
                    <input type="number" name="lat" id="txtLat" step="any" value="<%= latVal %>" required
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase">Longitud</label>
                    <input type="number" name="lng" id="txtLng" step="any" value="<%= lngVal %>" required
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase">Fecha Entrada</label>
                    <input type="date" name="fecha" id="fecha" min="<%= hoy %>" value="<%= fechaVal %>" required
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase">
                        Radio: <span id="radioValue" class="text-indigo-600"><%= radioVal %> KM</span>
                    </label>
                    <input type="range" name="radio" id="radioBusqueda" min="0.5" max="10" value="<%= radioVal %>" step="0.5"
                           class="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-indigo-600 mt-4">
                </div>
                <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-md">
                    RECALCULAR
                </button>
            </form>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <div id="map" class="lg:col-span-2 rounded-xl shadow-inner border-2 border-white bg-gray-200"></div>
            
            <aside class="bg-white p-4 rounded-xl shadow-lg flex flex-col border border-gray-200">
                <h3 class="font-bold text-gray-700 border-b pb-2 mb-4 flex justify-between">
                    <span>Habitaciones en la zona</span>
                    <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full" id="count-label">0</span>
                </h3>
                <div id="results-list" class="space-y-4 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                    <p class="text-sm text-gray-500 text-center mt-10">Mueve el mapa o pulsa Buscar para actualizar resultados.</p>
                </div>
            </aside>
        </div>
    </main>

    <script>
        // Actualizar visualmente el valor del radio al mover el slider
        const slider = document.getElementById("radioBusqueda");
        const span = document.getElementById("radioValue");
        slider.addEventListener("input", () => span.textContent = slider.value + " KM");
    </script>
    
    <script src="JavaScript/ubicacion.js"></script>
    <jsp:include page="footer.jsp" />
</body>
</html>