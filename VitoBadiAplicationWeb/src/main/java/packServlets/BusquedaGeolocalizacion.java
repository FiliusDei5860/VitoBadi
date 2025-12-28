/*BusquedaGeolocalizacion
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */

/**
 *
 * @author Resen
 */
package packServlets;

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
        
        String lat = request.getParameter("lat");
        String lng = request.getParameter("lng");
        String radio = request.getParameter("radio");
        String fecha = request.getParameter("fecha");

        response.sendRedirect("Geolocalizacion.jsp?lat=" + lat + "&lng=" + lng + "&radio=" + radio + "&fecha=" + fecha);
    }
}