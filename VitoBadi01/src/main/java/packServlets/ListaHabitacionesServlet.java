/**
 *
 * @author Resen
 */
package packServlets;


import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/HabitacionServlet")
public class ListaHabitacionesServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // No hacemos lógica aquí para evitar errores de clases inexistentes.
        // El JSP se encargará de leer los parámetros 'id' y 'ciudad'.
        request.getRequestDispatcher("ListaHabitaciones.jsp").forward(request, response);
    }
}