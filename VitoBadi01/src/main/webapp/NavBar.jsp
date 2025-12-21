<%-- 
    Document   : NavBar
    Created on : 20 dic 2025, 7:33:34 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    // Recuperamos los datos de la sesión
    String nombreUsuario = (String) session.getAttribute("nombreUsuario");
    String emailUsuario = (String) session.getAttribute("emailUsuario");
    Boolean esPropietario = (Boolean) session.getAttribute("esPropietario");
    
    // Si esPropietario es null, lo tratamos como false
    boolean propietario = (esPropietario != null && esPropietario);
    boolean logeado = (emailUsuario != null);
%>

<header class="bg-white shadow-md sticky top-0 z-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

            <div class="flex items-center gap-2 cursor-pointer" onclick="window.location.href='index.jsp'">
                <img src="./Public_icons/VitoBadiIcon.jpg" alt="Logo" class="w-10 h-10 rounded-full">
                <h1 class="text-xl font-bold text-indigo-900 hidden sm:block">VitoBadi</h1>
            </div>

            <nav class="hidden md:flex space-x-6 text-gray-700 font-medium">
                
                <div class="relative group py-4">
                    <button class="hover:text-indigo-600">Consultar ▾</button>
                    <div class="absolute left-0 mt-0 hidden group-hover:block bg-white shadow-xl rounded-lg py-2 min-w-[200px] border border-gray-100">
                        <a href="Busqueda.jsp" class="block px-4 py-2 hover:bg-indigo-50">Búsqueda</a>
                        <a href="BusquedaGeolocalizacion.jsp" class="block px-4 py-2 hover:bg-indigo-50">Por Geolocalización</a>
                    </div>
                </div>

                <% if (logeado) { %>
                    <div class="relative group py-4">
                        <button class="hover:text-indigo-600">Habitaciones ▾</button>
                        <div class="absolute left-0 mt-0 hidden group-hover:block bg-white shadow-xl rounded-lg py-2 min-w-[200px] border border-gray-100">
                            <a href="CreateHabitacion.jsp" class="block px-4 py-2 hover:bg-indigo-50">Crear habitación (Alta)</a>
                            <% if (propietario) { %>
                                <a href="MisHabitacionesServlet" class="block px-4 py-2 hover:bg-indigo-50 text-indigo-700 font-semibold">Mis habitaciones</a>
                            <% } %>
                        </div>
                    </div>

                    <div class="relative group py-4">
                        <button class="hover:text-indigo-600">Ver ▾</button>
                        <div class="absolute left-0 mt-0 hidden group-hover:block bg-white shadow-xl rounded-lg py-2 min-w-[200px] border border-gray-100">
                            <a href="MisHospedajesServlet" class="block px-4 py-2 hover:bg-indigo-50">Mis hospedajes</a>
                            <a href="MisSolicitudesInquilinoServlet" class="block px-4 py-2 hover:bg-indigo-50">Mis solicitudes</a>
                        </div>
                    </div>

                    <% if (propietario) { %>
                        <a href="SolicitudesPropietarioServlet" class="py-4 hover:text-indigo-600">Solicitudes Propiedades</a>
                        <a href="MisAlquileresPropietarioServlet" class="py-4 hover:text-indigo-600">Alquileres</a>
                    <% } %>
                <% } %>
            </nav>

            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-500 hidden lg:inline">
                    <%= (logeado) ? "Hola, " + (nombreUsuario != null ? nombreUsuario : emailUsuario) : "" %>
                </span>
                
                <% if (logeado) { %>
                    <a href="PerfilServlet" class="text-xl hover:scale-110 transition" title="Perfil">👤</a>
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