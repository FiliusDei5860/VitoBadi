<%-- 
    Document   : mis_habitaciones
    Created on : 19 dic 2025, 3:00:21 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%-- Asumiendo que tienes una clase Habitacion y un DAO para obtenerlas --%>
<%
    String emailUsuario = (String) session.getAttribute("emailUsuario");
    
    // Redirección de seguridad si no está logueado
    if (emailUsuario == null) {
        response.sendRedirect("Login.jsp");
        return;
    }

    // Aquí normalmente llamarías a tu Base de Datos. Ejemplo:
    // List<Habitacion> misHabitaciones = HabitacionDAO.listarPorPropietario(emailUsuario);
%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%-- Importa aquí tu clase de Habitacion para que el casting funcione --%>
<%-- <%@ page import="modelos.Habitacion" %> --%>

<%
    // Recuperamos el nombre del usuario de la sesión para el saludo
    String nombre = (String) session.getAttribute("nombreUsuario");
    String emailUsuario = (String) session.getAttribute("emailUsuario");

    // Seguridad: Si no hay sesión, redirigir al login
    if (emailUsuario == null) {
        response.sendRedirect("Login.jsp");
        return;
    }

    // Recuperamos la lista que el MisHabitacionesServlet puso en el request
    // Nota: Usamos un casting (List<Object>) si aún no has definido la clase Habitacion
    List<?> lista = (List<?>) request.getAttribute("misHabitaciones");
%>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis habitaciones – VitoBadi</title>

    <link rel="icon" type="image/jpeg" href="./Public_icons/VitoBadiIcon.jpg">

    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="Css/style.css">
</head>

<body class="bg-gray-100 flex flex-col min-h-screen">
    <jsp:include page="navbar.jsp" />

    <header class="bg-white shadow p-4 flex justify-between items-center px-8">
        <h1 class="text-xl font-bold text-indigo-700">VitoBadi</h1>
        <nav class="flex gap-6 items-center">
            <a href="Home.jsp" class="text-gray-600 hover:text-indigo-600">Inicio</a>
            <a href="Ubicacion.jsp" class="text-gray-600 hover:text-indigo-600">Mapa</a>
            <div class="flex items-center gap-2 border-l pl-6">
                <span class="font-medium text-gray-700">Hola, <%= (nombre != null) ? nombre : "Usuario" %></span>
                <a href="LogoutServlet" class="text-red-500 text-sm font-bold">Cerrar sesión</a>
            </div>
        </nav>
    </header>

    <main class="container mx-auto px-4 my-10 flex-grow max-w-5xl">

        <h1 class="text-4xl font-extrabold text-center text-gray-800 mb-2">Mis Habitaciones</h1>
        <p class="text-center text-gray-500 mb-8">Gestiona las publicaciones que has creado como propietario.</p>

        <div class="text-center mt-6">
            <a href="CreateHabitacion.jsp" class="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg">
                <span class="mr-2">➕</span> Añadir nueva habitación
            </a>
        </div>

        <section class="mt-12 space-y-6">
            
            <%
                if (lista == null || lista.isEmpty()) {
            %>
                <div class="bg-white p-12 rounded-xl shadow-inner text-center border-2 border-dashed border-gray-300">
                    <p class="text-xl text-gray-400 italic">No tienes habitaciones publicadas todavía.</p>
                    <p class="text-gray-400 text-sm mt-2">¡Anímate a publicar tu primera habitación!</p>
                </div>
            <%
                } else {
                    // Iteramos sobre la lista de habitaciones
                    for (Object obj : lista) {
                        // Aquí deberías castear: Habitacion h = (Habitacion) obj;
                        // Para este ejemplo, simulamos acceso a métodos genéricos o propiedades
            %>
                <article class="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6 border border-transparent hover:border-indigo-300 transition-all">
                    
                    <div class="flex items-center gap-6 w-full">
                        <div class="w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden border">
                            <%-- <img src="<%= h.getImagen() %>" class="w-full h-full object-cover" alt="Habitación"> --%>
                            <div class="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-300 text-3xl font-bold">
                                🏠
                            </div>
                        </div>

                        <div class="flex-grow">
                            <h3 class="text-2xl font-bold text-gray-800">Ejemplo de Habitación</h3>
                            <%-- <h3 class="text-2xl font-bold text-gray-800"><%= h.getTitulo() %></h3> --%>
                            
                            <div class="flex flex-wrap gap-y-1 gap-x-4 mt-2 text-gray-600">
                                <span class="flex items-center">📍 Vitoria-Gasteiz</span>
                                <span class="flex items-center">💰 450 €/mes</span>
                                <span class="flex items-center">📏 18 m²</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3 w-full md:w-auto">
                        <a href="DetalleHabitacion.jsp?id=123" 
                           class="flex-1 md:flex-none text-center bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition">
                            Ver detalle
                        </a>
                        <a href="ActualizarHabitacion.jsp?id=123" 
                           class="flex-1 md:flex-none text-center bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md">
                            Editar
                        </a>
                    </div>

                </article>
            <%
                    } // Fin del bucle for
                } // Fin del else
            %>

        </section>

    </main>

    <jsp:include page="footer.jsp" />

</body>
</html>