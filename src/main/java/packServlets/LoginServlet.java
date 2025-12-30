/**
 *
 * @author Resen
 */

package packServlets;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import utils.DB;

public class LoginServlet extends HttpServlet {

    // Definimos la clave como constante para poder usarla en todo el proyecto
    public static final String CLAVE_SESION_EMAIL = "emailUsuario";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String email = request.getParameter("email");
        String pass = request.getParameter("password");

        try (Connection conn = DB.getConexion()) {
            // Consulta para validar usuario
            String sqlUser = "SELECT email, nombre, imagenUsuario FROM usuario WHERE email = ? AND contraseña = ?";
            PreparedStatement psUser = conn.prepareStatement(sqlUser);
            psUser.setString(1, email);
            psUser.setString(2, pass);
            
            ResultSet rsUser = psUser.executeQuery();

            if (rsUser.next()) {
                // --- LOGIN EXITOSO ---
                // Forzamos la creación de una sesión nueva y limpia
                HttpSession session = request.getSession(true);
                
                String userEmail = rsUser.getString("email");
                
                // Guardamos los datos en la sesión (Nombres exactos que buscará el JSP)
                session.setAttribute(CLAVE_SESION_EMAIL, userEmail);
                session.setAttribute("nombreUsuario", rsUser.getString("nombre"));
                session.setAttribute("fotoUsuario", rsUser.getString("imagenUsuario"));

                // --- DETERMINAR ROL ---
                String sqlOwner = "SELECT COUNT(*) as total FROM habitacion WHERE emailPropietario = ?";
                PreparedStatement psOwner = conn.prepareStatement(sqlOwner);
                psOwner.setString(1, userEmail);
                ResultSet rsOwner = psOwner.executeQuery();
                
                boolean esPropietario = false;
                if (rsOwner.next() && rsOwner.getInt("total") > 0) {
                    esPropietario = true;
                }
                session.setAttribute("esPropietario", esPropietario);

                // IMPORTANTE: Asegúrate de que este archivo exista o cámbialo a tu página principal
                response.sendRedirect("ListaHabitaciones.jsp");
                
            } else {
                // LOGIN FALLIDO
                response.sendRedirect("Login.jsp?error=1");
            }

        } catch (Exception e) {
            e.printStackTrace(); 
            response.sendRedirect("Login.jsp?error=server");
        }
    }
}                                                                                                                       