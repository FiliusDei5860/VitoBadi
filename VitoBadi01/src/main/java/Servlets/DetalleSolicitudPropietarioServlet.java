/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Servlets;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 *
 * @author Resen
 */

@WebServlet("/DetalleSolicitudPropietarioServlet")
public class DetalleSolicitudPropietarioServlet extends HttpServlet {

    // 1. CARGAR DATOS
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String idParam = request.getParameter("id");
        if (idParam == null) {
            response.sendRedirect("SolicitudesPropietario.jsp");
            return;
        }

        // Simulación de carga (Aquí irían tus DAOs)
        request.setAttribute("idSolicitud", idParam);
        request.setAttribute("nombreInquilino", "Carlos Ruiz");
        request.setAttribute("emailInquilino", "carlos@ejemplo.com");
        request.setAttribute("tituloHabitacion", "Habitación luminosa en el centro");
        request.setAttribute("direccion", "Calle Francia, 12");
        request.setAttribute("ciudad", "Vitoria-Gasteiz");
        request.setAttribute("precio", "380");
        request.setAttribute("fechaInicio", "2025-10-01");
        request.setAttribute("fechaFin", "2026-10-01");
        request.setAttribute("mensaje", "Hola, estoy muy interesado en la habitación para mi último año de carrera.");
        request.setAttribute("imagenUrl", "https://via.placeholder.com/400");
        request.setAttribute("estado", "Pendiente");

        request.getRequestDispatcher("DetalleSolicitudPropietario.jsp").forward(request, response);
    }

    // 2. PROCESAR ACCIÓN (Aceptar o Rechazar)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String idSolicitud = request.getParameter("idSolicitud");
        String accion = request.getParameter("accion"); // "aceptar" o "rechazar"

        if ("aceptar".equals(accion)) {
            // Lógica: 
            // 1. Crear nuevo registro en tabla ALQUILERES
            // 2. Borrar o marcar como aceptada en tabla SOLICITUDES
            response.sendRedirect("MisAlquileres.jsp?exito=contrato_creado");
        } else {
            // Lógica: Borrar solicitud
            response.sendRedirect("SolicitudesPropietario.jsp?info=rechazada");
        }
    }
}