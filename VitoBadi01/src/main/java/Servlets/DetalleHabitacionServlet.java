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


@WebServlet("/DetalleHabitacionServlet")
public class DetalleHabitacionServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String idParam = request.getParameter("id");

        if (idParam == null || idParam.isEmpty()) {
            response.sendRedirect("MisHabitacionesServlet");
            return;
        }

        // Lógica de recuperación de datos (Simulada)
        // Habitacion h = HabitacionDAO.obtenerPorId(Integer.parseInt(idParam));
        
        // Simulamos el objeto recuperado
        request.setAttribute("direccion", "Avenida de Gasteiz, 22");
        request.setAttribute("ciudad", "Vitoria-Gasteiz");
        request.setAttribute("precio", "400 €/mes");
        request.setAttribute("latitud", "42.8467");
        request.setAttribute("longitud", "-2.6716");
        request.setAttribute("estado", "Disponible");
        request.setAttribute("imagenUrl", "https://via.placeholder.com/600x400");

        // Enviamos al JSP
        request.getRequestDispatcher("DetalleHabitacion.jsp").forward(request, response);
    }
}