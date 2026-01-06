<%@ page import="java.sql.*, utils.DB" %>
<%@ page import="java.util.*, java.time.LocalDate" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%
    String emailPropietario = (String) session.getAttribute("emailUsuario");

    List<Map<String, String>> vigentes = new ArrayList<>();
    List<Map<String, String>> historial = new ArrayList<>();
    LocalDate hoy = LocalDate.now();

    if (emailPropietario != null) {
        try (Connection conn = DB.getConexion()) {

            // Añadimos imagenHabitacion
            String sql =
                "SELECT a.idAlquiler, a.emailInquilino, a.fechaFinAlqui, " +
                "       h.dirección AS direccion, h.imagenHabitacion " +
                "FROM alquiler a " +
                "JOIN habitacion h ON a.codHabi = h.codHabi " +
                "WHERE h.emailPropietario = ?";

            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, emailPropietario.trim());
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Map<String, String> alq = new HashMap<>();

                alq.put("id", rs.getString("idAlquiler"));
                alq.put("direccion", rs.getString("direccion"));
                alq.put("inquilino", rs.getString("emailInquilino"));

                String img = rs.getString("imagenHabitacion");
                if (img == null || img.isBlank()) img = "img/habitaciones/default.jpg";
                alq.put("img", img);

                String fFinStr = rs.getString("fechaFinAlqui");
                alq.put("fechaFin", fFinStr);

                try {
                    LocalDate fechaFin = LocalDate.parse(fFinStr);
                    if (fechaFin.isBefore(hoy)) historial.add(alq);
                    else vigentes.add(alq);
                } catch (Exception e) {
                    vigentes.add(alq);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
%>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mis Alquileres - Gestión</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="icon" href="Public_icons/VitoBadiIcon.jpg" type="image/jpeg">

</head>

<body class="flex flex-col min-h-screen bg-gray-100">
<jsp:include page="NavBar.jsp" />

<main class="flex-grow py-10">
    <div class="container mx-auto px-4 max-w-5xl">

        <div class="mb-6">
            <a href="ListaHabitaciones.jsp" class="text-indigo-600 hover:text-indigo-800 transition inline-flex items-center gap-2">
                <span>←</span> Volver al Panel
            </a>
        </div>

        <div class="mb-10 text-center">
            <h1 class="text-3xl font-bold text-indigo-800">Panel de Gestión de Alquileres</h1>
            <p class="text-gray-600">
                Propietario: <%= (emailPropietario != null) ? emailPropietario : "Sesión no iniciada" %>
            </p>
        </div>

        <h2 class="text-2xl font-bold text-gray-800 mb-4">Gestión de Alquileres</h2>

        <!-- VIGENTES -->
        <section class="mb-10">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                Alquileres Vigentes
            </h3>

            <% if (vigentes.isEmpty()) { %>
                <div class="bg-white p-6 rounded-xl shadow text-center">
                    <p class="text-gray-500 italic">No hay contratos activos.</p>
                </div>
            <% } else { %>
                <div class="space-y-4">
                    <% for (Map<String, String> a : vigentes) { %>
                        <div class="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">

                            <div class="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src="<%= a.get("img") %>"
                                     alt="Habitación"
                                     class="w-full h-full object-cover">
                            </div>

                            <div class="flex-grow">
                                <div class="font-semibold text-gray-800">
                                    <%= a.get("direccion") %>
                                </div>
                                <div class="text-sm text-gray-600">
                                    Inquilino: <span class="font-medium"><%= a.get("inquilino") %></span>
                                </div>
                            </div>

                            <div class="text-right">
                                <div class="text-xs text-gray-500">Vence el</div>
                                <div class="font-mono text-green-700">
                                    <%= a.get("fechaFin") %>
                                </div>
                            </div>
                        </div>
                    <% } %>
                </div>
            <% } %>
        </section>

        <!-- HISTORIAL -->
        <section>
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <span class="w-3 h-3 bg-gray-400 rounded-full"></span>
                Historial Pasado
            </h3>

            <% if (historial.isEmpty()) { %>
                <div class="bg-white p-6 rounded-xl shadow text-center">
                    <p class="text-gray-500 italic">No hay registros históricos.</p>
                </div>
            <% } else { %>
                <div class="space-y-4">
                    <% for (Map<String, String> a : historial) { %>
                        <div class="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 opacity-80 hover:opacity-100 transition">

                            <div class="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src="<%= a.get("img") %>"
                                     alt="Habitación"
                                     class="w-full h-full object-cover">
                            </div>

                            <div class="flex-grow">
                                <div class="font-semibold text-gray-800">
                                    <%= a.get("direccion") %>
                                </div>
                                <div class="text-sm text-gray-600">
                                    Ex-inquilino: <span class="font-medium"><%= a.get("inquilino") %></span>
                                </div>
                            </div>

                            <div class="text-right">
                                <div class="text-xs text-gray-500">Finalizó</div>
                                <div class="font-mono text-orange-600">
                                    <%= a.get("fechaFin") %>
                                </div>
                            </div>
                        </div>
                    <% } %>
                </div>
            <% } %>

        </section>

    </div>
</main>

<jsp:include page="Footer.jsp" />
</body>
</html>
