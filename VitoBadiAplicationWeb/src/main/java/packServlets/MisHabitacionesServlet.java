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
import jakarta.servlet.http.HttpSession;

/**
 *
 * @author Resen
 */


// Importa aquí tu modelo y tu DAO
// import modelos.Habitacion;
// import dao.HabitacionDAO;


public class MisHabitacionesServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        String emailUsuario = (String) session.getAttribute("emailUsuario");

        // 1. Verificación de Seguridad: Si no hay sesión, al login.
        if (emailUsuario == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        try {
            // 2. Lógica de negocio: Llamamos al DAO para traer SOLO las habitaciones del usuario.
            // HabitacionDAO dao = new HabitacionDAO();
            // List<Habitacion> lista = dao.listarPorPropietario(emailUsuario);

            // 3. Pasar los datos al JSP:
            // request.setAttribute("misHabitaciones", lista);
            
            // 4. Despachar la vista:
            request.getRequestDispatcher("MisHabitaciones.jsp").forward(request, response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("Error.jsp");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // En caso de que alguien mande un POST, lo redirigimos al GET.
        doGet(request, response);
    }
}