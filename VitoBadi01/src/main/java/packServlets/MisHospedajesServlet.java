/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */


/**
 *
 * @author Resen
 */

package packServlets;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/MisHospedajesServlet")
public class MisHospedajesServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        String emailUsuario = (String) session.getAttribute("emailUsuario");

        if (emailUsuario == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        // SIMULACIÓN: En la realidad aquí harías: AlquilerDAO.listarHospedajes(emailUsuario)
        List<Map<String, String>> listaHospedajes = new ArrayList<>();
        
        Map<String, String> h1 = new HashMap<>();
        h1.put("idContrato", "501");
        h1.put("titulo", "Habitación Exterior Centro");
        h1.put("direccion", "Calle Dato, 14");
        h1.put("ciudad", "Vitoria-Gasteiz");
        h1.put("precio", "420");
        h1.put("fechaInicio", "2025-01-15");
        h1.put("fechaFin", "2025-07-15");
        h1.put("propietario", "propietario@ejemplo.com");
        h1.put("imagen", "https://via.placeholder.com/150");
        
        listaHospedajes.add(h1);

        request.setAttribute("hospedajes", listaHospedajes);
        request.getRequestDispatcher("MisHospedajes.jsp").forward(request, response);
    }
}