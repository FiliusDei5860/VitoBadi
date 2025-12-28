/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */


package packServlets;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
/**
 *
 * @author Resen
 */


@WebServlet("/ActualizarHabitacionServlet")
public class ActualizarHabitacionServlet extends HttpServlet {

    // 1. CARGAR DATOS (GET)
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String idParam = request.getParameter("id");
        
        if (idParam != null) {
            // Aquí llamarías a tu DAO para obtener el precio actual
            // int precioActual = HabitacionDAO.getPrecio(idParam);
            int precioActual = 350; // Ejemplo simulado
            
            request.setAttribute("precioActual", precioActual);
            request.setAttribute("idHabitacion", idParam);
            request.getRequestDispatcher("ActualizarHabitacion.jsp").forward(request, response);
        } else {
            response.sendRedirect("MisHabitacionesServlet");
        }
    }

    // 2. GUARDAR CAMBIOS (POST)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String id = request.getParameter("idHabitacion");
        String precioStr = request.getParameter("precio");

        try {
            int nuevoPrecio = Integer.parseInt(precioStr);
            
            // Lógica de BD: HabitacionDAO.updatePrecio(id, nuevoPrecio);
            System.out.println("Actualizando habitacion " + id + " a precio: " + nuevoPrecio);

            // Redirigir al listado tras éxito
            response.sendRedirect("MisHabitacionesServlet?mensaje=actualizado");
            
        } catch (NumberFormatException e) {
            response.sendRedirect("ActualizarHabitacion.jsp?id=" + id + "&error=precio_invalido");
        }
    }
}