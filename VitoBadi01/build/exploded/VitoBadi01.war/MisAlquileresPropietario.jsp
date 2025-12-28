<%-- 
    Document   : MisAlquileresPropietario
    Created on : 20 dic 2025, 7:19:50 p.m.
    Author     : Resen
--%>
<%@ page import="java.sql.*, utils.DB" %>
<%@ page import="java.util.*, java.time.LocalDate" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    String emailPropietario = (String) session.getAttribute("emailUsuario");
    
    // Listas para separar los alquileres
    List<Map<String, String>> vigentes = new ArrayList<>();
    List<Map<String, String>> historial = new ArrayList<>();
    LocalDate hoy = LocalDate.now();

    if (emailPropietario != null) {
        try (Connection conn = DB.getConexion()) {
            // Usamos la query que confirmamos que funciona (con dirección con tilde)
            String sql = "SELECT a.idAlquiler, a.emailInquilino, a.fechaFinAlqui, h.dirección " + 
                         "FROM alquiler a " +
                         "JOIN habitacion h ON a.codHabi = h.codHabi " +
                         "WHERE h.emailPropietario = ?";
            
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, emailPropietario.trim());
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Map<String, String> alq = new HashMap<>();
                alq.put("id", rs.getString("idAlquiler"));
                alq.put("direccion", rs.getString("dirección"));
                alq.put("inquilino", rs.getString("emailInquilino"));
                
                String fFinStr = rs.getString("fechaFinAlqui");
                alq.put("fechaFin", fFinStr);

                // Clasificación por fecha
                try {
                    LocalDate fechaFin = LocalDate.parse(fFinStr);
                    if (fechaFin.isBefore(hoy)) {
                        historial.add(alq);
                    } else {
                        vigentes.add(alq);
                    }
                } catch (Exception e) {
                    // Si el parseo falla, lo enviamos a vigentes por defecto
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
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-900 text-white p-6 md:p-10">
     <jsp:include page="NavBar.jsp" />
     
    <main class="container mx-auto px-4 my-10 flex-grow">
        <div class="mt-10">
            <a href="ListaHabitaciones.jsp" class="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-2">
                <span>←</span> Volver al Panel
            </a>
        </div>
        <div class="mb-10 text-center">
            <h1 class="text-3xl font-bold text-indigo-800">Panel de Gestión de Alquileres</h1>
            <p class="text-gray-600">Propietario: <%= (emailPropietario != null) ? emailPropietario : "Sesión no iniciada" %></p>
        </div>
    <div class="max-w-5xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-indigo-400">Gestión de Alquileres</h1>

        <section class="mb-12">
            <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                Alquileres Vigentes
            </h2>
            <div class="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <table class="w-full text-left">
                    <thead class="bg-gray-700 text-gray-300 uppercase text-xs">
                        <tr>
                            <th class="p-4">Dirección</th>
                            <th class="p-4">Inquilino</th>
                            <th class="p-4">Vence el</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700">
                        <% if (vigentes.isEmpty()) { %>
                            <tr><td colspan="3" class="p-4 text-gray-500 italic">No hay contratos activos.</td></tr>
                        <% } else { 
                            for (Map<String, String> a : vigentes) { %>
                            <tr class="hover:bg-gray-750 transition">
                                <td class="p-4 font-medium"><%= a.get("direccion") %></td>
                                <td class="p-4 text-gray-400 text-sm"><%= a.get("inquilino") %></td>
                                <td class="p-4 text-green-400 font-mono"><%= a.get("fechaFin") %></td>
                            </tr>
                        <% } } %>
                    </tbody>
                </table>
            </div>
        </section>

        <section>
            <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                <span class="w-3 h-3 bg-gray-500 rounded-full"></span>
                Historial Pasado
            </h2>
            <div class="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 opacity-80">
                <table class="w-full text-left">
                    <thead class="bg-gray-900 text-gray-400 uppercase text-xs">
                        <tr>
                            <th class="p-4">Dirección</th>
                            <th class="p-4">Ex-Inquilino</th>
                            <th class="p-4">Finalizó</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700">
                        <% if (historial.isEmpty()) { %>
                            <tr><td colspan="3" class="p-4 text-gray-500 italic">No hay registros históricos.</td></tr>
                        <% } else { 
                            for (Map<String, String> a : historial) { %>
                            <tr class="hover:bg-gray-750 transition text-gray-400">
                                <td class="p-4"><%= a.get("direccion") %></td>
                                <td class="p-4 text-xs"><%= a.get("inquilino") %></td>
                                <td class="p-4 font-mono text-orange-800"><%= a.get("fechaFin") %></td>
                            </tr>
                        <% } } %>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
                      </main> 
                        <jsp:include page="Footer.jsp" />

</body>
</html>