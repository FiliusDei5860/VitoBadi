<%-- 
    Document   : Login
    Created on : 20 dic 2025, 8:51:04 a.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login - VitoBadi</title>
    <link rel="icon" type="image/png" href="./Public_icons/VitoBadiIcon.jpg">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="./Css/style.css">
</head>
<body class="bg-gray-100 flex flex-col min-h-screen">

    <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4 flex items-center gap-3">
            <a href="index.jsp" class="flex items-center gap-3">
                <img src="./Public_icons/VitoBadiIcon.jpg" class="w-10 h-10 rounded-full" alt="Logo">
                <h1 class="text-2xl font-bold text-blue-900">VitoBadi</h1>
            </a>
        </div>
    </header>

    <main class="container mx-auto my-12 px-4 max-w-lg flex-grow">
        <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Accede a tu cuenta</h1>

            <%-- Mensaje de error dinámico --%>
            <% 
                String error = request.getParameter("error");
                if(error != null) { 
            %>
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm animate-pulse">
                    <%
                        if(error.equals("1")) out.print("Email o contraseña incorrectos.");
                        else out.print("Ocurrió un error inesperado. Inténtalo más tarde.");
                    %>
                </div>
            <% } %>

            <form action="LoginServlet" method="POST" class="space-y-4">
                <div class="flex flex-col">
                    <label class="text-sm font-semibold text-gray-600 mb-1" for="email">Email:</label>
                    <input type="email" name="email" id="email" 
                           class="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                           placeholder="tu@email.com" required>
                </div>

                <div class="flex flex-col">
                    <label class="text-sm font-semibold text-gray-600 mb-1" for="password">Contraseña:</label>
                    <input type="password" name="password" id="password" 
                           class="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                           placeholder="••••••••" required>
                </div>

                <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md mt-4">
                    Entrar
                </button>
            </form>
            
            <div class="mt-8 pt-6 border-t border-gray-100 text-center">
                <p class="text-sm text-gray-500">
                    ¿No tienes cuenta? <a href="Registro.jsp" class="text-blue-600 font-bold hover:underline">Regístrate aquí</a>
                </p>
            </div>
        </div>
    </main>

    <jsp:include page="Footer.jsp" />
</body>
</html>