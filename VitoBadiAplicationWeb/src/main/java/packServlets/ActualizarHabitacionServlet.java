/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */

package packServlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import utils.DB; // Asegúrate de que esta ruta sea correcta

public class ActualizarHabitacionServlet extends HttpServlet {

    // 1. CARGAR DATOS (GET) - Ya lo tienes, solo asegúrate de que el ID sea correcto
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String idParam = request.getParameter("id");
        
        if (idParam != null) {
            // Aquí puedes integrar tu consulta SQL para traer el precio real si quieres
            int precioActual = 350; // Ejemplo
            
            request.setAttribute("precioActual", precioActual);
            request.setAttribute("idHabitacion", idParam);
            request.getRequestDispatcher("ActualizarHabitacion.jsp").forward(request, response);
        } else {
            response.sendRedirect("MisHabitaciones.jsp");
        }
    }

    // 2. GUARDAR CAMBIOS (POST)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String id = request.getParameter("idHabitacion");
        String precioStr = request.getParameter("precio");

        if (id == null || precioStr == null) {
            response.sendRedirect("MisHabitaciones.jsp");
            return;
        }

        try (Connection conn = DB.getConexion()) {
            int nuevoPrecio = Integer.parseInt(precioStr);
            
            // Query para actualizar el precio
            String sql = "UPDATE habitacion SET precioMes = ? WHERE codHabi = ?";
            
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, nuevoPrecio);
            ps.setString(2, id);
            
            int filasActualizadas = ps.executeUpdate();

            if (filasActualizadas > 0) {
                // Redirigir con éxito
                response.sendRedirect("MisHabitaciones.jsp?mensaje=actualizado");
            } else {
                // Si no se encontró el ID
                response.sendRedirect("ActualizarHabitacion.jsp?id=" + id + "&error=no_encontrado");
            }
            
        } catch (NumberFormatException e) {
            response.sendRedirect("ActualizarHabitacion.jsp?id=" + id + "&error=precio_invalido");
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendRedirect("ActualizarHabitacion.jsp?id=" + id + "&error=db_error");
        }
    }
}