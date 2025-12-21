<%-- 
    Document   : SolicitarGeolocalizacion
    Created on : 20 dic 2025, 7:55:56 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.sql.*, utils.DB, java.util.Date, java.text.SimpleDateFormat" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalle habitación – VitoBadi</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="Css/style.css">
</head>
<body class="bg-gray-100 font-sans flex flex-col min-h-screen">

    <jsp:include page="navbar.jsp" />

    <%
        // 1. OBTENER PARÁMETROS Y SESIÓN
        String idHabStr = request.getParameter("id");
        String emailUsuario = (String) session.getAttribute("emailUsuario");
        boolean logeado = (emailUsuario != null);
        
        Connection conn = DB.getConexion();
        ResultSet rsHab = null;
        boolean yaSolicitada = false;
        boolean esPropietario = false;

        if (idHabStr != null) {
            int idHab = Integer.parseInt(idHabStr);

            // 2. PROCESAR ACCIÓN DE SOLICITAR (Si se ha pulsado el botón)
            if (request.getParameter("accion") != null && request.getParameter("accion").equals("solicitar") && logeado) {
                try {
                    String sqlInsert = "INSERT INTO solicitud (idHabitacion, emailInquilinoPosible, fechaSolicitud, estado) VALUES (?, ?, ?, 'PENDIENTE')";
                    PreparedStatement psIns = conn.prepareStatement(sqlInsert);
                    psIns.setInt(1, idHab);
                    psIns.setString(2, emailUsuario);
                    psIns.setString(3, new SimpleDateFormat("yyyy-MM-dd").format(new Date()));
                    psIns.executeUpdate();
                    response.sendRedirect("SolicitarGeolocalizacion.jsp?id=" + idHab + "&msg=ok");
                    return;
                } catch (SQLException e) {
                    // Probablemente ya existe la solicitud (PK duplicada o error)
                }
            }

            // 3. CARGAR DATOS DE LA HABITACIÓN
            PreparedStatement psHab = conn.prepareStatement("SELECT * FROM habitacion WHERE idHabitacion = ?");
            psHab.setInt(1, idHab);
            rsHab = psHab.executeQuery();

            // 4. COMPROBAR ESTADO DE SOLICITUD Y PROPIEDAD
            if (logeado) {
                PreparedStatement psCheck = conn.prepareStatement("SELECT idSolicitud FROM solicitud WHERE idHabitacion = ? AND emailInquilinoPosible = ?");
                psCheck.setInt(1, idHab);
                psCheck.setString(2, emailUsuario);
                ResultSet rsCheck = psCheck.executeQuery();
                if (rsCheck.next()) yaSolicitada = true;
            }
        }
    %>

    <main class="flex-grow py-10">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

            <% if (rsHab != null && rsHab.next()) { 
                esPropietario = logeado && emailUsuario.equals(rsHab.getString("emailPropietario"));
            %>
                <header class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800"><%= rsHab.getString("direccion") %></h1>
                        <p class="text-indigo-600 font-medium">Detalle de la habitación seleccionada</p>
                    </div>
                    <a href="Ubicacion.jsp" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold transition">
                        Volver al mapa
                    </a>
                </header>

                <section class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
                    <div class="md:w-1/2 relative h-80 md:h-auto">
                        <img src="<%= rsHab.getString("imagen") %>" 
                             class="w-full h-full object-cover <%= !logeado ? "blur-md" : "" %>" 
                             alt="Habitación">
                        <% if (!logeado) { %>
                            <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                                <span class="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">Inicia sesión para ver la imagen</span>
                            </div>
                        <% } %>
                    </div>

                    <div class="md:w-1/2 p-8 flex flex-col justify-between">
                        <div class="space-y-4">
                            <div class="flex justify-between items-start">
                                <span class="text-3xl font-black text-indigo-700"><%= rsHab.getDouble("precio") %> €<span class="text-sm text-gray-400 font-normal">/mes</span></span>
                                <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase"><%= rsHab.getString("ciudad") %></span>
                            </div>
                            
                            <hr class="border-gray-100">

                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p class="text-gray-400 font-bold uppercase text-[10px]">Dirección</p>
                                    <p class="text-gray-700 font-medium"><%= rsHab.getString("direccion") %></p>
                                </div>
                                <div>
                                    <p class="text-gray-400 font-bold uppercase text-[10px]">Tamaño</p>
                                    <p class="text-gray-700 font-medium"><%= rsHab.getInt("tamano") %> m²</p>
                                </div>
                            </div>

                            <div>
                                <p class="text-gray-400 font-bold uppercase text-[10px] mb-1">Descripción</p>
                                <p class="text-gray-600 leading-relaxed">
                                    <%= rsHab.getString("descripcion") != null ? rsHab.getString("descripcion") : "Sin descripción adicional." %>
                                </p>
                            </div>
                        </div>

                        <div class="mt-8 pt-6 border-t border-gray-100">
                            <% if (!logeado) { %>
                                <a href="Login.jsp" class="block w-full text-center bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg transition">
                                    Inicia sesión para solicitar
                                </a>
                            <% } else if (esPropietario) { %>
                                <button disabled class="w-full bg-gray-400 text-white font-bold py-3 rounded-xl cursor-not-allowed">
                                    Esta es tu propiedad
                                </button>
                            <% } else if (yaSolicitada || "ok".equals(request.getParameter("msg"))) { %>
                                <button disabled class="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-inner">
                                    ✓ Solicitud enviada correctamente
                                </button>
                            <% } else { %>
                                <form action="SolicitarGeolocalizacion.jsp" method="POST">
                                    <input type="hidden" name="id" value="<%= idHabStr %>">
                                    <input type="hidden" name="accion" value="solicitar">
                                    <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg transform hover:-translate-y-1 transition duration-200">
                                        Solicitar esta habitación
                                    </button>
                                </form>
                            <% } %>
                            
                            <p class="text-center text-[11px] text-gray-400 mt-3">
                                Al solicitar, el propietario recibirá tu interés y podrá contactarte.
                            </p>
                        </div>
                    </div>
                </section>

            <% } else { %>
                <div class="bg-white p-12 rounded-2xl shadow-md text-center">
                    <h2 class="text-2xl font-bold text-gray-400">Habitación no encontrada</h2>
                    <a href="Ubicacion.jsp" class="text-indigo-600 hover:underline mt-4 inline-block">Volver al mapa</a>
                </div>
            <% } %>

            <% if (conn != null) conn.close(); %>
        </div>
    </main>

    <jsp:include page="footer.jsp" />
</body>
</html>