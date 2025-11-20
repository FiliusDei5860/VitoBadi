// Mock de solicitudes sobre habitaciones del propietario

let SOLICITUDES_PROPIETARIO = [
    {
        id: 1,
        titulo: "Habitación luminosa",
        direccion: "C/ Gorbea 12",
        ciudad: "Vitoria-Gasteiz",
        precio: 350,
        imagen: "./Public_icons/hab1.png",
        inquilino: "Ane Arrieta",
        emailInquilino: "ane.arrieta@gmail.com",
        fechaInicio: "2025-02-01",
        fechaFin: "2025-06-30",
        estado: "Pendiente"
    },
    {
        id: 2,
        titulo: "Habitación cerca de UPV/EHU",
        direccion: "Gran Vía 25",
        ciudad: "Bilbao",
        precio: 420,
        imagen: "./Public_icons/hab1.png",
        inquilino: "Mikel Sarasola",
        emailInquilino: "mikel.sarasola@gmail.com",
        fechaInicio: "2025-03-15",
        fechaFin: "2025-07-15",
        estado: "Aceptada"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const cont = document.getElementById("lista-solicitudes-prop");
    const msg = document.getElementById("msg-no-solicitudes");

    function render() {
        cont.innerHTML = "";

        if (SOLICITUDES_PROPIETARIO.length === 0) {
            msg.classList.remove("hidden");
            return;
        }
        msg.classList.add("hidden");

        SOLICITUDES_PROPIETARIO.forEach(sol => {
            const card = document.createElement("div");
            card.className = "solicitud-card";

            const left = document.createElement("div");
            left.className = "solicitud-info-group";

            const img = document.createElement("div");
            img.className = "solicitud-imagen-placeholder";
            img.style.backgroundImage = `url('${sol.imagen}')`;
            img.style.backgroundSize = "cover";

            const text = document.createElement("div");
            text.innerHTML = `
                <h4 class="solicitud-titulo">${sol.titulo}</h4>
                <p class="solicitud-secundario">${sol.direccion} – ${sol.ciudad}</p>
                <p class="font-bold text-indigo-600">${sol.precio} €/mes</p>
                <p class="text-xs mt-1"><strong>Inquilino:</strong> ${sol.inquilino}</p>
                <p class="text-xs">${sol.fechaInicio} → ${sol.fechaFin}</p>
            `;

            left.appendChild(img);
            left.appendChild(text);

            const right = document.createElement("div");
            right.className = "flex flex-col gap-2 min-w-[150px]";

            const estadoBadge = document.createElement("span");
            const estado = sol.estado;
            const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold text-center ";
            if (estado === "Aceptada") {
                estadoBadge.className = baseClasses + "bg-green-100 text-green-700";
            } else if (estado === "Rechazada") {
                estadoBadge.className = baseClasses + "bg-red-100 text-red-700";
            } else {
                estadoBadge.className = baseClasses + "bg-yellow-100 text-yellow-700";
            }
            estadoBadge.textContent = `Estado: ${estado}`;

            const btnAceptar = document.createElement("button");
            btnAceptar.className = "btn btn-primary";
            btnAceptar.textContent = "Aceptar";
            btnAceptar.disabled = estado !== "Pendiente";

            btnAceptar.onclick = () => {
                sol.estado = "Aceptada"; // US07
                render();
            };

            const btnRechazar = document.createElement("button");
            btnRechazar.className = "btn btn-secondary";
            btnRechazar.textContent = "Rechazar";
            btnRechazar.disabled = estado !== "Pendiente";

            btnRechazar.onclick = () => {
                sol.estado = "Rechazada"; // US07
                render();
            };

            right.appendChild(estadoBadge);
            right.appendChild(btnAceptar);
            right.appendChild(btnRechazar);

            card.appendChild(left);
            card.appendChild(right);

            cont.appendChild(card);
        });
    }

    render();
});
