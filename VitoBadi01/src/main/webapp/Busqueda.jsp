<%-- 
    Document   : Busqueda
    Created on : 20 dic 2025, 8:55:52 a.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.time.LocalDate" %>
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

    <jsp:include page="navbar.jsp" />

    <main class="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow mb-12">
        <div class="text-center mt-12 mb-10">
            <h1 class="text-4xl font-extrabold text-indigo-900 mb-2">Encuentra tu próximo hogar</h1>
            <p class="text-gray-600">Busca habitaciones disponibles en las mejores ciudades.</p>
        </div>

        <section class="mx-auto p-8 rounded-2xl shadow-xl bg-white max-w-2xl border border-gray-100">
            <form action="BusquedaServlet" method="POST" class="space-y-6">
                
                <div class="form-group">
                    <label for="ciudad" class="block text-sm font-bold text-gray-700 mb-2">¿A dónde quieres ir?</label>
                    <select id="ciudad" name="ciudad" 
                            class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 transition">
                        <option value="">Todas las ciudades</option>
                        <option value="Vitoria-Gasteiz">Vitoria-Gasteiz</option>
                        <option value="Bilbao">Bilbao</option>
                        <option value="Donostia-San Sebastián">Donostia-San Sebastián</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="fecha" class="block text-sm font-bold text-gray-700 mb-2">¿A partir de qué fecha?</label>
                    <%-- Usamos Java para establecer el 'min' y el 'value' al día de hoy --%>
                    <input type="date" id="fecha" name="fecha" 
                           min="<%= LocalDate.now() %>" 
                           value="<%= LocalDate.now() %>" 
                           class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 transition" />
                </div>

                <button type="submit" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-300 shadow-lg transform hover:-translate-y-1">
                    🔍 Buscar habitaciones
                </button>
            </form>
        </section>
    </main>

    <jsp:include page="footer.jsp" />

</body>
</html>