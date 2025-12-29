<%-- 
    Document   : ListaHabitaciones
    Created on : 19 dic 2025, 8:55:52 a.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.sql.*, utils.DB" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Resultados - VitoBadi</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .blur-sm { filter: blur(4px); }
        .blur-md { filter: blur(12px); }
    </style>
</head>
<body class="bg-gray-100 p-8">
    <jsp:include page="NavBar.jsp" />

<%
    Connection conn = DB.getConexion();
    String ciudad = request.getParameter("ciudad");
    String fInicio = request.getParameter("fechaInicio");
    String fFin = request.getParameter("fechaFin");
    String idSeleccionado = request.getParameter("idHabitacion");
    
    // 1. Verificar si el usuario está logueado
    String emailLogueado = (String) session.getAttribute("emailUsuario");
    boolean esAnonimo = (emailLogueado == null);

    // Consulta con el nombre de tabla y columna correcto: puntuacion y puntos
    StringBuilder sqlBase = new StringBuilder("SELECT h.*, ");
    sqlBase.append("(SELECT AVG(puntos) FROM puntuacion p WHERE p.codHabi = h.codHabi) as puntuacionMedia ");
    sqlBase.append("FROM habitacion h WHERE 1=1");
    
    if(emailLogueado != null) sqlBase.append(" AND h.emailPropietario != ?");
    if(ciudad != null && !ciudad.isEmpty()) sqlBase.append(" AND h.ciudad = ?");
    
    if(fInicio != null && !fInicio.isEmpty() && fFin != null && !fFin.isEmpty()) {
        sqlBase.append(" AND h.codHabi NOT IN (SELECT a.codHabi FROM alquiler a ")
              .append("WHERE ? < a.fechaFinAlqui AND ? > a.fechaInicioAlqui)");
    }

    PreparedStatement psPrincipal = conn.prepareStatement(sqlBase.toString());
    int idx = 1;
    if(emailLogueado != null) psPrincipal.setString(idx++, emailLogueado);
    if(ciudad != null && !ciudad.isEmpty()) psPrincipal.setString(idx++, ciudad);
    if(fInicio != null && !fInicio.isEmpty() && fFin != null && !fFin.isEmpty()) {
        psPrincipal.setString(idx++, fInicio);
        psPrincipal.setString(idx++, fFin);
    }

    ResultSet rs = psPrincipal.executeQuery();
%>

    <div class="max-w-7xl mx-auto">
        <div class="mb-6">
            <a href="Busqueda.jsp" class="text-indigo-600 hover:underline">← Volver a la búsqueda</a>
            <h2 class="text-2xl font-bold mt-2 text-indigo-900">
                Resultados en <%= (ciudad == null || ciudad.isEmpty()) ? "Todas las ciudades" : ciudad %>
            </h2>
            <% if(esAnonimo) { %>
                <p class="text-sm text-amber-600 font-medium">⚠️ Modo anónimo: Inicia sesión para ver detalles completos y solicitar.</p>
            <% } %>
        </div>

        <div class="grid grid-cols-3 gap-8">
            <%-- LISTA IZQUIERDA --%>
            <div class="col-span-1 space-y-4 overflow-y-auto h-screen pr-2">
                <% 
                    boolean hayDatos = false;
                    while(rs.next()) { 
                        hayDatos = true;
                        int idActual = rs.getInt("codHabi");
                        String fotoList = rs.getString("imagenHabitacion");
                        boolean esLaSeleccionada = idSeleccionado != null && idSeleccionado.equals(String.valueOf(idActual));
                %>
                    <div onclick="location.href='ListaHabitaciones.jsp?idHabitacion=<%= idActual %><%= (ciudad!=null?"&ciudad="+ciudad:"") %><%= (fInicio!=null?"&fechaInicio="+fInicio:"") %><%= (fFin!=null?"&fechaFin="+fFin:"") %>'" 
                         class="bg-white p-4 shadow rounded-lg flex items-center gap-4 border-l-4 transition-all cursor-pointer <%= esLaSeleccionada ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200" : "border-indigo-400 hover:bg-gray-50" %>">
                        
                        <img src="<%= (fotoList != null && !fotoList.isEmpty()) ? fotoList : "img/habitaciones/default.jpg" %>" 
                             class="w-16 h-16 object-cover rounded shadow-sm <%= esAnonimo ? "blur-sm" : "" %>"
                             onerror="this.src='img/habitaciones/default.jpg'">

                        <div class="flex-1">
                            <p class="font-bold text-sm text-gray-800"><%= rs.getString("dirección") %></p>
                            <p class="text-xs text-gray-500"><%= rs.getString("ciudad") %></p>
                            <p class="text-indigo-600 font-bold"><%= rs.getDouble("precioMes") %>€/mes</p>
                        </div>
                    </div>
                <% } 
                   if(!hayDatos) { %>
                    <div class="text-center py-10">
                        <p class="text-gray-400 italic">No hay habitaciones libres para esas fechas.</p>
                    </div>
                <% } %>
            </div>

            <%-- PANEL DERECHO (DETALLE) --%>
