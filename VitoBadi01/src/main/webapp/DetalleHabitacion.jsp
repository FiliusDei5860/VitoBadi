<%-- 
    Document   : DetalleHabitacion
    Created on : 20 dic 2025, 7:02:04 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Detalle habitación – VitoBadi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/jpeg" href="./Public_icons/VitoBadiIcon.jpg">
    <link rel="stylesheet" href="Css/style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 flex flex-col min-h-screen">

    <jsp:include page="navbar.jsp" />

    <main class="flex-grow py-10">
        <div class="container mx-auto px-4 max-w-5xl">

            <div class="flex items-center justify-between mb-8">
                <a href="MisHabitacionesServlet" class="bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
                    ← Volver al listado
                </a>
                <h1 class="text-3xl font-extrabold text-indigo-800">Detalle de la Habitación</h1>
            </div>

            <section class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
                
                <div class="p-8 md:w-1/2 space-y-4">
                    <div class="space-y-2">
                        <p class="text-sm text-gray-500 uppercase font-bold tracking-wider">Ubicación</p>
                        <p class="text-xl text-gray-800"><strong>Dirección:</strong> <%= request.getAttribute("direccion") %></p>
                        <p class="text-lg text-gray-700"><strong>Ciudad:</strong> <%= request.getAttribute("ciudad") %></p>
                    </div>

                    <hr class="border-gray-100">

                    <div class="space-y-2">
                        <p class="text-sm text-gray-500 uppercase font-bold tracking-wider">Detalles Económicos</p>
                        <p class="text-2xl font-bold text-indigo-600"><%= request.getAttribute("precio") %></p>
                        <p class="inline-block px-3 py-1 rounded-full text-sm font-semibold 
                            <%= request.getAttribute("estado").equals("Disponible") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700" %>">
                            Estado: <%= request.getAttribute("estado") %>
                        </p>
                    </div>

                    <hr class="border-gray-100">

                    <div class="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <p class="text-xs text-gray-400 uppercase font-bold">Latitud</p>
                            <p class="text-gray-600 font-mono"><%= request.getAttribute("latitud") %></p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400 uppercase font-bold">Longitud</p>
                            <p class="text-gray-600 font-mono"><%= request.getAttribute("longitud") %></p>
                        </div>
                    </div>
                </div>

                <div class="md:w-1/2 relative bg-gray-200 min-h-[300px]">
                    <img src="<%= request.getAttribute("imagenUrl") %>" 
                         alt="Imagen habitación" 
                         class="absolute inset-0 w-full h-full object-cover">
                </div>
            </section>
        </div>
    </main>

    <jsp:include page="footer.jsp" />

</body>
</html>