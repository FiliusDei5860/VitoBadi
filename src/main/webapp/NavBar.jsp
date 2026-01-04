<%-- 
    Document   : NavBar
    Created on : 20 dic 2025, 7:33:34 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    // Recuperamos los datos de la sesión
    String nombreUsuario = (String) session.getAttribute("nombreUsuario");
    String emailUsuario  = (String) session.getAttribute("emailUsuario");
    Boolean esPropietarioObj = (Boolean) session.getAttribute("esPropietario");

    // IMPORTANTE:
    // En tu proyecto a veces se guardó como "fotoUsuario" y ahora quieres "imagenUsuario".
    // Soportamos los dos para que funcione sí o sí.
    String imagenUsuario = (String) session.getAttribute("imagenUsuario");
    if (imagenUsuario == null || imagenUsuario.trim().isEmpty()) {
        imagenUsuario = (String) session.getAttribute("fotoUsuario");
    }

    boolean propietario = (esPropietarioObj != null && esPropietarioObj);
    boolean logeado = (emailUsuario != null);

    // Construir URL final para la imagen:
    // - Si viene "img/usuarios/andoni.png" => /TU_CONTEXTO/img/usuarios/andoni.png
    // - Si viene "/img/usuarios/andoni.png" => /TU_CONTEXTO/img/usuarios/andoni.png
    // - Si viene "http..." => se deja tal cual
    String fotoNav = null;
    if (imagenUsuario != null && !imagenUsuario.trim().isEmpty()) {
        String img = imagenUsuario.trim();
        if (img.startsWith("http://") || img.startsWith("https://")) {
            fotoNav = img;
        } else {
            if (img.startsWith("/")) img = img.substring(1);
            fotoNav = request.getContextPath() + "/" + img;
        }
    } else {
        // No tenéis default.png, así que usamos algo que sí existe (logo)
        fotoNav = request.getContextPath() + "/Public_icons/VitoBadiIcon.jpg";
    }
%>

<header class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

            <div class="flex items-center gap-2 cursor-pointer" onclick="window.location.href='Busqueda.jsp'">
                <img src="<%= request.getContextPath() %>/Public_icons/VitoBadiIcon.jpg" alt="Logo" class="w-10 h-10 rounded-full">
                <h1 class="text-xl font-bold text-indigo-900 hidden sm:block">VitoBadi</h1>
            </div>

            <nav class="hidden md:flex items-center gap-6 text-gray-700 font-medium">

                <!-- CONSULTAR (BÚSQUEDAS) -->
                <div class="relative group py-4">
                    <button class="hover:text-indigo-600">Consultar ▾</button>
                    <div class="absolute left-0 mt-0 hidden group-hover:block bg-white shadow-xl rounded-lg py-2 min-w-[220px] border border-gray-100">
                        <a href="Busqueda.jsp" class="block px-4 py-2 hover:bg-indigo-50">Búsqueda</a>
                        <a href="BusquedaGeolocalizacion" class="block px-4 py-2 hover:bg-indigo-50">Por Geolocalización</a>
                    </div>
                </div>

                <% if (logeado) { %>

                    <!-- HABITACIONES -->
                    <div class="relative group py-4">
                        <button class="hover:text-indigo-600">Habitaciones ▾</button>
                        <div class="absolute left-0 mt-0 hidden group-hover:block bg-white shadow-xl rounded-lg py-2 min-w-[240px] border border-gray-100">
                            <a href="CreateHabitacion.jsp" class="block px-4 py-2 hover:bg-indigo-50">Crear habitación (Alta)</a>
                            <% if (propietario) { %>
                                <a href="MisHabitaciones.jsp" class="block px-4 py-2 hover:bg-indigo-50 text-indigo-700 font-semibold">Mis habitaciones</a>
                            <% } %>
                        </div>
                    </div>

                    <!-- INQUILINO -->
                    <div class="relative group py-4">
                        <button class="hover:text-indigo-600">Inquilino ▾</button>
                        <div class="absolute left-0 mt-0 hidden group-hover:block bg-white shadow-xl rounded-lg py-2 min-w-[240px] border border-gray-100">
                            <a href="MisSolicitudesInquilinoServlet" class="block px-4 py-2 hover:bg-indigo-50">Ver mis solicitudes</a>
                            <a href="MisHospedajesServlet" class="block px-4 py-2 hover:bg-indigo-50">Ver mis alquileres</a>
                        </div>
                    </div>

                    <!-- PROPIETARIO -->
                    <% if (propietario) { %>
                        <div class="relative group py-4">
                            <button class="hover:text-indigo-600">Propietario ▾</button>
                            <div class="absolute left-0 mt-0 hidden group-hover:block bg-white shadow-xl rounded-lg py-2 min-w-[280px] border border-gray-100">
                                <a href="SolicitudesPropietario.jsp" class="block px-4 py-2 hover:bg-indigo-50">Ver solicitudes por mis habitaciones</a>
                                <a href="MisAlquileresPropietario.jsp" class="block px-4 py-2 hover:bg-indigo-50">Ver alquileres por mis habitaciones</a>
                            </div>
                        </div>
                    <% } %>

                <% } %>
            </nav>

            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-500 hidden lg:inline">
                    <%= (logeado) ? "Hola, " + (nombreUsuario != null ? nombreUsuario : emailUsuario) : "" %>
                </span>

                <% if (logeado) { %>
                    <!-- FOTO PERFIL (en vez del icono 👤) -->
                    <a href="PerfilServlet" class="flex items-center gap-2" title="Perfil">
                        <img src="<%= fotoNav %>"
                             alt="Perfil"
                             class="w-9 h-9 rounded-full object-cover border border-gray-200">
                    </a>

                    <a href="LogoutServlet" class="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition">
                        Salir
                    </a>
                <% } else { %>
                    <a href="Login.jsp" class="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
                        Login
                    </a>
                <% } %>
            </div>
        </div>
    </div>
</header>