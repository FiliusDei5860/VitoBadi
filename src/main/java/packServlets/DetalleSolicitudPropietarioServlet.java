/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package packServlets;

import java.io.IOException;
import java.sql.*;
import utils.DB;
import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class DetalleSolicitudPropietarioServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String idSolicitud = request.getParameter("idSolicitud");
        String accion = request.getParameter("accion");

        try (Connection conn = DB.getConexion()) {
            if ("aceptar".equals(accion)) {
                // 1. OBTENER DATOS DE LA SOLICITUD
                String sqlGet = "SELECT * FROM solicitud WHERE idSolicitud = ?";
                PreparedStatement psGet = conn.prepareStatement(sqlGet);
                psGet.setInt(1, Integer.parseInt(idSolicitud));
                ResultSet rs = psGet.executeQuery();

                if (rs.next()) {
                    int codHabi = rs.getInt("codHabi");
                    String inq = rs.getString("emailInquilino");
                    String fIni = rs.getString("fechaIniPosibleAlquiler");
                    String fFin = rs.getString("fechaFinPosibleAlquiler");

                    // 2. VALIDACIÓN DE SOLAPAMIENTO
                    // Comprobamos si hay algún alquiler ya existente que choque con estas fechas
                    String sqlCheck = "SELECT COUNT(*) FROM alquiler WHERE codHabi = ? " +
                                     "AND (? < fechaFin AND ? > fechaInicio)";
                    PreparedStatement psCheck = conn.prepareStatement(sqlCheck);
                    psCheck.setInt(1, codHabi);
                    psCheck.setString(2, fIni);
                    psCheck.setString(3, fFin);
                    ResultSet rsCheck = psCheck.executeQuery();
                    rsCheck.next();

                    if (rsCheck.getInt(1) > 0) {
                        // Si hay choque de fechas, volvemos con aviso
                        response.sendRedirect("SolicitudesPropietario.jsp?error=solapamiento");
                        return;
                    }

                    // 3. INSERTAR EN TABLA ALQUILER
                    String sqlIns = "INSERT INTO alquiler (codHabi, emailInquilino, fechaInicio, fechaFin) VALUES (?,?,?,?)";
                    PreparedStatement psIns = conn.prepareStatement(sqlIns);
                    psIns.setInt(1, codHabi);
                    psIns.setString(2, inq);
                    psIns.setString(3, fIni);
                    psIns.setString(4, fFin);
                    psIns.executeUpdate();

                    // 4. ACTUALIZAR ESTADOS (Regla: Aceptar una y rechazar el resto de la habitación)
                    // Aceptamos la actual
                    conn.createStatement().executeUpdate("UPDATE solicitud SET estado='aceptada' WHERE idSolicitud=" + idSolicitud);
                    
                    // Rechazamos automáticamente todas las demás PENDIENTES de esa misma habitación
                    String sqlRechazoMasivo = "UPDATE solicitud SET estado='rechazada' WHERE codHabi = ? AND estado='pendiente'";
                    PreparedStatement psRechazo = conn.prepareStatement(sqlRechazoMasivo);
                    psRechazo.setInt(1, codHabi);
                    psRechazo.executeUpdate();

                    response.sendRedirect("SolicitudesPropietario.jsp?exito=alquilado");
                }
            } else {
                // Si la acción es RECHAZAR
                conn.createStatement().executeUpdate("UPDATE solicitud SET estado='rechazada' WHERE idSolicitud=" + idSolicitud);
                response.sendRedirect("SolicitudesPropietario.jsp?info=rechazada");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("SolicitudesPropietario.jsp?error=db");
        }
    }
}