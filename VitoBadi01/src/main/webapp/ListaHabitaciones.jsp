<%-- 
    Document   : Busqueda
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
</head>
<body class="bg-gray-100 p-8">
    <jsp:include page="navbar.jsp" />

<%
    Connection conn = DB.getConexion();
    String ciudad = request.getParameter("ciudad");
    String fecha = request.getParameter("fecha");
    String idSeleccionado = request.getParameter("idHabitacion");

    // CONSULTA DINÁMICA
    // Seleccionamos habitaciones que coincidan con la ciudad 
    // Y (opcionalmente) que no tengan un contrato vigente en la fecha elegida
    String sql = "SELECT * FROM habitacion h WHERE 1=1";
    
    if(ciudad != null && !ciudad.isEmpty()) {
        sql += " AND h.ciudad = '" + ciudad + "'";
    }
    
    if(fecha != null && !fecha.isEmpty()) {
        // Subconsulta: Habitación NO debe estar en la tabla alquiler en ese rango de fechas
        sql += " AND h.idHabitacion NOT IN (SELECT a.idHabitacion FROM alquiler a " +
               "WHERE '" + fecha + "' BETWEEN a.fechaInicioAlquiler AND a.fechaFinAlquiler)";
    }

    Statement st = conn.createStatement();
    ResultSet rs = st.executeQuery(sql);
%>

    <div class="max-w-7xl mx-auto">
        <div class="mb-6">
            <a href="Busqueda.jsp" class="text-blue-600 hover:underline">← Volver a la búsqueda</a>
            <h2 class="text-2xl font-bold mt-2">Resultados para: <%= (ciudad == null || ciudad.isEmpty()) ? "Todas las ciudades" : ciudad %></h2>
            <% if(fecha != null) { %><p class="text-sm text-gray-500">Disponibilidad a partir de: <%= fecha %></p><% } %>
        </div>

        <div class="grid grid-cols-3 gap-8">
            <div class="col-span-1 space-y-4 overflow-y-auto h-screen">
                <% 
                    boolean hayDatos = false;
                    while(rs.next()) { 
                        hayDatos = true;
                %>
                    <div class="bg-white p-4 shadow rounded-lg flex items-center gap-4 border-l-4 border-blue-500 hover:bg-blue-50 cursor-pointer">
                        <img src="<%= rs.getString("imagen") %>" class="w-16 h-16 object-cover rounded shadow-sm">
                        <div class="flex-1">
                            <p class="font-bold text-sm"><%= rs.getString("direccion") %></p>
                            <p class="text-xs text-gray-500"><%= rs.getString("ciudad") %></p>
                            <p class="text-blue-600 font-bold"><%= rs.getDouble("precio") %>€/mes</p>
                        </div>
                        <a href="ListaHabitaciones.jsp?idHabitacion=<%= rs.getInt("idHabitacion") %>&ciudad=<%= (ciudad!=null?ciudad:"") %>&fecha=<%= (fecha!=null?fecha:"") %>" 
                           class="text-blue-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"></path></svg>
                        </a>
                    </div>
                <% } 
                   if(!hayDatos) { %>
                    <p class="text-gray-500 italic">No se encontraron habitaciones disponibles con esos filtros.</p>
                <% } %>
            </div>

            <div class="col-span-2">
                <div class="bg-white p-8 shadow-xl rounded-xl min-h-[500px]">
                <%
                    if(idSeleccionado != null) {
                        PreparedStatement ps = conn.prepareStatement("SELECT * FROM habitacion WHERE idHabitacion = ?");
                        ps.setInt(1, Integer.parseInt(idSeleccionado));
                        ResultSet rsDet = ps.executeQuery();
                        if(rsDet.next()) {
                %>
                            <h2 class="text-3xl font-black mb-6">Habitación #<%= rsDet.getInt("idHabitacion") %></h2>
                            <img src="<%= rsDet.getString("imagen") %>" class="w-full h-80 object-cover rounded-xl mb-6 shadow-md">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <p class="text-xs font-bold text-gray-400">CIUDAD</p>
                                    <p><%= rsDet.getString("ciudad") %></p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <p class="text-xs font-bold text-gray-400">PRECIO</p>
                                    <p class="text-2xl font-bold text-green-600"><%= rsDet.getDouble("precio") %> €</p>
                                </div>
                            </div>
                            <button class="w-full mt-8 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg">
                                Solicitar ahora para el <%= (fecha != null ? fecha : "hoy") %>
                            </button>
                <%
                        }
                    } else {
                %>
                    <div class="flex items-center justify-center h-full text-gray-300">
                        <p class="text-xl">Selecciona una habitación para ver los detalles</p>
                    </div>
                <% } %>
                </div>
            </div>
        </div>
    </div>
                <jsp:include page="footer.jsp" />
</body>
</html>