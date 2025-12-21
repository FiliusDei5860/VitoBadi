<%-- 
    Document   : MisSolicitudesInquilino
    Created on : 20 dic 2025, 7:29:12 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List, java.util.Map" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mis solicitudes – Inquilino</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/jpeg" href="./Public_icons/VitoBadiIcon.jpg">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="Css/style.css">
</head>

<body class="bg-gray-100 flex flex-col min-h-screen">

    <jsp:include page="navbar.jsp" />

    <main class="container mx-auto my-10 px-4 flex-grow max-w-5xl">
        <h1 class="text-3xl font-bold text-center text-indigo-800 mb-2">Mis Solicitudes</h1>
        <p class="text-center text-gray-500 mb-8">Solicitudes que has realizado como inquilino.</p>

        <section id="lista-solicitudes-inq" class="grid grid-cols-1 gap-6">
            <%
                List<Map<String, String>> lista = (List<Map<String, String>>) request.getAttribute("listaSolicitudes");
                if (lista == null || lista.isEmpty()) {
            %>
                <p class="text-center text-gray-500 py-10 bg-white rounded-xl shadow">
                    No tienes solicitudes realizadas actualmente.
                </p>
            <%
                } else {
                    for (Map<String, String> sol : lista) {
            %>
                <article class="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row items-center gap-6 border border-gray-100">
                    
                    <div class="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <img src="<%= sol.get("imagen") %>" class="w-full h-full object-cover">
                    </div>

                    <div class="flex-grow">
                        <h3 class="text-xl font-bold text-gray-800"><%= sol.get("direccion") %></h3>
                        <p class="text-sm text-gray-600"><%= sol.get("ciudad") %> · <%= sol.get("precio") %> €/mes</p>
                        
                        <div class="mt-2 flex items-center gap-4">
                            <span class="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700 uppercase">
                                <%= sol.get("estado") %>
                            </span>
                            <span class="text-xs text-gray-400 italic">
                                Enviada el: <%= sol.get("fechaSolicitud") %>
                            </span>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 w-full md:w-auto">
                        <a href="DetalleHabitacionServlet?id=<%= sol.get("idHabitacion") %>" 
                           class="bg-indigo-600 text-white text-center px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
                            Ver habitación
                        </a>
                        
                        <form action="MisSolicitudesInquilinoServlet" method="POST" onsubmit="return confirm('¿Seguro que quieres cancelar esta solicitud?');">
                            <input type="hidden" name="idSolicitud" value="<%= sol.get("idSolicitud") %>">
                            <button type="submit" 
                                    class="w-full border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition">
                                Cancelar solicitud
                            </button>
                        </form>
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