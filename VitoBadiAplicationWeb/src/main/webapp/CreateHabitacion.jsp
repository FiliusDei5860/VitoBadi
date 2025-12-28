<%-- 
    Document   : CreateHabitacion
    Created on : 20 dic 2025, 6:45:55 p.m.
    Author     : Resen
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>VitoBadi - Crear Nueva Habitación</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="./Css/style.css">
</head>
<body class="bg-gray-100 font-sans flex flex-col min-h-screen">

    <jsp:include page="NavBar.jsp" />

    <main class="container mx-auto my-10 px-4 max-w-4xl flex-grow">
        <h1 class="text-3xl font-bold text-indigo-700 text-center mb-2">Crear Nueva Habitación</h1>
        <p class="text-center text-gray-600 mb-8">Introduce los datos de tu nueva habitación.</p>

        <form action="CrearHabitacionServlet" method="POST" enctype="multipart/form-data">

            <fieldset class="border-t border-gray-200 pt-4">
                <legend class="text-lg font-bold text-gray-700 px-2">Información Básica</legend>
                <div class="grid grid-cols-1 gap-4 mt-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Título:</label>
                        <input type="text" name="titulo" required class="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    </div>
                    
                    <div class="w-1/3">
                        <label class="block text-sm font-medium text-gray-700">Precio mensual (€):</label>
                        <input type="number" name="precio" required min="1" step="0.01" class="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    </div>
                </div>
            </fieldset>

            <fieldset class="border-t border-gray-200 pt-4">
                <legend class="text-lg font-bold text-gray-700 px-2">Ubicación</legend>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Dirección completa:</label>
                        <input type="text" name="direccion" required class="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Ciudad:</label>
                        <input type="text" name="ciudad" required class="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    </div>
                   
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Latitud:</label>
                        <input type="text" name="latitud" placeholder="0.0000" class="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Longitud:</label>
                        <input type="text" name="longitud" placeholder="0.0000" class="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    </div>
                    
                </div>
            </fieldset>

            <fieldset class="border-t border-gray-200 pt-4">
                <legend class="text-lg font-bold text-gray-700 px-2">Imágenes</legend>
                <div class="mt-4">
                    <input type="file" id="imagenes" name="imagenes" accept="image/*" multiple class="hidden">
                    <div id="drop-zone" class="border-2 border-dashed border-gray-400 p-8 rounded-lg text-center cursor-pointer hover:bg-indigo-50 transition">
                        <p class="text-gray-500">Arrastra imágenes aquí o haz clic para seleccionar</p>
                    </div>
                    <div id="preview-container" class="grid grid-cols-4 gap-4 mt-4"></div>
                </div>
            </fieldset>

            <div class="flex justify-end gap-4">
                <a href="MisHabitaciones.jsp" class="px-6 py-2 border rounded-md text-gray-600 hover:bg-gray-100">Cancelar</a>
                <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 shadow-lg">
                    Guardar Habitación
                </button>
            </div>
        </form>
    </main>

    <jsp:include page="Footer.jsp" />

    <script>
        const dropZone = document.getElementById('drop-zone');
        const inputFiles = document.getElementById('imagenes');
        const preview = document.getElementById('preview-container');

        dropZone.addEventListener('click', () => inputFiles.click());
        inputFiles.addEventListener('change', updatePreview);

        function updatePreview() {
            preview.innerHTML = '';
            Array.from(inputFiles.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = "w-full h-24 object-cover rounded border";
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        }
    </script>
</body>
</html>