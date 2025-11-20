// JavaScript/misHabitaciones.js
// Datos mock (ya que la BD aún no existe)

const MIS_HABITACIONES = [
    {
        idHabi: 1,
        titulo: "Habitación luminosa",
        ciudad: "Vitoria-Gasteiz",
        direccion: "C/ Gorbea 12, 3ºA",
        precio: 350,
        estado: "Disponible",
        imagen: "./Public_icons/hab1.png"
    },
    {
        idHabi: 2,
        titulo: "Habitación cerca de UPV/EHU",
        ciudad: "Bilbao",
        direccion: "Gran Vía 25",
        precio: 420,
        estado: "Alquilada",
        imagen: "./Public_icons/hab1.png"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    let habitaciones = [...MIS_HABITACIONES];

    const cont = document.getElementById("lista-mis-habitaciones");
    const msg = document.getElementById("mensaje-sin-habitaciones");

    function pintar() {
        cont.innerHTML = "";

        if (habitations = habitaciones.length === 0) {
            msg.classList.remove("hidden");
            return;
        }

        msg.classList.add("hidden");

        habitaciones.forEach(h => {
            const card = document.createElement("div");
            card.className = "solicitud-card";

            const info = document.createElement("div");
            info.className = "solicitud-info-group";

            const img = document.createElement("div");
            img.className = "solicitud-imagen-placeholder";
            img.style.backgroundImage = `url('${h.imagen}')`;
            img.style.backgroundSize = "cover";

            const texto = document.createElement("div");
            texto.innerHTML = `
                <h4 class="solicitud-titulo">${h.titulo}</h4>
                <p class="solicitud-secundario">
                    ${h.direccion} – ${h.ciudad}
                </p>
                <p class="font-bold text-indigo-600">${h.precio} €/mes</p>
                <p class="text-xs mt-1">
                    <strong>Estado:</strong>
                    <span class="${h.estado === "Disponible" ? "text-green-600" : "text-red-600"}">
                        ${h.estado}
                    </span>
                </p>
            `;

            info.appendChild(img);
            info.appendChild(texto);

            const acciones = document.createElement("div");
            acciones.className = "flex flex-col gap-2";

            const btnVer = document.createElement("a");
            btnVer.href = `DetalleHabitacion.html?id=${encodeURIComponent(h.idHabi)}`;
            btnVer.className = "btn btn-secondary text-center";
            btnVer.textContent = "Ver";

            const btnEditar = document.createElement("a");
            btnEditar.href = `ActualizarHabitacion.html?id=${encodeURIComponent(h.idHabi)}`;
            btnEditar.className = "btn btn-primary text-center";
            btnEditar.textContent = "Editar";

            const btnEliminar = document.createElement("button");
            btnEliminar.className = "btn btn-primary bg-red-600 hover:bg-red-700 text-white";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.onclick = () => {
                if (confirm("¿Seguro que quieres eliminar esta habitación? (solo mock)")) {
                    habitaciones = habitaciones.filter(x => x.idHabi !== h.idHabi);
                    pintar();
                }
            };

            acciones.appendChild(btnVer);
            acciones.appendChild(btnEditar);
            acciones.appendChild(btnEliminar);

            card.appendChild(info);
            card.appendChild(acciones);
            cont.appendChild(card);
        });
    }

    pintar();
});
