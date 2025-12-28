<%-- 
    Document   : MisHospedajes
    Created on : 20 dic 2025, 7:24:40 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List, java.util.Map" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mis hospedajes – VitoBadi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/jpeg" href="./Public_icons/VitoBadiIcon.jpg">
    <link rel="stylesheet" href="Css/style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="flex flex-col min-h-screen bg-gray-100">

    <jsp:include page="NavBar.jsp" />

    <main class="flex-grow py-10">
        <div class="container mx-auto px-4 max-w-4xl">
            <h1 class="text-3xl font-bold text-center text-indigo-800 mb-2">Mis hospedajes</h1>
            <p class="text-center text-gray-600 mb-10">
                Aquí ves tus alquileres actuales y pasados como inquilino.
            </p>

            <section id="lista-hospedajes" class="space-y-4">
                <%
                    List<Map<String, String>> hospedajes = (List<Map<String, String>>) request.getAttribute("hospedajes");
                    if (hospedajes == null || hospedajes.isEmpty()) {
                %>
                    <div class="bg-white p-8 rounded-xl shadow text-center">
                        <p class="text-gray-500">No tienes hospedajes registrados.</p>
                        <a href="Busqueda" class="text-indigo-600 hover:underline mt-4 inline-block">
                            ¡Empieza a buscar una habitación!
                        </a>
                    </div>
                <%
                    } else {
                        for (Map<String, String> alq : hospedajes) {
                %>
                    <article class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer"
                             onclick="window.location.href='DetalleAlquilerServlet?id=<%= alq.get("idContrato") %>'">
                        
                        <div class="flex flex-col md:flex-row p-4 gap-6 items-center">
                            <div class="w-full md:w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <img src="<%= alq.get("imagen") %>" class="w-full h-full object-cover" alt="Habitación">
                            </div>

                            <div class="flex-grow">
                                <h3 class="text-xl font-bold text-gray-800 mb-1">
                                    <%= alq.get("titulo") %>
                                </h3>
                                <p class="text-indigo-600 text-sm font-medium mb-3">
                                    <%= alq.get("ciudad") %> · <%= alq.get("precio") %> €/mes
                                </p>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                                    <p><strong>Desde:</strong> <%= alq.get("fechaInicio") %></p>
                                    <p><strong>Hasta:</strong> <%= alq.get("fechaFin") %></p>
                                    <p class="md:col-span-2"><strong>Propietario:</strong> <%= alq.get("propietario") %></p>
                                </div>
                            </div>

                            <div class="text-indigo-400 font-bold hidden md:block">
                                Ver Detalle →
                            </div>
                        </div>
                    </article>
                <%
                        }
                    }
                %>
            </section>
        </div>
    </main>

    <jsp:include page="Footer.jsp" />

</body>
</html>