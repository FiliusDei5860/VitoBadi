<%-- 
    Document   : ActualizarHabitacion
    Created on : 20 dic 2025, 6:42:18 p.m.
    Author     : Resen
--%>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    // Recuperamos los datos que el Servlet nos pasó
    Integer precioActual = (Integer) request.getAttribute("precioActual");
    String idHabitacion = (String) request.getAttribute("idHabitacion");

    // Si alguien entra al JSP directo sin pasar por el Servlet, lo devolvemos
    if (idHabitacion == null) {
        response.sendRedirect("MisHabitacionesServlet");
        return;
    }
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VitoBadi - Actualizar Precio de Habitación</title>
    <link rel="stylesheet" href="./Css/style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 font-sans">

    <jsp:include page="navbar.jsp" />

    <main class="container mx-auto my-8 px-4 max-w-2xl">
        <h2 class="text-3xl font-bold text-indigo-700 text-center mb-2">Actualizar Precio</h2>
        <p class="text-center text-gray-600 mb-6">
            Solo puedes modificar el precio mensual de la habitación.
        </p>

        <%-- Formulario apuntando al Servlet por POST --%>
        <form action="ActualizarHabitacionServlet" method="POST" class="bg-white p-8 rounded-xl shadow-md">
            
            <%-- Campo oculto para saber qué ID estamos editando --%>
            <input type="hidden" name="idHabitacion" value="<%= idHabitacion %>">

            <fieldset class="border-t border-gray-200 pt-4">
                <legend class="text-lg font-semibold text-gray-700 px-2">Precio mensual</legend>

                <div class="mt-4">
                    <label for="precio" class="block text-sm font-medium text-gray-700 mb-1">
                        Precio Mensual (€):
                    </label>
                    <input
                        type="number"
                        id="precio"
                        name="precio"
                        required
                        min="1"
                        step="10"
                        value="<%= precioActual %>"
                        class="w-full border border-gray-300 p-3 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                </div>
            </fieldset>

            <div class="flex justify-end gap-4 mt-8">
                <a href="MisHabitacionesServlet" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-bold hover:bg-gray-300">
                    Cancelar y volver
                </a>
                <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 shadow-md">
                    Guardar cambios
                </button>
            </div>
        </form>
    </main>

    <jsp:include page="footer.jsp" />
    

</body>
</html>