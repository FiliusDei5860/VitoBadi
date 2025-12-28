<%-- 
    Document   : ActualizarHabitacion
    Created on : 20 dic 2025, 6:42:18 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    // Recuperamos los datos con valores por defecto para evitar errores visuales
    Object precioObj = request.getAttribute("precioActual");
    Integer precioActual = (precioObj != null) ? (Integer) precioObj : 0;
    
    Object idObj = request.getAttribute("idHabitacion");
    String idHabitacion = (idObj != null) ? idObj.toString() : request.getParameter("id");
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>VitoBadi - Actualizar Precio</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans">
    <jsp:include page="NavBar.jsp" />

    <main class="container mx-auto my-8 px-4 max-w-2xl">
        <h2 class="text-3xl font-bold text-indigo-700 text-center mb-2">Actualizar Precio</h2>
        
        <form action="ActualizarHabitacionServlet" method="POST" class="bg-white p-8 rounded-xl shadow-md">
            <%-- ID OCULTO: Vital para que el Servlet sepa qué fila actualizar --%>
            <input type="hidden" name="idHabitacion" value="<%= idHabitacion %>">

            <div class="mt-4">
                <label for="precio" class="block text-sm font-medium text-gray-700 mb-1">
                    Precio Mensual (€):
                </label>
                <%-- CAMBIO AQUÍ: step="1" para permitir cualquier precio --%>
                <input type="number" id="precio" name="precio" required min="1" step="1" 
                       value="<%= precioActual %>" 
                       class="w-full border border-gray-300 p-3 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div class="flex justify-end gap-4 mt-8">
                <a href="MisHabitaciones.jsp" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-bold hover:bg-gray-300">
                    Cancelar
                </a>
                <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 shadow-md">
                    Guardar cambios
                </button>
            </div>
        </form>
    </main>
</body>
</html>