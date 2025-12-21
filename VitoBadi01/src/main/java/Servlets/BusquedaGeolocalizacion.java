/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package servlets;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/BusquedaGeolocalizacion")
public class BusquedaGeolocalizacion extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Recogemos parámetros del formulario
        String lat = request.getParameter("lat");
        String lng = request.getParameter("lng");
        String radio = request.getParameter("radio");
        String fecha = request.getParameter("fecha");

        // Redirección con parámetros para que el JS los use al cargar la página
        response.sendRedirect("Ubicacion.jsp?lat=" + lat + "&lng=" + lng + "&radio=" + radio + "&fecha=" + fecha);
    }
}