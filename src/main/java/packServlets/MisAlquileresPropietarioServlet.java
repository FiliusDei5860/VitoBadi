/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package packServlets;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import jakarta.servlet.http.HttpSession;
/**
 *
 * @author Resen
 */

public class MisAlquileresPropietarioServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        String emailPropietario = (String) session.getAttribute("emailUsuario");

        if (emailPropietario == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        // Simulación de datos: En un caso real harías un JOIN entre Alquileres, Habitaciones y Usuarios
        List<Map<String, String>> alquileresPropietario = new ArrayList<>();
        
        Map<String, String> alq1 = new HashMap<>();
        alq1.put("idContrato", "201");
        alq1.put("titulo", "Estudio Moderno");
        alq1.put("direccion", "Calle Postas, 10");
        alq1.put("ciudad", "Vitoria-Gasteiz");
        alq1.put("precio", "450");
        alq1.put("fechaInicio", "2025-02-01");
        alq1.put("fechaFin", "2025-08-01");
        alq1.put("inquilino", "Ana Martínez");
        alq1.put("imagen", "https://via.placeholder.com/150");
        alq1.put("estado", "Activo");

        alquileresPropietario.add(alq1);

        request.setAttribute("listaAlquileres", alquileresPropietario);
        request.getRequestDispatcher("MisAlquileresPropietario.jsp").forward(request, response);
    }
}