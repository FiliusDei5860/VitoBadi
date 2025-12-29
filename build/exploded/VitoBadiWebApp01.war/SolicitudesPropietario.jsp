<%-- 
    Document   : SolicitudesPropietario
    Created on : 28 dic 2025, 5:13:45 a.m.
    Author     : Resen
--%>
<%@ page import="java.util.*" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.sql.*, utils.DB" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Alquileres – VitoBadi</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex flex-col min-h-screen">
    <jsp:include page="NavBar.jsp" />

    <%
        String emailLogueado = (String) session.getAttribute("emailUsuario");
        if (emailLogueado == null) { response.sendRedirect("Login.jsp"); return; }

        Connection conn = DB.getConexion();
        
        // Consulta para obtener las HABITACIONES del propietario
        String sqlHabis = "SELECT * FROM habitacion WHERE emailPropietario = ?";
        PreparedStatement psHabis = conn.prepareStatement(sqlHabis);
        psHabis.setString(1, emailLogueado);
        ResultSet rsHabis = psHabis.executeQuery();
    %>

    <main class="container mx-auto my-8 px-4 max-w-5xl flex-grow">
        <h2 class="text-3xl font-black text-indigo-900 mb-8">Gestión de mis Habitaciones</h2>

        <div class="space-y-8">
            <% while (rsHabis.next()) { 
                int codHabi = rsHabis.getInt("codHabi");
                String foto = rsHabis.getString("imagenHabitacion");
            %>
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="md:flex items-center p-4 bg-white">
                        <img src="<%= (foto != null) ? foto : "img/habitaciones/default.jpg" %>" 
                             class="w-full md:w-32 h-32 object-cover rounded-2xl shadow-inner">
                        
                        <div class="p-4 flex-grow">
                            <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Código: #<%= codHabi %></span>
                            <h3 class="text-xl font-bold text-gray-800"><%= rsHabis.getString("dirección") %></h3>
                            <p class="text-indigo-600 font-bold"><%= rsHabis.getDouble("precioMes") %> €/mes</p>
                        </div>
                        
                        <div class="p-4">
                            <button onclick="toggleInquilinos(<%= codHabi %>)" 
                                    class="w-full md:w-auto bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-100 transition border border-indigo-100">
                                Ver posibles inquilinos
                            </button>
                        </div>
                    </div>

                    <div id="inquilinos-<%= codHabi %>" class="hidden border-t border-gray-50 bg-gray-50/50 p-6">
                        <h4 class="text-sm font-black text-gray-400 uppercase tracking-tighter mb-4">Solicitudes recibidas</h4>
                        
                        <div class="grid gap-4">
                        <%
                            // Consulta de SOLICITUDES para ESTA habitación específica
                            String sqlSols = "SELECT * FROM solicitud WHERE codHabi = ? AND estado = 'pendiente'";
                            PreparedStatement psSols = conn.prepareStatement(sqlSols);
                            psSols.setInt(1, codHabi);
                            ResultSet rsSols = psSols.executeQuery();
                            
                            boolean tieneSols = false;
                            while (rsSols.next()) {
                                tieneSols = true;
                        %>
                            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center">
                                <div>
                                    <p class="font-bold text-gray-700"><%= rsSols.getString("emailInquilino") %></p>
                                    <div class="flex gap-4 mt-1">
                                        <p class="text-xs text-gray-400">Desde: <span class="text-gray-600 font-medium"><%= rsSols.getString("fechaIniPosibleAlquiler") %></span></p>
                                        <p class="text-xs text-gray-400">Hasta: <span class="text-gray-600 font-medium"><%= rsSols.getString("fechaFinPosibleAlquiler") %></span></p>
                                    </div>
                                </div>
                                
                                <div class="flex gap-2 mt-4 md:mt-0">
                                   <form action="DetalleSolicitudPropietarioServlet" method="POST" class="flex gap-2" 
      onsubmit="return confirm('¿Estás seguro de procesar esta solicitud?')">
    
    <input type="hidden" name="idSolicitud" value="<%= rsSols.getInt("idSolicitud") %>">
    
    <button name="accion" value="aceptar" 
            class="bg-green-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-600 shadow-md transition">
        Aceptar
    </button>
    
    <button name="accion" value="rechazar" 
            class="bg-white text-red-500 border border-red-200 px-5 py-2 rounded-xl font-bold hover:bg-red-50 transition">
        Rechazar
    </button>
</form>
                                </div>
                            </div>
                        <% 
                            } 
                            if (!tieneSols) { %>
                                <p class="text-gray-400 text-sm italic">No hay solicitudes pendientes para esta habitación.</p>
                        <%  } 
                            rsSols.close(); psSols.close();
                        %>
                        </div>
                    </div>
                </div>
            <% } %>
        </div>
    </main>

    <script>
        function toggleInquilinos(id) {
            const div = document.getElementById('inquilinos-' + id);
            div.classList.toggle('hidden');
        }
    </script>

    <jsp:include page="Footer.jsp" />
</body>
</html>
<% rsHabis.close(); psHabis.close(); conn.close(); %>