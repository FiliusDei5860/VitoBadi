package packServlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import utils.DB;

public class PuntuarHabitacionServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        String emailUsuario = (session != null) ? (String) session.getAttribute("emailUsuario") : null;

        if (emailUsuario == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        String codHabiStr = request.getParameter("codHabi");
        String puntosStr  = request.getParameter("puntos");

        if (codHabiStr == null || puntosStr == null) {
            response.sendRedirect("MisHospedajesServlet");
            return;
        }

        int codHabi;
        int puntos;
        try {
            codHabi = Integer.parseInt(codHabiStr);
            puntos  = Integer.parseInt(puntosStr);
        } catch (NumberFormatException e) {
            response.sendRedirect("MisHospedajesServlet");
            return;
        }

        if (puntos < 1 || puntos > 5) {
            response.sendRedirect("MisHospedajesServlet");
            return;
        }

        // Insertar SOLO si no existe (1 sola vez)
        String sql =
            "INSERT INTO puntuacion (codHabi, emailInquilino, puntos) " +
            "SELECT ?, ?, ? FROM DUAL " +
            "WHERE NOT EXISTS (" +
            "   SELECT 1 FROM puntuacion WHERE codHabi = ? AND emailInquilino = ?" +
            ")";

        try (Connection conn = DB.getConexion();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, codHabi);
            ps.setString(2, emailUsuario);
            ps.setInt(3, puntos);
            ps.setInt(4, codHabi);
            ps.setString(5, emailUsuario);

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }

        response.sendRedirect("MisHospedajesServlet");
    }
}
