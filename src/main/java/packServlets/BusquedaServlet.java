/**
 *
 * @author Resen
 */
package packServlets;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class BusquedaServlet extends HttpServlet {
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 1. Obtener parámetros (Ahora coinciden con los 'name' del formulario)
        String ciudad = request.getParameter("ciudad");
        String fechaInicio = request.getParameter("fechaInicio");
        String fechaFin = request.getParameter("fechaFin");

        // 2. Validación básica de obligatoriedad
        if (ciudad == null || ciudad.isEmpty() || 
            fechaInicio == null || fechaInicio.isEmpty() || 
            fechaFin == null || fechaFin.isEmpty()) {
            
            // Si falta algo, lo mandamos de vuelta con un error
            response.sendRedirect("Busqueda.jsp?error=campos_obligatorios");
            return;
        }

        // 3. Codificar la ciudad para la URL
        String ciudadEncoded = URLEncoder.encode(ciudad, StandardCharsets.UTF_8.toString());

        // 4. Redirección a la lista de resultados
        // Pasamos los 3 parámetros para que el JSP haga el filtrado SQL
        response.sendRedirect("ListaHabitaciones.jsp?ciudad=" + ciudadEncoded + 
                              "&fechaInicio=" + fechaInicio + 
                              "&fechaFin=" + fechaFin);
    }
}