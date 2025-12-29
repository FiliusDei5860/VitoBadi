<%-- 
    Document   : Busqueda
    Created on : 20 dic 2025, 8:55:52 a.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.time.LocalDate" %>
<%
    // Verificamos si hay usuario en sesión
    String emailUsuario = (String) session.getAttribute("emailUsuario");
    boolean esAnonimo = (emailUsuario == null);
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Búsqueda – VitoBadi</title>
    <link rel="icon" type="image/png" href="./Public_icons/VitoBadiIcon.jpg">
    <link rel="stylesheet" href="./Css/style.css" />
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex flex-col">

    <jsp:include page="NavBar.jsp" />

    <main class="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow mb-12">
        <div class="text-center mt-12 mb-10">
            <h1 class="text-4xl font-extrabold text-indigo-900 mb-2">Encuentra tu próximo hogar</h1>
            <p class="text-gray-600">
                <% if (esAnonimo) { %>
                    <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-bold">Modo Anónimo</span>
                    <br>Busca disponibilidad. Identifícate para ver detalles completos.
                <% } else { %>
                    Busca habitaciones disponibles en las mejores ciudades.
                <% } %>
            </p>
        </div>

        <section class="mx-auto p-8 rounded-2xl shadow-xl bg-white max-w-2xl border border-gray-100">
            <form action="BusquedaServlet" method="POST" class="space-y-6">
                
                <div class="form-group">
                    <label for="ciudad" class="block text-sm font-bold text-gray-700 mb-2">¿A dónde quieres ir? *</label>
                    <select id="ciudad" name="ciudad" required
                            class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 transition">
                        <option value="" disabled selected>Selecciona una ciudad</option>
                        <option value="Vitoria-Gasteiz">Vitoria-Gasteiz</option>
                        <option value="Bilbao">Bilbao</option>
                        <option value="Donostia-San Sebastián">Donostia-San Sebastián</option>
                    </select>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="fechaInicio" class="block text-sm font-bold text-gray-700 mb-2">Fecha de entrada *</label>
                        <input type="date" id="fechaInicio" name="fechaInicio" 
                               required
                               min="<%= LocalDate.now() %>" 
                               value="<%= LocalDate.now() %>" 
                               class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 transition" />
                    </div>

                    <div class="form-group">
                        <label for="fechaFin" class="block text-sm font-bold text-gray-700 mb-2">Fecha de salida *</label>
                        <input type="date" id="fechaFin" name="fechaFin" 
                               required
                               min="<%= LocalDate.now().plusDays(1) %>" 
                               class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 transition" />
                    </div>
                </div>

                <button type="submit" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-300 shadow-lg transform hover:-translate-y-1">
                    🔍 Buscar habitaciones libres
                </button>
            </form>
        </section>

        <% if (esAnonimo) { %>
            <div class="mt-8 text-center">
                <p class="text-sm text-gray-500">
                    ¿Ya tienes cuenta? 
                    <a href="Login.jsp" class="text-indigo-600 font-bold hover:underline">Inicia sesión aquí</a> 
                    para ver fotos y contactar propietarios.
                </p>
            </div>
        <% } %>
    </main>

    <jsp:include page="Footer.jsp" />

</body>
</html>