<%-- 
    Document   : MisAlquileres
    Created on : 20 dic 2025, 7:14:56 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List, java.util.Map" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mis alquileres – VitoBadi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/jpeg" href="./Public_icons/VitoBadiIcon.jpg">
    <link rel="stylesheet" href="Css/style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 flex flex-col min-h-screen">

    <jsp:include page="NavBar.jsp" />

    <main class="container mx-auto px-4 my-10 flex-grow">
        <h1 class="text-3xl font-bold text-center text-indigo-800 mb-10">Mis Alquileres</h1>

        <section id="lista-alquileres" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <%
                List<Map<String, String>> alquileres = (List<Map<String, String>>) request.getAttribute("alquileres");
                if (alquileres == null || alquileres.isEmpty()) {
            %>
                <div class="col-span-full text-center py-10">
                    <p class="text-gray-500 text-xl">No tienes alquileres registrados actualmente.</p>
                </div>
            <%
                } else {
                    for (Map<String, String> alq : alquileres) {
            %>
                <article class="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden border border-gray-200"
                         onclick="window.location.href='DetalleAlquilerServlet?id=<%= alq.get("idContrato") %>'">
                    
                    <div class="flex items-center p-4 gap-4">
                        <div class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <img src="<%= alq.get("imagen") %>" class="w-full h-full object-cover" alt="Habitación">
                        </div>

                        <div class="flex-grow">
                            <h3 class="text-lg font-bold text-gray-800"><%= alq.get("direccion") %></h3>
                            <p class="text-sm text-gray-600">
                                <%= alq.get("ciudad") %> · <%= alq.get("precio") %> €/mes
                            </p>
                            <p class="text-xs text-gray-400 mt-1">
                                <%= alq.get("fechaInicio") %> → <%= alq.get("fechaFin") %>
                            </p>
                            <div class="mt-2">
                                <span class="px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-700">
                                    Rol: <%= alq.get("rol") %>
                                </span>
                            </div>
                        </div>
                        
                        <div class="text-gray-300 font-bold text-xl">→</div>
                    </div>
                </article>
            <%
                    }
                }
            %>
        </section>
    </main>

    <jsp:include page="Footer.jsp" />

</body>
</html>