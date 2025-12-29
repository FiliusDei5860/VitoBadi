<%-- 
    Document   : DetalleAlquiler
    Created on : 20 dic 2025, 6:53:51 p.m.
    Author     : Resen
--%>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>VitoBadi - Detalle del Alquiler</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="./Css/style.css">
</head>
<body class="bg-gray-100 font-sans flex flex-col min-h-screen">

    <jsp:include page="NavBar.jsp" />

    <main class="container mx-auto my-10 px-4 max-w-4xl flex-grow">
        
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-indigo-700">Detalle del Contrato</h1>
            <a href="MisAlquileres.jsp" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold transition">
                ← Volver
            </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            
            <div class="space-y-6">
                <div class="rounded-xl overflow-hidden shadow-inner border border-gray-200">
                    <img src="<%= request.getAttribute("imagenUrl") %>" alt="Habitación" class="w-full h-64 object-cover">
                </div>
                
                <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <h2 class="text-lg font-bold text-indigo-800 mb-3 uppercase tracking-wider">Ubicación</h2>
                    <p class="text-gray-700 mb-2"><strong>Dirección:</strong> <%= request.getAttribute("direccion") %></p>
                    <p class="text-gray-700"><strong>Ciudad:</strong> <%= request.getAttribute("ciudad") %></p>
                </div>
            </div>

            <div class="space-y-6">
                <div class="bg-green-50 p-6 rounded-xl border border-green-100">
                    <h2 class="text-lg font-bold text-green-800 mb-3 uppercase tracking-wider">Condiciones</h2>
                    <p class="text-2xl font-bold text-gray-800 mb-4"><%= request.getAttribute("precio") %> €/mes</p>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-gray-500 uppercase font-semibold">Desde</p>
                            <p class="text-gray-800 font-medium"><%= request.getAttribute("fechaInicio") %></p>
                        </div>
                        <div>
                            <p class="text-gray-500 uppercase font-semibold">Hasta</p>
                            <p class="text-gray-800 font-medium"><%= request.getAttribute("fechaFin") %></p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span>👤</span> Datos del Inquilino
                    </h2>
                    <p class="text-gray-700"><strong>Nombre:</strong> <%= request.getAttribute("nombreInquilino") %></p>
                    <p class="text-gray-700"><strong>Email:</strong> 
                        <a href="mailto:<%= request.getAttribute("emailInquilino") %>" class="text-indigo-600 hover:underline">
                            <%= request.getAttribute("emailInquilino") %>
                        </a>
                    </p>
                </div>

                <button onclick="window.print()" class="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition">
                    🖨️ Descargar Contrato en PDF
                </button>
            </div>
        </div>
    </main>

    <jsp:include page="Footer.jsp" />

</body>
</html>