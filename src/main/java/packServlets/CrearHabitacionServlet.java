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
import java.io.File;
import java.sql.Connection;
import java.sql.PreparedStatement;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;

import jakarta.servlet.http.*;
import utils.DB; 
@WebServlet("/CrearHabitacionServlet")
@MultipartConfig()
public class CrearHabitacionServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession();
        String email = (String) session.getAttribute("emailUsuario");
        if (email == null) email = "test@vito.com";

        try {
            // 1. CAPTURAR DATOS DEL FORMULARIO
            String ciudadForm = request.getParameter("ciudad");
            String direccionForm = request.getParameter("direccion"); 
            double lat = parseDoubleSafe(request.getParameter("latitud"));
            double lon = parseDoubleSafe(request.getParameter("longitud"));
            double precio = parseDoubleSafe(request.getParameter("precio"));

            // 2. PROCESAR LA IMAGEN
            Part filePart = request.getPart("imagenes"); // Verifica que en el JSP el <input> se llame 'imagenes'
            String fileName = filePart.getSubmittedFileName();
            String rutaRelativaBD = "img/habitaciones/default.jpg"; // Por si no suben nada

            if (fileName != null && !fileName.isEmpty()) {
                // Obtenemos la ruta física de la carpeta 'img/habitaciones' en el servidor
                String uploadPath = getServletContext().getRealPath("/") + "img" + File.separator + "habitaciones";
                
                // Crear carpeta si no existe
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) uploadDir.mkdirs();

                // Guardar el archivo físicamente
                filePart.write(uploadPath + File.separator + fileName);
                
                // Esta es la ruta que guardaremos en el String de la BD
                rutaRelativaBD = "img/habitaciones/" + fileName;
            }

            // 3. SQL (Usando tu estructura confirmada)
            String sql = "INSERT INTO habitacion (ciudad, dirección, emailPropietario, latitudH, longitudH, precioMes, imagenHabitacion) VALUES (?, ?, ?, ?, ?, ?, ?)";

            try (Connection conn = DB.getConexion();
                 PreparedStatement ps = conn.prepareStatement(sql)) {
                
                ps.setString(1, ciudadForm);
                ps.setString(2, direccionForm);
                ps.setString(3, email);
                ps.setDouble(4, lat);
                ps.setDouble(5, lon);
                ps.setDouble(6, precio);
                ps.setString(7, rutaRelativaBD); // <--- AHORA GUARDAMOS LA RUTA REAL

                ps.executeUpdate();
                response.sendRedirect("MisHabitaciones.jsp?msg=success");
            }

        } catch (Exception e) {
            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().println("<h1>Error al procesar la habitación</h1>");
            response.getWriter().println("<pre>" + e.getMessage() + "</pre>");
            e.printStackTrace();
        }
    }

    private double parseDoubleSafe(String v) {
        if (v == null || v.isEmpty()) return 0.0;
        try { return Double.parseDouble(v.replace(",", ".")); } catch (Exception e) { return 0.0; }
    }
}