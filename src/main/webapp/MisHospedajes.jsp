<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List, java.util.Map" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mis hospedajes – VitoBadi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/jpeg" href="./Public_icons/VitoBadiIcon.jpg">
    <link rel="stylesheet" href="CSS/style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="flex flex-col min-h-screen bg-gray-100">
<jsp:include page="NavBar.jsp" />

<main class="flex-grow py-10">
    <div class="container mx-auto px-4 max-w-4xl">
        <h1 class="text-3xl font-bold text-center text-indigo-800 mb-2">Mis hospedajes</h1>
        <p class="text-center text-gray-600 mb-10">
            Aquí ves tus alquileres actuales y pasados como inquilino.
        </p>

        <%
            List<Map<String, String>> vigentes =
                (List<Map<String, String>>) request.getAttribute("vigentes");
            List<Map<String, String>> historico =
                (List<Map<String, String>>) request.getAttribute("historico");
        %>

        <!-- VIGENTES -->
        <section class="mb-10">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Alquileres vigentes</h2>

            <%
                if (vigentes == null || vigentes.isEmpty()) {
            %>
                <div class="bg-white p-6 rounded-xl shadow text-center">
                    <p class="text-gray-500">No tienes alquileres activos.</p>
                </div>
            <%
                } else {
                    for (Map<String, String> alq : vigentes) {
                        String codHabi = alq.get("codHabi");
            %>
            <article class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer"
                     onclick="if (event.target.closest('select, option, button, a, input, textarea, form, label')) return; window.location.href='DetalleHabitacion.jsp?id=<%= codHabi%>&returnTo=MisHospedajesServlet';">


                    <div class="flex flex-col md:flex-row p-4 gap-6 items-center">
                        <div class="w-full md:w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <img src="<%= alq.get("imagenHabitacion") %>" class="w-full h-full object-cover" alt="Habitación">
                        </div>

                        <div class="flex-grow">
                            <h3 class="text-xl font-bold text-gray-800 mb-1"><%= alq.get("direccion") %></h3>
                            <p class="text-indigo-600 text-sm font-medium mb-3">
                                <%= alq.get("ciudad") %> · <%= alq.get("precioMes") %> €/mes
                            </p>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                                <p><strong>Desde:</strong> <%= alq.get("fechaInicioAlqui") %></p>
                                <p><strong>Hasta:</strong> <%= alq.get("fechaFinAlqui") %></p>
                                <p class="md:col-span-2"><strong>Propietario:</strong> <%= alq.get("propietario") %></p>
                            </div>
                        </div>

                        <div class="text-indigo-400 font-bold hidden md:block">
                            Ver Detalle →
                        </div>
                    </div>
                </article>
            <%
                    }
                }
            %>
        </section>

        <!-- HISTÓRICO -->
        <section>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Historial de hospedajes</h2>

            <%
                if (historico == null || historico.isEmpty()) {
            %>
                <div class="bg-white p-6 rounded-xl shadow text-center">
                    <p class="text-gray-500">No tienes hospedajes anteriores.</p>
                </div>
            <%
                } else {
                    for (Map<String, String> alq : historico) {
                        String codHabi = alq.get("codHabi");
            %>
            <article class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer opacity-95"
                     onclick="if (event.target.closest('select, option, button, a, input, textarea, form, label')) return; window.location.href='DetalleHabitacion.jsp?id=<%= codHabi%>&returnTo=MisHospedajesServlet';">
                <div class="flex flex-col md:flex-row p-4 gap-6 items-center">
                        <div class="w-full md:w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <img src="<%= alq.get("imagenHabitacion") %>" class="w-full h-full object-cover" alt="Habitación">
                        </div>

                        <div class="flex-grow">
                            <h3 class="text-xl font-bold text-gray-800 mb-1"><%= alq.get("direccion") %></h3>
                            <p class="text-indigo-600 text-sm font-medium mb-3">
                                <%= alq.get("ciudad") %> · <%= alq.get("precioMes") %> €/mes
                            </p>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                                <p><strong>Desde:</strong> <%= alq.get("fechaInicioAlqui") %></p>
                                <p><strong>Hasta:</strong> <%= alq.get("fechaFinAlqui") %></p>
                                <p class="md:col-span-2"><strong>Propietario:</strong> <%= alq.get("propietario") %></p>
                            </div>
                        </div>
                        
                                <%
                                    String miP = alq.get("miPuntuacion");
                                    boolean yaPuntuado = (miP != null && !miP.trim().isEmpty());
                                %>

                                <div class="mt-3">
                                    <% if (yaPuntuado) {%>
                                    <p class="text-sm text-gray-700"><strong>Tu puntuación:</strong> <%= miP%>/5</p>
                                    <% } else {%>
                                    <form action="PuntuarHabitacion" method="post" class="flex items-center gap-2 mt-2"
                                          onclick="event.stopPropagation()" onmousedown="event.stopPropagation()">
                                        <input type="hidden" name="codHabi" value="<%= alq.get("codHabi")%>">
                                        <label class="text-sm text-gray-700 font-semibold">Puntúa:</label>
                                        <select name="puntos" required class="border rounded px-2 py-1 text-sm"
                                                onclick="event.stopPropagation()" onmousedown="event.stopPropagation()" onchange="event.stopPropagation()">
                                            <option value="" selected disabled>--</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                        </select>
                                        <button type="submit" class="bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700"
                                                onclick="event.stopPropagation()" onmousedown="event.stopPropagation()">
                                            Enviar
                                        </button>
                                    </form>
                                    <p class="text-xs text-gray-500 mt-1">Solo puedes puntuar una vez.</p>
                                    <% } %>
                                </div>


                        <div class="text-indigo-400 font-bold hidden md:block">
                            Ver Detalle →
                        </div>
                    </div>
                </article>
            <%
                    }
                }
            %>
        </section>

    </div>
</main>

<jsp:include page="Footer.jsp" />
</body>
</html>
