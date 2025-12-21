<%-- 
    Document   : MisAlquileresPropietario
    Created on : 20 dic 2025, 7:19:50 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List, java.util.Map" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mis alquileres (Propietario) – VitoBadi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/jpeg" href="./Public_icons/VitoBadiIcon.jpg">
    <link rel="stylesheet" href="Css/style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 flex flex-col min-h-screen">

    <jsp:include page="navbar.jsp" />

    <main class="container mx-auto px-4 my-10 flex-grow">
        <h1 class="text-3xl font-extrabold text-center text-indigo-900 mb-10">Mis Alquileres de Propiedades</h1>

        <section id="lista-alquileres" class="max-w-4xl mx-auto space-y-4">
            <%
                List<Map<String, String>> lista = (List<Map<String, String>>) request.getAttribute("listaAlquileres");
                if (lista == null || lista.isEmpty()) {
            %>
                <div class="bg-white p-10 rounded-xl shadow text-center">
                    <p class="text-gray-500">No tienes inquilinos en tus habitaciones actualmente.</p>
                </div>
            <%
                } else {
                    for (Map<String, String> alq : lista) {
            %>
                <article class="bg-white rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 overflow-hidden cursor-pointer"
                         onclick="window.location.href='DetalleAlquilerServlet?id=<%= alq.get("idContrato") %>'">
                    
                    <div class="flex flex-col sm:flex-row items-center p-4 gap-6">
                        <div class="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                            <img src="<%= alq.get("imagen") %>" class="w-full h-full object-cover" alt="Habitación">
                        </div>

                        <div class="flex-grow text-center sm:text-left">
                            <h3 class="text-xl font-bold text-gray-800"><%= alq.get("direccion") %></h3>
                            <p class="text-indigo-600 font-medium"><%= alq.get("ciudad") %> · <%= alq.get("precio") %> €/mes</p>
                            
                            <p class="text-sm text-gray-500 mt-2">
                                <strong>Inquilino:</strong> <%= alq.get("inquilino") %>
                            </p>
                            
                            <div class="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-xs text-gray-400">
                                <span>📅 <%= alq.get("fechaInicio") %> al <%= alq.get("fechaFin") %></span>
                                <span class="px-2 py-0.5 rounded-full <%= alq.get("estado").equals("Activo") ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600" %>">
                                    <%= alq.get("estado") %>
                                </span>
                            </div>
                        </div>

                        <div class="hidden sm:block text-indigo-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </article>
            <%
                    }
                }
            %>
        </section>
    </main>

    <jsp:include page="footer.jsp" />

</body>
</html>