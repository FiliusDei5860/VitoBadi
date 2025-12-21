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
import jakarta.servlet.http.HttpSession;

@WebServlet("/LogoutServlet")
public class LogoutServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 1. Obtener la sesión actual sin crear una nueva
        HttpSession session = request.getSession(false);
        
        if (session != null) {
            // 2. Eliminar todos los atributos de la sesión (opcional pero recomendado)
            session.removeAttribute("emailUsuario");
            session.removeAttribute("nombreUsuario");
            
            // 3. Invalidar la sesión por completo
            session.invalidate(); 
        }

        // 4. Evitar que el navegador guarde en caché la página protegida tras cerrar sesión
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0
        response.setDateHeader("Expires", 0); // Proxies

        // 5. Redirigir al login o a la búsqueda (tú eliges el destino)
        response.sendRedirect("Login.jsp");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // Redirigir llamadas POST al GET por si acaso
        doGet(request, response);
    }
}