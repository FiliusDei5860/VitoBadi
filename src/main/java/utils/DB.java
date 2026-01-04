/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */


/**
 *
 * @author Resen
 */
package utils;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DB {
    private static Connection conn = null;
    private static final String URL = "jdbc:mysql://localhost:3306/vitobadi01test?serverTimezone=UTC";
//    
//    // Configuración para MySQL Workbench IVAN
//    private static final String USER = "root"; 
//    private static final String PASS = "root"; 
    
    // Configuración para MySQL Workbench Diego
    private static final String USER = "root"; 
    private static final String PASS = "choPin"; 

    public static Connection getConexion() {
        try {
            if (conn == null || conn.isClosed()) {
                // Registrar el Driver (Crítico para entornos web)
                Class.forName("com.mysql.cj.jdbc.Driver"); 
                conn = DriverManager.getConnection(URL, USER, PASS);
                System.out.println("✅ Conexión establecida con vitobadi01");
            }
        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("❌ ERROR EN CONEXIÓN: " + e.getMessage());
        }
        return conn;
    }
}