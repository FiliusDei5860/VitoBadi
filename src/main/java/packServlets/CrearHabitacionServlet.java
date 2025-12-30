package packServlets;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.*;

import utils.DB;

@MultipartConfig(
        fileSizeThreshold = 1024 * 1024, // 1MB
        maxFileSize = 5 * 1024 * 1024, // 5MB por archivo
        maxRequestSize = 20 * 1024 * 1024 // 20MB total
)
public class CrearHabitacionServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        String email = (session != null) ? (String) session.getAttribute("emailUsuario") : null;
        if (email == null) {
            response.sendRedirect("Login.jsp");
            return;
        }

        try {
            // 1) Datos del formulario
            String ciudadForm = request.getParameter("ciudad");
            String direccionForm = request.getParameter("direccion");

            double lat = parseDoubleSafe(request.getParameter("latitud"));
            double lon = parseDoubleSafe(request.getParameter("longitud"));

            // precioMes es INT en BD
            int precio = parseIntSafe(request.getParameter("precio"));

            // Validación mínima
            if (ciudadForm == null || ciudadForm.isBlank()
                    || direccionForm == null || direccionForm.isBlank()
                    || precio <= 0) {
                response.sendRedirect("CreateHabitacion.jsp?error=datos");
                return;
            }

            // 2) Imagen: guardamos SOLO 1 (la primera) como imagenHabitacion
            String rutaRelativaBD = "img/habitaciones/default.jpg";

            Part primeraImagen = getFirstFilePart(request, "imagenes");
            if (primeraImagen != null && primeraImagen.getSize() > 0) {

                String submitted = primeraImagen.getSubmittedFileName();
                String fileName = (submitted != null) ? Paths.get(submitted).getFileName().toString() : "";

                if (!fileName.isBlank()) {
                    String uploadPath = getServletContext().getRealPath("/") + "img" + File.separator + "habitaciones";
                    File uploadDir = new File(uploadPath);
                    if (!uploadDir.exists()) {
                        uploadDir.mkdirs();
                    }

                    // OJO: si se repite nombre, lo pisa. Si quieres evitarlo, le metemos prefijo con timestamp.
                    String safeName = System.currentTimeMillis() + "_" + fileName;

                    primeraImagen.write(uploadPath + File.separator + safeName);
                    rutaRelativaBD = "img/habitaciones/" + safeName;
                }
            }

            // 3) INSERT (dirección con backticks)
            String sql = "INSERT INTO habitacion (ciudad, `dirección`, emailPropietario, imagenHabitacion, latitudH, longitudH, precioMes) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?)";

            try (Connection conn = DB.getConexion(); PreparedStatement ps = conn.prepareStatement(sql)) {

                ps.setString(1, ciudadForm);
                ps.setString(2, direccionForm);
                ps.setString(3, email);
                ps.setString(4, rutaRelativaBD);
                ps.setDouble(5, lat);
                ps.setDouble(6, lon);
                ps.setInt(7, precio);

                ps.executeUpdate();
            }

            response.sendRedirect("MisHabitaciones.jsp?msg=success");

        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("CreateHabitacion.jsp?error=server");
        }
    }

    private Part getFirstFilePart(HttpServletRequest request, String fieldName) throws IOException, ServletException {
        for (Part p : request.getParts()) {
            if (fieldName.equals(p.getName()) && p.getSize() > 0) {
                return p;
            }
        }
        return null;
    }

    private double parseDoubleSafe(String v) {
        if (v == null || v.isBlank()) {
            return 0.0;
        }
        try {
            return Double.parseDouble(v.replace(",", "."));
        } catch (Exception e) {
            return 0.0;
        }
    }

    private int parseIntSafe(String v) {
        if (v == null || v.isBlank()) {
            return 0;
        }
        try {
            // Si viene "320.00" lo convertimos a int
            String s = v.replace(",", ".").trim();
            double d = Double.parseDouble(s);
            return (int) Math.round(d);
        } catch (Exception e) {
            return 0;
        }
    }
    
    
}
