package packServlets;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/DetalleHabitacionServlet")
public class DetalleHabitacionServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String idParam = request.getParameter("id");
        if (idParam == null || idParam.isEmpty()) {
            response.sendRedirect("MisHabitacionesServlet");
            return;
        }

        // -------------------------------
        // 1) Gestionar URL de vuelta
        // -------------------------------
        String back = request.getParameter("back");

        // Si no viene back, intenta usar Referer (plan B)
        if (back == null || back.isBlank()) {
            String referer = request.getHeader("Referer");
            if (referer != null && !referer.isBlank()) {
                request.setAttribute("volverUrl", referer);
            } else {
                request.setAttribute("volverUrl", "MisHabitacionesServlet");
            }
        } else {
            // back puede ser "MisHospedajesServlet" o "MisHabitacionesServlet" o incluso "Busqueda"
            // Si además quieres conservar parámetros, puedes pasar back ya con querystring.
            request.setAttribute("volverUrl", back);
        }

        // -------------------------------
        // 2) Lógica de recuperación (SIMULADA)
        // -------------------------------
        // Aquí más adelante harás SQL real con codHabi = idParam
        request.setAttribute("codHabi", idParam);
        request.setAttribute("direccion", "Avenida de Gasteiz, 22");
        request.setAttribute("ciudad", "Vitoria-Gasteiz");
        request.setAttribute("precioMes", "400"); // mejor como número/string sin €/mes
        request.setAttribute("latitudH", "42.8467");
        request.setAttribute("longitudH", "-2.6716");
        request.setAttribute("imagenHabitacion", "https://via.placeholder.com/600x400");

        // -------------------------------
        // 3) Enviar al JSP
        // -------------------------------
        request.getRequestDispatcher("DetalleHabitacion.jsp").forward(request, response);
    }
}