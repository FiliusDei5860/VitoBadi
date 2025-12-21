/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */

/**
 *
 * @author Resen
 */
package servlets;

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

@WebServlet("/MisSolicitudesInquilinoServlet")
public class MisSolicitudesInquilinoServlet extends HttpServlet {

    // CARGAR LISTADO
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        String emailInquilino = (String) session.getAttribute("emailUsuario");

        if (emailInquilino == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        // SIMULACIÓN: Aquí llamarías a SolicitudDAO.obtenerPorInquilino(emailInquilino)
        List<Map<String, String>> misSolicitudes = new ArrayList<>();
        
        Map<String, String> s1 = new HashMap<>();
        s1.put("idSolicitud", "1");
        s1.put("idHabitacion", "101");
        s1.put("direccion", "Calle Libertad, 3");
        s1.put("ciudad", "Vitoria-Gasteiz");
        s1.put("precio", "390");
        s1.put("estado", "Pendiente");
        s1.put("fechaSolicitud", "2025-09-20");
        s1.put("imagen", "https://via.placeholder.com/150");
        
        misSolicitudes.add(s1);

        request.setAttribute("listaSolicitudes", misSolicitudes);
        request.getRequestDispatcher("MisSolicitudesInquilino.jsp").forward(request, response);
    }

    // CANCELAR SOLICITUD
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String idSolicitud = request.getParameter("idSolicitud");
        
        // Lógica real: SolicitudDAO.eliminar(idSolicitud);
        System.out.println("Cancelando solicitud ID: " + idSolicitud);

        // Redirigir de nuevo a la lista para refrescar
        response.sendRedirect("MisSolicitudesInquilinoServlet?mensaje=cancelada");
    }
}