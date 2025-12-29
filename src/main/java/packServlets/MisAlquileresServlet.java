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
import java.util.List;
import java.util.ArrayList;
/**
 *
 * @author Resen
 */



@WebServlet("/MisAlquileresServlet")
public class MisAlquileresServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        String emailUsuario = (String) session.getAttribute("emailUsuario");

        if (emailUsuario == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        // LÓGICA DE NEGOCIO (Simulada)
        // Aquí llamarías a un método como: AlquilerDAO.listarPorUsuario(emailUsuario)
        // Este método debería devolver una lista que ya incluya los datos de la habitación.
        
        List<Object> listaAlquileres = new ArrayList<>();
        
        // Simulamos un objeto de alquiler para la vista
        // En un caso real, crearías una clase 'Alquiler' o usarías un Map
        java.util.Map<String, String> alq1 = new java.util.HashMap<>();
        alq1.put("idContrato", "101");
        alq1.put("direccion", "Calle Gorbea, 5");
        alq1.put("ciudad", "Vitoria");
        alq1.put("precio", "350");
        alq1.put("fechaInicio", "2025-01-01");
        alq1.put("fechaFin", "2025-12-31");
        alq1.put("rol", "Inquilino");
        alq1.put("imagen", "https://via.placeholder.com/150");
        
        listaAlquileres.add(alq1);

        request.setAttribute("alquileres", listaAlquileres);
        request.getRequestDispatcher("MisAlquileres.jsp").forward(request, response);
    }
}