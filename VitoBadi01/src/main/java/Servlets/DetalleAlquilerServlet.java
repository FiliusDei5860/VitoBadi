/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Servlets;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 *
 * @author Resen
 */

@WebServlet("/DetalleAlquilerServlet")
public class DetalleAlquilerServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String idParam = request.getParameter("id");

        if (idParam == null || idParam.isEmpty()) {
            response.sendRedirect("MisAlquileres.jsp");
            return;
        }

        try {
            // LÓGICA DE NEGOCIO (Simulada para el ejemplo)
            // En un caso real usarías tus DAOs:
            // Contrato contrato = ContratoDAO.buscarPorId(Integer.parseInt(idParam));
            // Habitacion habitacion = HabitacionDAO.buscarPorId(contrato.getIdHabitacion());
            // Usuario inquilino = UsuarioDAO.buscarPorEmail(contrato.getEmailInquilino());

            // Simulamos datos para que el JSP funcione ahora mismo:
            request.setAttribute("direccion", "Calle de la Paz, 14");
            request.setAttribute("ciudad", "Vitoria-Gasteiz");
            request.setAttribute("precio", "450");
            request.setAttribute("fechaInicio", "01/10/2025");
            request.setAttribute("fechaFin", "01/10/2026");
            request.setAttribute("nombreInquilino", "Juan Pérez");
            request.setAttribute("emailInquilino", "juan@ejemplo.com");
            request.setAttribute("imagenUrl", "https://via.placeholder.com/400x300");

            request.getRequestDispatcher("DetalleAlquiler.jsp").forward(request, response);

        } catch (Exception e) {
            response.sendRedirect("Error.jsp");
        }
    }
}