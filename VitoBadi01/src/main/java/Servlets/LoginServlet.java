package servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import utils.DB;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String email = request.getParameter("email");
        String pass = request.getParameter("password");

        try (Connection conn = DB.getConexion()) {
            // 1. Validar credenciales
            String sqlUser = "SELECT email, nombre, foto FROM usuario WHERE email = ? AND password = ?";
            PreparedStatement psUser = conn.prepareStatement(sqlUser);
            psUser.setString(1, email);
            psUser.setString(2, pass);
            
            ResultSet rsUser = psUser.executeQuery();

            if (rsUser.next()) {
                // LOGIN EXITOSO
                HttpSession session = request.getSession();
                
                String userEmail = rsUser.getString("email");
                session.setAttribute("emailUsuario", userEmail);
                session.setAttribute("nombreUsuario", rsUser.getString("nombre"));
                session.setAttribute("fotoUsuario", rsUser.getString("foto"));

                // 2. DETERMINAR ROL: ¿Es propietario? 
                // Miramos si tiene al menos una habitación registrada en la tabla habitacion
                String sqlOwner = "SELECT COUNT(*) as total FROM habitacion WHERE emailPropietario = ?";
                PreparedStatement psOwner = conn.prepareStatement(sqlOwner);
                psOwner.setString(1, userEmail);
                ResultSet rsOwner = psOwner.executeQuery();
                
                boolean esPropietario = false;
                if (rsOwner.next() && rsOwner.getInt("total") > 0) {
                    esPropietario = true;
                }
                session.setAttribute("esPropietario", esPropietario);

                // Redirigimos a la página principal de búsqueda/listado
                response.sendRedirect("ListaHabitaciones.jsp");
                
            } else {
                // LOGIN FALLIDO: Credenciales incorrectas
                response.sendRedirect("Login.jsp?error=1");
            }

        } catch (Exception e) {
            e.printStackTrace();
            // Error de conexión o SQL
            response.sendRedirect("Login.jsp?error=server");
        }
    }
}