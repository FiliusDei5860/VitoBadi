<%-- 
    Document   : DetalleSolicitudPropietario
    Created on : 20 dic 2025, 7:06:11 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Detalle de solicitud – VitoBadi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/jpeg" href="./Public_icons/VitoBadiIcon.jpg">
    <link rel="stylesheet" href="Css/style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 flex flex-col min-h-screen">

    <jsp:include page="navbar.jsp" />

    <main class="container mx-auto my-10 px-4 max-w-4xl flex-grow">
        
        <button onclick="history.back()" class="bg-white border px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 mb-6 transition">
            ← Volver
        </button>

        <h1 class="text-3xl font-bold text-indigo-800 mb-8">Solicitud de <%= request.getAttribute("nombreInquilino") %></h1>

        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div class="flex flex-col md:flex-row">
                
                <div class="p-8 md:w-2/3 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-xs font-bold text-gray-400 uppercase">Habitación</p>
                            <p class="text-gray-800 font-semibold"><%= request.getAttribute("tituloHabitacion") %></p>
                            <p class="text-sm text-gray-500"><%= request.getAttribute("direccion") %>, <%= request.getAttribute("ciudad") %></p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-gray-400 uppercase">Precio Propuesto</p>
                            <p class="text-xl font-bold text-indigo-600"><%= request.getAttribute("precio") %> €/mes</p>
                        </div>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p class="text-xs font-bold text-gray-400 uppercase mb-2">Mensaje del Inquilino</p>
                        <p class="text-gray-700 italic">"<%= request.getAttribute("mensaje") %>"</p>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                            Estado: <%= request.getAttribute("estado") %>
                        </span>
                        <p class="text-sm text-gray-500">
                            Rango: <strong><%= request.getAttribute("fechaInicio") %></strong> al <strong><%= request.getAttribute("fechaFin") %></strong>
                        </p>
                    </div>

                    <form action="DetalleSolicitudPropietarioServlet" method="POST" class="flex gap-4 pt-4">
                        <input type="hidden" name="idSolicitud" value="<%= request.getAttribute("idSolicitud") %>">
                        
                        <button type="submit" name="accion" value="aceptar" 
                                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
                            Aceptar y Crear Contrato
                        </button>
                        
                        <button type="submit" name="accion" value="rechazar" 
                                class="flex-1 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold py-3 rounded-xl transition">
                            Rechazar Solicitud
                        </button>
                    </form>
                </div>

                <div class="md:w-1/3 h-64 md:h-auto bg-gray-200">
                    <img src="<%= request.getAttribute("imagenUrl") %>" class="w-full h-full object-cover" alt="Habitación">
                </div>
            </div>
        </div>
    </main>

    <jsp:include page="footer.jsp" />

</body>
</html>