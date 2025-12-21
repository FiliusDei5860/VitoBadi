package servlets;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/BusquedaServlet")
public class BusquedaServlet extends HttpServlet {
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 1. Obtener parámetros del formulario
        String ciudad = request.getParameter("ciudad");
        String fecha = request.getParameter("fecha");

        // 2. Valores por defecto para evitar nulos
        if (ciudad == null) ciudad = "";
        if (fecha == null) fecha = "";

        // 3. Codificar la ciudad (importante por los espacios en "San Sebastián" o "Vitoria-Gasteiz")
        String ciudadEncoded = URLEncoder.encode(ciudad, StandardCharsets.UTF_8.toString());

        // 4. Redirección a la vista de resultados (la página que ya tienes configurada)
        // Usamos GET para que ListaHabitaciones.jsp pueda leerlo con request.getParameter
        response.sendRedirect("ListaHabitaciones.jsp?ciudad=" + ciudadEncoded + "&fecha=" + fecha);
    }
}