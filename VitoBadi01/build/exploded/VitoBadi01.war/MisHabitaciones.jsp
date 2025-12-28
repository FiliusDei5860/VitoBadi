<%-- 
    Document   : MisHabitaciones
    Created on : 20 dic 2025, 6:33:00 p.m.
    Author     : Resen
--%>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.sql.*, utils.DB" %>
<%
    // 1. Conexión y Datos de sesión
    Connection conn = DB.getConexion();
    String nombre = (String) session.getAttribute("nombreUsuario");
    String emailUsuario = (String) session.getAttribute("emailUsuario");

    // 2. Seguridad
    if (emailUsuario == null) {
        response.sendRedirect("Login.jsp");
        return;
    }

    // 3. Consulta SQL filtrada por el propietario
    // IMPORTANTE: Quitamos el Statement genérico y usamos el PreparedStatement correctamente
    String sql = "SELECT * FROM habitacion WHERE emailPropietario = ?";
    PreparedStatement ps = conn.prepareStatement(sql);
    ps.setString(1, emailUsuario);
    ResultSet rs = ps.executeQuery();
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
    <jsp:include page="NavBar.jsp" />

    

    <main class="container mx-auto px-4 my-10 flex-grow max-w-5xl">
        <h1 class="text-4xl font-extrabold text-center text-gray-800 mb-2">Mis Habitaciones</h1>
        <p class="text-center text-gray-500 mb-8">Gestiona las publicaciones que has creado como propietario.</p>

       

        <section class="mt-12 space-y-6">
            <%
                boolean tieneDatos = false;
                // Usamos el ResultSet directamente en lugar de la 'lista' del servlet
                while (rs.next()) {
                    tieneDatos = true;
                    int id = rs.getInt("codHabi");
                    String ciudadH = rs.getString("ciudad");
                    String direccionH = rs.getString("dirección"); // Usando la tilde de tu DB
                    double precioH = rs.getDouble("precioMes");
                    String foto = rs.getString("imagenHabitacion");
            %>
                <article class="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6 border border-transparent hover:border-indigo-300 transition-all">
                    
                    <div class="flex items-center gap-6 w-full">
                        <div class="w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden border">
                            <img src="<%= (foto != null && !foto.isEmpty()) ? foto : "img/habitaciones/default.jpg" %>" 
                                 class="w-full h-full object-cover" 
                                 alt="Habitación"
                                 onerror="this.src='img/habitaciones/default.jpg'">
                        </div>

                        <div class="flex-grow">
                            <h3 class="text-2xl font-bold text-gray-800"><%= ciudadH %></h3>
                            <div class="flex flex-wrap gap-y-1 gap-x-4 mt-2 text-gray-600">
                                <span class="flex items-center">📍 <%= direccionH %></span>
                                <span class="flex items-center font-bold text-indigo-600">💰 <%= precioH %> €/mes</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3 w-full md:w-auto">
                        <a href="DetalleHabitacion.jsp?id=<%= id %>" 
                           class="flex-1 md:flex-none text-center bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition">
                            Ver detalle
                        </a>
                        <a href="ActualizarHabitacion.jsp?id=<%= id %>" 
                           class="flex-1 md:flex-none text-center bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md">
                            Editar
                        </a>
                    </div>
                </article>
            <%
                } // Fin while

                if (!tieneDatos) {
            %>
                <div class="bg-white p-12 rounded-xl shadow-inner text-center border-2 border-dashed border-gray-300">
                    <p class="text-xl text-gray-400 italic">No tienes habitaciones publicadas todavía.</p>
                </div>
            <%
                }
                // Cerramos recursos
                rs.close();
                ps.close();
                conn.close();
            %>
        </section>
    </main>

    <jsp:include page="Footer.jsp" />
</body>
</html>