package packServlets;

import java.io.IOException;
import java.sql.*;
import java.time.LocalDate;
import java.util.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import utils.DB;
import java.sql.Date;

public class BusquedaGeolocalizacion extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        String emailUsuario = (session != null) ? (String) session.getAttribute("emailUsuario") : null;

        boolean logueado = (emailUsuario != null && !emailUsuario.isBlank());
        if (emailUsuario != null) {
            emailUsuario = emailUsuario.trim().toLowerCase();
        }

        // ✅ DECLARAR PRIMERO
        List<Map<String, String>> habitaciones = new ArrayList<>();

        String sql =
            "SELECT " +
            "  h.codHabi, h.ciudad, h.`dirección` AS direccion, h.latitudH, h.longitudH, " +
            "  h.precioMes, h.imagenHabitacion, h.emailPropietario, " +
            "  MAX(a.fechaFinAlqui) AS ultimaFin " +
            "FROM habitacion h " +
            "LEFT JOIN alquiler a ON a.codHabi = h.codHabi " +
            "WHERE ( ? IS NULL OR LOWER(TRIM(h.emailPropietario)) <> LOWER(TRIM(?)) ) " +
            "GROUP BY h.codHabi, h.ciudad, h.`dirección`, h.latitudH, h.longitudH, " +
            "         h.precioMes, h.imagenHabitacion, h.emailPropietario " +
            "ORDER BY h.ciudad, h.codHabi";

        try (Connection conn = DB.getConexion();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, emailUsuario);
            ps.setString(2, emailUsuario);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, String> h = new HashMap<>();

                    int codHabi = rs.getInt("codHabi");
                    double lat = rs.getDouble("latitudH");
                    double lon = rs.getDouble("longitudH");

                    String img = rs.getString("imagenHabitacion");
                    if (img == null || img.isBlank()) img = "img/habitaciones/default.jpg";

                    Date ultimaFin = rs.getDate("ultimaFin");
                    LocalDate fechaDisponible = (ultimaFin == null)
                            ? LocalDate.now()
                            : ultimaFin.toLocalDate().plusDays(1);

                    h.put("codHabi", String.valueOf(codHabi));
                    h.put("ciudad", rs.getString("ciudad"));
                    h.put("direccion", rs.getString("direccion"));
                    h.put("latitudH", String.format(Locale.US, "%.4f", lat));
                    h.put("longitudH", String.format(Locale.US, "%.4f", lon));
                    h.put("precioMes", String.valueOf(rs.getInt("precioMes")));
                    h.put("imagenHabitacion", img);
                    h.put("disponibleDesde", fechaDisponible.toString());

                    habitaciones.add(h);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // ✅ SET ATTRIBUTES AL FINAL
        request.setAttribute("logueado", logueado);
        request.setAttribute("habitacionesGeo", habitaciones);

        // ✅ FORWARD AL FINAL
        request.getRequestDispatcher("Geolocalizacion.jsp")
               .forward(request, response);
    }
}
