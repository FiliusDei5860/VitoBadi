package packServlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import utils.DB;

public class MisHospedajesServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        String emailUsuario = (session != null) ? (String) session.getAttribute("emailUsuario") : null;

        if (emailUsuario == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        List<Map<String, String>> vigentes = new ArrayList<>();
        List<Map<String, String>> historico = new ArrayList<>();

        String sql =
            "SELECT " +
            "  a.idAlquiler, a.codHabi, a.fechaInicioAlqui, a.fechaFinAlqui, " +
            "  h.ciudad, h.`dirección` AS direccion, h.precioMes, h.imagenHabitacion, " +
            "  u.email AS emailPropietario, u.nombre AS nombrePropietario " +
            "FROM alquiler a " +
            "JOIN habitacion h ON a.codHabi = h.codHabi " +
            "JOIN usuario u ON h.emailPropietario = u.email " +
            "WHERE a.emailInquilino = ? " +
            "ORDER BY a.fechaInicioAlqui DESC";

        LocalDate hoy = LocalDate.now();

        try (Connection conn = DB.getConexion();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, emailUsuario);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, String> h = new HashMap<>();

                    int idAlquiler = rs.getInt("idAlquiler");
                    int codHabi    = rs.getInt("codHabi");
                    Date iniSql = rs.getDate("fechaInicioAlqui");
                    Date finSql = rs.getDate("fechaFinAlqui");

                    // IDs
                    h.put("idAlquiler", String.valueOf(idAlquiler));
                    h.put("codHabi", String.valueOf(codHabi));

                    // Datos habitación
                    h.put("ciudad", rs.getString("ciudad"));
                    h.put("direccion", rs.getString("direccion"));
                    h.put("precioMes", String.valueOf(rs.getInt("precioMes")));
                    h.put("fechaInicioAlqui", (iniSql != null ? iniSql.toString() : ""));
                    h.put("fechaFinAlqui", (finSql != null ? finSql.toString() : ""));

                    String img = rs.getString("imagenHabitacion");
                    if (img == null || img.trim().isEmpty()) {
                        img = "img/habitaciones/default.jpg"; // ajusta si quieres
                    }
                    h.put("imagenHabitacion", img);

                    // Propietario
                    String propietarioNombre = rs.getString("nombrePropietario");
                    String propietarioEmail  = rs.getString("emailPropietario");
                    h.put("propietario",
                            (propietarioNombre != null && !propietarioNombre.isEmpty())
                                    ? propietarioNombre
                                    : propietarioEmail);

                    // Clasificación vigente / histórico
                    boolean esVigente = false;
                    if (iniSql != null && finSql != null) {
                        LocalDate ini = iniSql.toLocalDate();
                        LocalDate fin = finSql.toLocalDate();
                        // vigente si hoy está entre [ini, fin]
                        esVigente = (!hoy.isBefore(ini) && !hoy.isAfter(fin));
                    }

                    if (esVigente) vigentes.add(h);
                    else historico.add(h);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        request.setAttribute("vigentes", vigentes);
        request.setAttribute("historico", historico);
        request.getRequestDispatcher("MisHospedajes.jsp").forward(request, response);
    }
}
