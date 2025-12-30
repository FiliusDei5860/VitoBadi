package packServlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;

import utils.DB;

public class MisSolicitudesInquilinoServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        if (session == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        String email = (String) session.getAttribute(LoginServlet.CLAVE_SESION_EMAIL); // "emailUsuario"
        if (email == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        List<Map<String, String>> lista = new ArrayList<>();

        String sql =
            "SELECT s.idSolicitud, s.estado, s.fechaIniPosibleAlquiler, s.fechaFinPosibleAlquiler, " +
            "       h.codHabi, h.ciudad, h.`dirección` AS direccion, h.precioMes, h.imagenHabitacion " +
            "FROM solicitud s " +
            "JOIN habitacion h ON h.codHabi = s.codHabi " +
            "WHERE s.emailInquilino = ? " +
            "ORDER BY s.idSolicitud DESC";

        try (Connection conn = DB.getConexion();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, String> sol = new HashMap<>();

                    sol.put("idSolicitud", String.valueOf(rs.getInt("idSolicitud")));
                    sol.put("idHabitacion", String.valueOf(rs.getInt("codHabi"))); // tu JSP usa idHabitacion
                    sol.put("estado", rs.getString("estado"));

                    String fechaIni = String.valueOf(rs.getDate("fechaIniPosibleAlquiler"));
                    String fechaFin = String.valueOf(rs.getDate("fechaFinPosibleAlquiler"));
                    sol.put("fechaSolicitud", fechaIni + " → " + fechaFin); // tu JSP muestra "Enviada el:"

                    sol.put("ciudad", rs.getString("ciudad"));
                    sol.put("direccion", rs.getString("direccion"));
                    sol.put("precio", String.valueOf(rs.getInt("precioMes")));

                    // importante: añadir contextPath para que funcione en Tomcat
                    String img = rs.getString("imagenHabitacion");
                    if (img == null || img.isBlank()) {
                        img = "img/habitaciones/default.jpg";
                    }
                    sol.put("imagen", request.getContextPath() + "/" + img);

                    lista.add(sol);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            request.setAttribute("errorBD", e.getMessage());
        }

        request.setAttribute("listaSolicitudes", lista);
        request.getRequestDispatcher("MisSolicitudesInquilino.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        if (session == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        String email = (String) session.getAttribute(LoginServlet.CLAVE_SESION_EMAIL);
        if (email == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        String idStr = request.getParameter("idSolicitud");
        if (idStr == null || idStr.isBlank()) {
            response.sendRedirect("MisSolicitudesInquilinoServlet");
            return;
        }

        int idSolicitud = Integer.parseInt(idStr);

        String sql =
            "UPDATE solicitud " +
            "SET estado = 'rechazada' " +
            "WHERE idSolicitud = ? AND emailInquilino = ? AND estado = 'pendiente'";

        try (Connection conn = DB.getConexion();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, idSolicitud);
            ps.setString(2, email);
            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }

        response.sendRedirect("MisSolicitudesInquilinoServlet");
    }
}
