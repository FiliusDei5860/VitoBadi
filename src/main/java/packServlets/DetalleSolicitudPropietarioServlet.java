/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
    */

package packServlets;

import java.io.IOException;
import java.sql.*;
import utils.DB;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/DetalleSolicitudPropietarioServlet")
public class DetalleSolicitudPropietarioServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        String idSolicitud = request.getParameter("idSolicitud");
        String accion = request.getParameter("accion");

        try (Connection conn = DB.getConexion()) {
            if ("aceptar".equals(accion)) {
                // 1. OBTENER DATOS (Según tu imagen: fechaIniPosibleAlquiler, fechaFinPosibleAlquiler)
                String sqlGet = "SELECT * FROM solicitud WHERE idSolicitud = ?";
                PreparedStatement psGet = conn.prepareStatement(sqlGet);
                psGet.setInt(1, Integer.parseInt(idSolicitud));
                ResultSet rs = psGet.executeQuery();

                if (rs.next()) {
                    int codHabi = rs.getInt("codHabi");
                    String inq = rs.getString("emailInquilino");
                    String fIni = rs.getString("fechaIniPosibleAlquiler");
                    String fFin = rs.getString("fechaFinPosibleAlquiler");

                    // 2. VALIDACIÓN DE SOLAPAMIENTO (Usando nombres reales: fechaInicioAlqui, fechaFinAlqui)
                    String sqlCheck = "SELECT COUNT(*) FROM alquiler WHERE codHabi = ? " +
                                     "AND (? < fechaFinAlqui AND ? > fechaInicioAlqui)";
                    PreparedStatement psCheck = conn.prepareStatement(sqlCheck);
                    psCheck.setInt(1, codHabi);
                    psCheck.setString(2, fIni);
                    psCheck.setString(3, fFin);
                    ResultSet rsCheck = psCheck.executeQuery();
                    rsCheck.next();

                    if (rsCheck.getInt(1) > 0) {
                        response.sendRedirect("SolicitudesPropietario.jsp?error=solapamiento");
                        return;
                    }

                    // 3. INSERTAR EN ALQUILER (Nombres exactos de tu imagen)
                    String sqlIns = "INSERT INTO alquiler (codHabi, emailInquilino, fechaInicioAlqui, fechaFinAlqui) VALUES (?,?,?,?)";
                    PreparedStatement psIns = conn.prepareStatement(sqlIns);
                    psIns.setInt(1, codHabi);
                    psIns.setString(2, inq);
                    psIns.setString(3, fIni);
                    psIns.setString(4, fFin);
                    psIns.executeUpdate();

                    // 4. ACTUALIZAR ESTADOS
                    // Aceptamos la actual
                    PreparedStatement psUpdateAceptada = conn.prepareStatement("UPDATE solicitud SET estado='aceptada' WHERE idSolicitud=?");
                    psUpdateAceptada.setInt(1, Integer.parseInt(idSolicitud));
                    psUpdateAceptada.executeUpdate();

                    // Rechazamos automáticamente TODAS las demás de esa habitación
                    String sqlRechazoMasivo = "UPDATE solicitud SET estado='rechazada' WHERE codHabi = ? AND idSolicitud != ?";
                    PreparedStatement psRechazo = conn.prepareStatement(sqlRechazoMasivo);
                    psRechazo.setInt(1, codHabi);
                    psRechazo.setInt(2, Integer.parseInt(idSolicitud));
                    psRechazo.executeUpdate();

                    response.sendRedirect("SolicitudesPropietario.jsp?exito=alquilado");
                }
            } else {
                // ACCIÓN RECHAZAR
                PreparedStatement psRechazarManual = conn.prepareStatement("UPDATE solicitud SET estado='rechazada' WHERE idSolicitud=?");
                psRechazarManual.setInt(1, Integer.parseInt(idSolicitud));
                psRechazarManual.executeUpdate();
                response.sendRedirect("SolicitudesPropietario.jsp?info=rechazada");
            }
        } catch (Exception e) {
            e.printStackTrace(); // Esto imprimirá el error real en la consola de Tomcat/NetBeans
            response.sendRedirect("SolicitudesPropietario.jsp?error=db");
        }
    }
}