<%-- 
    Document   : SolicitudesPropietario
    Created on : 28 dic 2025, 5:13:45 a.m.
    Author     : Resen
--%>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.sql.*, utils.DB" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Solicitudes de Alquiler – Propietario</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="icon" type="image/jpeg" href="Public_icons/VitoBadiIcon.jpg">

    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="Css/style.css">
</head>

<body class="bg-gray-100 flex flex-col min-h-screen">
    
   <%
    Connection conn = DB.getConexion();
    String emailLogueado = (String) session.getAttribute("emailUsuario");
    
    List<Map<String, String>> pendientes = new java.util.ArrayList<>();
    List<Map<String, String>> historial = new java.util.ArrayList<>();

    if (emailLogueado != null) {
        // Consulta para ambas: Pendientes y Procesadas
        String sql = "SELECT s.idSolicitud, s.codHabi, s.emailInquilino, s.estado, s.fechaIniPosibleAlquiler " +
                     "FROM solicitud s " + 
                     "INNER JOIN habitacion h ON s.codHabi = h.codHabi " +
                     "WHERE h.emailPropietario = ?";

        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, emailLogueado);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            Map<String, String> sol = new java.util.HashMap<>();
            String estado = rs.getString("estado");
            
            sol.put("id", rs.getString("idSolicitud"));
            sol.put("habitacion_nombre", "Habitación #" + rs.getString("codHabi"));
            sol.put("inquilino_nombre", rs.getString("emailInquilino"));
            sol.put("fecha", rs.getString("fechaIniPosibleAlquiler"));
            sol.put("estado", estado);

            // Clasificamos en una lista o en otra
            if ("pendiente".equalsIgnoreCase(estado)) {
                pendientes.add(sol);
            } else {
                historial.add(sol);
            }
        }
    }
%>

      <jsp:include page="NavBar.jsp" />
<main class="container mx-auto my-8 px-4 sm:px-6 lg:px-8 max-w-4xl flex-grow">
    
    <h2 class="text-2xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2">Solicitudes Pendientes</h2>
    <section class="space-y-4 mb-12">
        <% if (pendientes.isEmpty()) { %>
            <p class="text-center text-gray-500 italic">No tienes solicitudes nuevas.</p>
        <% } else { 
            for (Map<String, String> sol : pendientes) { %>
            <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold"><%= sol.get("habitacion_nombre") %></h3>
                    <p class="text-sm text-gray-600">Inquilino: <%= sol.get("inquilino_nombre") %></p>
                    <p class="text-xs text-gray-400">Inicio: <%= sol.get("fecha") %></p>
                </div>
                <div class="flex space-x-2">
                    <form action="GestionarSolicitudServlet" method="POST">
                        <input type="hidden" name="idSolicitud" value="<%= sol.get("id") %>">
                        <button name="accion" value="aceptar" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Aceptar</button>
                        <button name="accion" value="rechazar" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Rechazar</button>
                    </form>
                </div>
            </div>
        <% } } %>
    </section>

    <h2 class="text-2xl font-bold mb-4 text-gray-700 border-b-2 border-gray-200 pb-2">Historial de Solicitudes</h2>
    <section class="space-y-4">
        <% if (historial.isEmpty()) { %>
            <p class="text-center text-gray-500 italic">Aún no has procesado ninguna solicitud.</p>
        <% } else { 
            for (Map<String, String> sol : historial) { 
                String colorEstado = sol.get("estado").equalsIgnoreCase("aceptada") ? "text-green-600" : "text-red-600";
        %>
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center opacity-80">
                <div>
                    <h3 class="font-medium text-gray-800"><%= sol.get("habitacion_nombre") %></h3>
                    <p class="text-sm text-gray-500">Inquilino: <%= sol.get("inquilino_nombre") %></p>
                </div>
                <div class="text-right">
                    <span class="font-bold uppercase text-xs px-3 py-1 rounded-full bg-white border <%= colorEstado %>">
                        <%= sol.get("estado") %>
                    </span>
                    <p class="text-[10px] text-gray-400 mt-1">Fecha: <%= sol.get("fecha") %></p>
                </div>
            </div>
        <% } } %>
    </section>

</main>
        <jsp:include page="Footer.jsp" />

</body>
</html>