/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package servlets;

import java.io.IOException;
import java.util.Collection;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;

@WebServlet("/CreateHabitacionServlet")
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024, // 1MB
    maxFileSize = 1024 * 1024 * 5,    // 5MB por archivo
    maxRequestSize = 1024 * 1024 * 20 // 20MB total
)
public class CrearHabitacionServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        String emailPropietario = (String) session.getAttribute("emailUsuario");

        if (emailPropietario == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        // 1. Capturar campos de texto
        String titulo = request.getParameter("titulo");
        String descripcion = request.getParameter("descripcion");
        String direccion = request.getParameter("direccion");
        String ciudad = request.getParameter("ciudad");
        String cp = request.getParameter("cp");
        double precio = Double.parseDouble(request.getParameter("precio"));
        double latitud = Double.parseDouble(request.getParameter("latitud"));
        double longitud = Double.parseDouble(request.getParameter("longitud"));
        int tamanio = Integer.parseInt(request.getParameter("tamanio"));

        // 2. Procesar imágenes
        Collection<Part> fileParts = request.getParts(); 
        for (Part part : fileParts) {
            if (part.getName().equals("imagenes") && part.getSize() > 0) {
                String fileName = part.getSubmittedFileName();
                // Aquí guardarías el archivo en el servidor o convertirías a Byte[]
                // Ejemplo: part.write("C:/uploads/" + fileName);
            }
        }

        // 3. Guardar en Base de Datos vía DAO
        // Habitacion nueva = new Habitacion(...);
        // HabitacionDAO.insertar(nueva);

        response.sendRedirect("MisHabitacionesServlet?exito=creada");
    }
}