<div class="col-span-2">
    <div class="bg-white p-8 shadow-xl rounded-xl min-h-[550px] sticky top-8 border border-gray-100">
    <%
    if(idSeleccionado != null && !idSeleccionado.isEmpty()) {
        // Consulta corregida con los nombres de tu tabla (puntuacion/puntos)
        String sqlDetalle = "SELECT h.*, (SELECT AVG(puntos) FROM puntuacion p WHERE p.codHabi = h.codHabi) as puntuacionMedia " +
                            "FROM habitacion h WHERE h.codHabi = ?";
        
        PreparedStatement psDet = conn.prepareStatement(sqlDetalle);
        psDet.setInt(1, Integer.parseInt(idSeleccionado));
        ResultSet rsDet = psDet.executeQuery();
        
        if(rsDet.next()) {
            String fotoDet = rsDet.getString("imagenHabitacion");
            int idActual = rsDet.getInt("codHabi"); // Guardamos el ID
    %>
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-black text-gray-800">Detalles de la Habitación</h2>
                <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold border border-indigo-200">
                    ID: #<%= idActual %>
                </span>
            </div>
            
            <div class="relative group">
                <img src="<%= (fotoDet != null && !fotoDet.isEmpty()) ? fotoDet : "img/habitaciones/default.jpg" %>" 
                     class="w-full h-80 object-cover rounded-xl mb-6 shadow-md border border-gray-100 <%= esAnonimo ? "blur-md" : "" %>"
                     onerror="this.src='img/habitaciones/default.jpg'">
                <% if(esAnonimo) { %>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <a href="Login.jsp" class="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-2xl hover:bg-indigo-700 transition">
                            Logearse para ver fotos
                        </a>
                    </div>
                <% } %>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Ubicación</p>
                    <p class="text-gray-700 font-medium"><%= rsDet.getString("dirección") %>, <%= rsDet.getString("ciudad") %></p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Precio Mensual</p>
                    <p class="text-2xl font-bold text-indigo-600"><%= rsDet.getDouble("precioMes") %> €</p>
                </div>
            </div>

            <%-- DATOS CONDICIONALES --%>
            <div class="border-t border-gray-100 pt-6">
                <% if(esAnonimo) { %>
                    <div class="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center">
                        <p class="text-amber-700 text-sm">
                            Para solicitar la habitación al propietario y ver los detalles completos, 
                            debes de logearte.
                        </p>
                        <a href="Login.jsp" class="text-indigo-600 font-bold text-sm underline mt-2 block italic">¡Únete a nosotros!</a>
                    </div>
                <% } else { %>
                    <div class="grid grid-cols-2 gap-4 mb-8">
                        <div>
                            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Propietario</p>
                            <p class="text-gray-700 font-medium"><%= rsDet.getString("emailPropietario") %></p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Valoración Media</p>
                            <p class="text-yellow-500 font-bold text-xl">
                                ⭐ <%= rsDet.getObject("puntuacionMedia") != null ? String.format("%.1f", rsDet.getDouble("puntuacionMedia")) : "Sin valoraciones" %>
                            </p>
                        </div>
                    </div>
                    
                   <form action="FormularioSolicitud.jsp" method="GET">
    <input type="hidden" name="codHabi" value="<%= idActual %>">
    <input type="hidden" name="fIni" value="<%= fInicio %>">
    <input type="hidden" name="fFin" value="<%= fFin %>">
    
    <button type="submit" class="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition shadow-lg flex items-center justify-center gap-2">
        <span>Solicitar</span>
    </button>
</form>
                <% } %>
            </div>
    <%
            }
            psDet.close();
        } else {
    %>
        <div class="flex flex-col items-center justify-center h-full text-gray-300 py-20 text-center">
            <svg class="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <p class="text-xl font-medium">Selecciona una habitación de la lista para ver los detalles</p>
        </div>
    <% } %>
    </div>
</div>
        </div>
    </div>
    
    <% 
        if(psPrincipal != null) psPrincipal.close();
        if(conn != null) conn.close(); 
    %>
    <jsp:include page="Footer.jsp" />
</body>
</html>