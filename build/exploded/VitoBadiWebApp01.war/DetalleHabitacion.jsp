<%-- 
    Document   : DetalleHabitacion
--%>

<%@ page import="java.sql.*, utils.DB" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    String idHab = request.getParameter("id");

    // Para volver “a donde venías”
    String returnTo = request.getParameter("returnTo");
    if (returnTo == null || returnTo.trim().isEmpty()) {
        // fallback (tu comportamiento anterior)
        returnTo = "MisHabitaciones.jsp";
    }

    String direccion = "No disponible";
    String ciudad = "No disponible";
    String precio = "0";
    String latitud = "0";
    String longitud = "0";
    String imagenUrl = "Public_icons/default-room.jpg";

    if (idHab != null && !idHab.isEmpty()) {
        try {
            Connection conn = DB.getConexion();
            String sql = "SELECT ciudad, `dirección`, emailPropietario, imagenHabitacion, latitudH, longitudH, precioMes " +
                         "FROM habitacion WHERE codHabi = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, idHab);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                direccion = rs.getString("dirección");
                ciudad = rs.getString("ciudad");
                precio = String.valueOf(rs.getInt("precioMes"));
                latitud = rs.getString("latitudH");
                longitud = rs.getString("longitudH");
                String img = rs.getString("imagenHabitacion");
                if (img != null && !img.trim().isEmpty()) {
                    imagenUrl = img;
                }
            }
            rs.close();
            ps.close();
            // NO cierres conn aquí si tu DB.getConexion() reutiliza conexión global
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Detalle habitación – VitoBadi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/jpeg" href="Public_icons/VitoBadiIcon.jpg">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="Css/style.css">
</head>
<body class="bg-gray-100 flex flex-col min-h-screen">

    <jsp:include page="NavBar.jsp" />

    <main class="flex-grow py-10">
        <div class="container mx-auto px-4 max-w-5xl">
            <div class="flex items-center justify-between mb-8">
                <a href="<%= returnTo %>" class="bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
                    ← Volver al listado
                </a>
                <h1 class="text-3xl font-extrabold text-indigo-800">
                    Detalle de la Habitación #<%= (idHab != null ? idHab : "") %>
                </h1>
            </div>

            <section class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
                <div class="p-8 md:w-1/2 space-y-4">
                    <div class="space-y-2">
                        <p class="text-sm text-gray-500 uppercase font-bold tracking-wider">Ubicación</p>
                        <p class="text-xl text-gray-800"><strong>Dirección:</strong> <%= direccion %></p>
                        <p class="text-lg text-gray-700"><strong>Ciudad:</strong> <%= ciudad %></p>
                    </div>

                    <hr class="border-gray-100">

                    <div class="space-y-2">
                        <p class="text-sm text-gray-500 uppercase font-bold tracking-wider">Detalles Económicos</p>
                        <p class="text-2xl font-bold text-indigo-600"><%= precio %> €/mes</p>
                    </div>

                    <hr class="border-gray-100">

                    <div class="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <p class="text-xs text-gray-400 uppercase font-bold">Latitud</p>
                            <p class="text-gray-600 font-mono"><%= latitud %></p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400 uppercase font-bold">Longitud</p>
                            <p class="text-gray-600 font-mono"><%= longitud %></p>
                        </div>
                    </div>
                </div>

                <div class="md:w-1/2 relative bg-gray-200 min-h-[400px]">
                    <% if(imagenUrl != null && !imagenUrl.isEmpty()) { %>
                        <img src="<%= imagenUrl %>" alt="Imagen habitación" class="absolute inset-0 w-full h-full object-cover">
                    <% } else { %>
                        <div class="flex items-center justify-center h-full text-gray-400">Sin imagen disponible</div>
                    <% } %>
                </div>
            </section>
        </div>
    </main>

    <jsp:include page="Footer.jsp" />
</body>
</html>