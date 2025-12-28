 <%-- 

    Document   : Geolocalizacion
    Created on : 20 dic 2025, 9:16:13 a.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.sql.*, utils.DB" %>
<%
    // 1. Parámetros de búsqueda
    String latVal = (request.getParameter("lat") != null) ? request.getParameter("lat") : "42.8467"; 
    String lngVal = (request.getParameter("lng") != null) ? request.getParameter("lng") : "-2.6716";
    String idSeleccionado = request.getParameter("idHabitacion");

    // Usamos tu conexión
    Connection conn = DB.getConexion();
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Explorar - VitoBadi</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        #map { height: 400px; width: 100%; border-radius: 0.75rem; background: #e5e7eb; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4F46E5; border-radius: 10px; }
    </style>
</head>
<body class="bg-gray-100 flex flex-col min-h-screen">
    
    <jsp:include page="NavBar.jsp" />

    <main class="container mx-auto my-8 px-4 max-w-7xl flex-grow">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div class="col-span-1 space-y-4 overflow-y-auto h-screen pr-2 custom-scrollbar">
                <h3 class="font-bold text-gray-700 border-b pb-2 mb-4">Habitaciones Disponibles</h3>
                <%
                    String sql = "SELECT * FROM habitacion";
                    Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery(sql);
                    boolean hayDatos = false;

                    while(rs.next()) {
                        hayDatos = true;
                        int idActual = rs.getInt("codHabi");
                        boolean esLaSeleccionada = idSeleccionado != null && idSeleccionado.equals(String.valueOf(idActual));
                %>
                        <div onclick="location.href='Geolocalizacion.jsp?idHabitacion=<%= idActual %>&lat=<%= latVal %>&lng=<%= lngVal %>'" 
                             class="bg-white p-4 shadow rounded-lg flex items-center gap-4 border-l-4 transition-all cursor-pointer <%= esLaSeleccionada ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" : "border-blue-400 hover:bg-gray-50" %>">
                            <img src="<%= rs.getString("imagenHabitacion") %>" class="w-16 h-16 object-cover rounded shadow-sm">
                            <div class="flex-1">
                                <p class="font-bold text-sm"><%= rs.getString("dirección") %></p>
                                <p class="text-xs text-gray-500"><%= rs.getString("ciudad") %></p>
                                <p class="text-blue-600 font-bold"><%= rs.getDouble("precioMes") %>€/mes</p>
                            </div>
                        </div>
                <% 
                    } 
                    if(!hayDatos) { %>
                        <p class="text-gray-500 italic">No hay habitaciones disponibles.</p>
                <%  } 
                    rs.close();
                    st.close();
                %>
            </div>

            <div class="col-span-2">
                <div class="bg-white p-8 shadow-xl rounded-xl min-h-[600px] sticky top-8">
                <%
                    if(idSeleccionado != null && !idSeleccionado.isEmpty()) {
                        PreparedStatement ps = conn.prepareStatement("SELECT * FROM habitacion WHERE codHabi = ?");
                        ps.setInt(1, Integer.parseInt(idSeleccionado));
                        ResultSet rsDet = ps.executeQuery();
                        
                        if(rsDet.next()) {
                %>
                            <h2 class="text-3xl font-black text-gray-800 mb-6">Detalle de Habitación</h2>
                            
                            <div id="map" class="mb-6 border-2 border-white shadow-md"></div>

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

                            <img src="<%= rsDet.getString("imagenHabitacion") %>" class="w-full h-64 object-cover rounded-xl mb-6 shadow-md">

                            <button class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition uppercase">
                                Reservar Habitación
                            </button>

                            <script>
                                function initMap() {
                                    const pos = { 
                                        lat: <%= rsDet.getDouble("latitudH") %>, 
                                        lng: <%= rsDet.getDouble("longitud") %> 
                                    };
                                    const map = new google.maps.Map(document.getElementById("map"), {
                                        zoom: 17,
                                        center: pos,
                                        disableDefaultUI: true
                                    });
                                    new google.maps.Marker({ position: pos, map: map });
                                }
                            </script>
                <%
                        }
                        ps.close();
                    } else {
                %>
                        <div class="flex flex-col items-center justify-center h-full text-gray-300 py-40">
                            <p class="text-xl font-medium">Selecciona una habitación para ver el mapa</p>
                        </div>
                <%  } %>
                </div>
            </div>
        </div>
    </main>

    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB7fLImOI_55rqllm20r_JpgNHDElD43wQ&callback=initMap" async defer></script>
    <jsp:include page="Footer.jsp" />
</body>
</html>