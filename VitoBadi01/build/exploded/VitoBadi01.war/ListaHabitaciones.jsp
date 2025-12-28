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
</head>
<body class="bg-gray-100 p-8">
    <jsp:include page="NavBar.jsp" />

<%
    Connection conn = DB.getConexion();
    String ciudad = request.getParameter("ciudad");
    String fecha = request.getParameter("fecha");
    String idSeleccionado = request.getParameter("idHabitacion");
    
    // 1. Filtro de Seguridad: Obtener email del usuario logueado
    String emailLogueado = (String) session.getAttribute("emailUsuario");

    // 2. Construcción de CONSULTA DINÁMICA con PreparedStatement
    StringBuilder sqlBase = new StringBuilder("SELECT * FROM habitacion h WHERE 1=1");
    
    if(emailLogueado != null) sqlBase.append(" AND h.emailPropietario != ?");
    if(ciudad != null && !ciudad.isEmpty()) sqlBase.append(" AND h.ciudad = ?");
    if(fecha != null && !fecha.isEmpty()) {
        sqlBase.append(" AND h.codHabi NOT IN (SELECT a.codHabi FROM alquiler a ")
               .append("WHERE ? BETWEEN a.fechaInicioAlqui AND a.fechaFinAlqui)");
    }

    PreparedStatement psPrincipal = conn.prepareStatement(sqlBase.toString());
    int idx = 1;
    if(emailLogueado != null) psPrincipal.setString(idx++, emailLogueado);
    if(ciudad != null && !ciudad.isEmpty()) psPrincipal.setString(idx++, ciudad);
    if(fecha != null && !fecha.isEmpty()) psPrincipal.setString(idx++, fecha);

    ResultSet rs = psPrincipal.executeQuery();
%>

    <div class="max-w-7xl mx-auto">
        <div class="mb-6">
            <a href="Busqueda.jsp" class="text-blue-600 hover:underline">← Volver a la búsqueda</a>
            <h2 class="text-2xl font-bold mt-2">Resultados para: <%= (ciudad == null || ciudad.isEmpty()) ? "Todas las ciudades" : ciudad %></h2>
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
                    <div onclick="location.href='ListaHabitaciones.jsp?idHabitacion=<%= idActual %><%= (ciudad!=null?"&ciudad="+ciudad:"") %><%= (fecha!=null?"&fecha="+fecha:"") %>'" 
                         class="bg-white p-4 shadow rounded-lg flex items-center gap-4 border-l-4 transition-all cursor-pointer <%= esLaSeleccionada ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" : "border-blue-400 hover:bg-gray-50" %>">
                        
                        <%-- FIX IMAGEN: Usamos la ruta de la DB y un onerror por si acaso --%>
                        <img src="<%= (fotoList != null && !fotoList.isEmpty()) ? fotoList : "img/habitaciones/default.jpg" %>" 
                             class="w-16 h-16 object-cover rounded shadow-sm"
                             onerror="this.src='img/habitaciones/default.jpg'">

                        <div class="flex-1">
                            <p class="font-bold text-sm"><%= rs.getString("dirección") %></p>
                            <p class="text-xs text-gray-500"><%= rs.getString("ciudad") %></p>
                            <p class="text-blue-600 font-bold"><%= rs.getDouble("precioMes") %>€/mes</p>
                        </div>
                    </div>
                <% } 
                   if(!hayDatos) { %>
                    <p class="text-gray-500 italic">No se encontraron habitaciones disponibles.</p>
                <% } %>
            </div>

            <%-- PANEL DERECHO (DETALLE) --%>
            <div class="col-span-2">
                <div class="bg-white p-8 shadow-xl rounded-xl min-h-[550px] sticky top-8">
                <%
                    if(idSeleccionado != null && !idSeleccionado.isEmpty()) {
                        PreparedStatement psDet = conn.prepareStatement("SELECT * FROM habitacion WHERE codHabi = ?");
                        psDet.setInt(1, Integer.parseInt(idSeleccionado));
                        ResultSet rsDet = psDet.executeQuery();
                        
                        if(rsDet.next()) {
                            String fotoDet = rsDet.getString("imagenHabitacion");
                %>
                            <h2 class="text-3xl font-black text-gray-800 mb-6">Habitación #<%= rsDet.getInt("codHabi") %></h2>
                            
                            <img src="<%= (fotoDet != null && !fotoDet.isEmpty()) ? fotoDet : "img/habitaciones/default.jpg" %>" 
                                 class="w-full h-80 object-cover rounded-xl mb-6 shadow-md border border-gray-100"
                                 onerror="this.src='img/habitaciones/default.jpg'">
                            
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <p class="text-xs font-bold text-gray-400 uppercase">Ubicación</p>
                                    <p class="text-gray-700"><%= rsDet.getString("dirección") %>, <%= rsDet.getString("ciudad") %></p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <p class="text-xs font-bold text-gray-400 uppercase">Precio</p>
                                    <p class="text-2xl font-bold text-blue-600"><%= rsDet.getDouble("precioMes") %> €</p>
                                </div>
                            </div>

                            <button class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">
                                Solicitar ahora
                            </button>
                <%
                        }
                        psDet.close();
                    } else {
                %>
                    <div class="flex flex-col items-center justify-center h-full text-gray-300 py-20">
                        <p class="text-xl font-medium">Selecciona una tarjeta para ver el detalle</p>
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