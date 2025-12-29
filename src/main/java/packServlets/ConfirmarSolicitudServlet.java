/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
/**
 *
 * @author Resen
 */
package packServlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import utils.DB; // Asegúrate de que esta sea la ruta correcta a tu clase de conexión

@WebServlet(name = "ConfirmarSolicitudServlet", urlPatterns = {"/ConfirmarSolicitudServlet"})
public class ConfirmarSolicitudServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // 1. Obtener la sesión y validar usuario
        HttpSession session = request.getSession();
        String emailInquilino = (String) session.getAttribute("emailUsuario");

        if (emailInquilino == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        // 2. Capturar parámetros del formulario de confirmación
        String codHabiStr = request.getParameter("codHabi");
        String fechaInicio = request.getParameter("fechaInicio");
        String fechaFin = request.getParameter("fechaFin");

        try (Connection conn = DB.getConexion()) {
            // 3. Preparar la inserción
            // He incluido fechaInicioPosibleAlquiler y fechaFinPosibleAlquiler según la "Forma 1" que elegimos.
            String sql = "INSERT INTO solicitud (codHabi, emailInquilino, estado, fechaIniPosibleAlquiler, fechaFinPosibleAlquiler) "
           + "VALUES (?, ?, ?, ?, ?)";

try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setInt(1, Integer.parseInt(codHabiStr));
    ps.setString(2, emailInquilino);
    ps.setString(3, "pendiente"); // Añadimos el estado inicial
    ps.setString(4, fechaInicio); // Asegúrate de que los nombres coincidan con la DB
    ps.setString(5, fechaFin);

    int filasAfectadas = ps.executeUpdate();

                if (filasAfectadas > 0) {
                    // Éxito: Redirigir a la lista con un mensaje positivo
                    response.sendRedirect("ListaHabitaciones.jsp?status=success_solicitud");
                } else {
                    response.sendRedirect("ListaHabitaciones.jsp?status=error_db");
                }
            }
        } catch (SQLException | NumberFormatException e) {
            e.printStackTrace();
            // Error: Redirigir pasando el mensaje para depuración
            response.sendRedirect("ListaHabitaciones.jsp?status=error&msg=" + e.getMessage());
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Por seguridad, si intentan acceder por URL (GET), los mandamos a la búsqueda
        response.sendRedirect("Busqueda.jsp");
    }
}