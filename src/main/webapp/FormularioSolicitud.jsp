<%-- 
    Document   : FormularioSolicitud
    Created on : 29 dic 2025, 4:35:03 a.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.sql.*, utils.DB, java.time.LocalDate" %>
<%
    // 1. Validación de sesión
    String emailLogueado = (String) session.getAttribute("emailUsuario");
    if (emailLogueado == null) { 
        response.sendRedirect("Login.jsp"); 
        return; 
    }

    // 2. Captura de parámetros de la URL
    String codHabi = request.getParameter("codHabi");
    String fIniBusqueda = request.getParameter("fIni");
    String fFinBusqueda = request.getParameter("fFin");

    // 3. Preparación de fechas con Java (Scriptlets)
    String fechaHoy = LocalDate.now().toString(); // Formato YYYY-MM-DD
    
    // Si no vienen fechas de la búsqueda previa, usamos hoy por defecto
    String valorFIni = (fIniBusqueda != null && !fIniBusqueda.isEmpty()) ? fIniBusqueda : fechaHoy;
    String valorFFin = (fFinBusqueda != null && !fFinBusqueda.isEmpty()) ? fFinBusqueda : "";

    // 4. Consultar datos detallados
    Connection conn = DB.getConexion();
    // Subconsulta para la media de puntos de la tabla 'puntuacion'
    String sql = "SELECT h.*, (SELECT AVG(puntos) FROM puntuacion p WHERE p.codHabi = h.codHabi) as puntuacionMedia " +
                 "FROM habitacion h WHERE h.codHabi = ?";
    
    PreparedStatement ps = conn.prepareStatement(sql);
    ps.setInt(1, Integer.parseInt(codHabi));
    ResultSet rs = ps.executeQuery();
    
    if (!rs.next()) { 
        response.sendRedirect("ListaHabitaciones.jsp"); 
        return; 
    }
    
    String foto = rs.getString("imagenHabitacion");
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Confirmar Solicitud - VitoBadi</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex flex-col min-h-screen">
    <jsp:include page="NavBar.jsp" />

    <main class="flex-grow flex items-center justify-center p-4 my-8">
        <div class="bg-white shadow-2xl rounded-3xl overflow-hidden max-w-2xl w-full border border-gray-100">
            
            <div class="md:flex">
                <div class="md:w-1/2 relative bg-gray-200">
                    <img src="<%= (foto != null && !foto.isEmpty()) ? foto : "img/habitaciones/default.jpg" %>" 
                         class="h-full w-full object-cover min-h-[350px]"
                         onerror="this.src='img/habitaciones/default.jpg'">
                    <div class="absolute top-4 left-4">
                        <span class="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            ID: #<%= rs.getInt("codHabi") %>
                        </span>
                    </div>
                </div>

                <div class="md:w-1/2 p-8">
                    <h2 class="text-2xl font-black text-indigo-900 mb-2">Resumen de Reserva</h2>
                    
                    <div class="mb-6">
                        <p class="text-gray-600 text-sm font-medium"><%= rs.getString("dirección") %></p>
                        <p class="text-indigo-600 font-bold text-xl mt-1"><%= rs.getDouble("precioMes") %> €/mes</p>
                        <p class="text-yellow-500 font-bold text-sm mt-1">
                            ⭐ <%= rs.getObject("puntuacionMedia") != null ? String.format("%.1f", rs.getDouble("puntuacionMedia")) : "Sin valoraciones" %>
                        </p>
                    </div>

                    <hr class="mb-6 border-gray-100">

                    <form action="ConfirmarSolicitudServlet" method="POST" class="space-y-4">
                        <input type="hidden" name="codHabi" value="<%= codHabi %>">

                        <div class="space-y-3">
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha de Entrada</label>
                                <input type="date" 
                                       id="fechaInicio"
                                       name="fechaInicio" 
                                       value="<%= valorFIni %>" 
                                       min="<%= fechaHoy %>" 
                                       required
                                       onchange="document.getElementById('fechaFin').min = this.value"
                                       class="w-full border-gray-200 border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                            </div>
                            
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha de Salida</label>
                                <input type="date" 
                                       id="fechaFin"
                                       name="fechaFin" 
                                       value="<%= valorFFin %>" 
                                       min="<%= valorFIni %>" 
                                       required
                                       class="w-full border-gray-200 border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                            </div>
                        </div>

                        <div class="pt-4 space-y-3">
                            <button type="submit" 
                                    class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                                Confirmar Solicitud
                            </button>
                            <button type="button" onclick="history.back()" 
                                    class="w-full text-gray-400 text-sm font-bold hover:text-gray-600 transition text-center">
                                ← Volver atrás
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
        </div>
    </main>

    <jsp:include page="Footer.jsp" />
</body>
</html>
<% 
    rs.close(); 
    ps.close(); 
    conn.close(); 
%>