// Mock de solicitudes del inquilino actual

let SOLICITUDES_INQUILINO = [
    {
        id: 1,
        titulo: "Habitación luminosa",
        direccion: "C/ Gorbea 12",
        ciudad: "Vitoria-Gasteiz",
        precio: 350,
        imagen: "./Public_icons/hab1.png",
        propietarioNombre: "Propietario 1",
        propietarioEmail: "prop1@vitobadi.com",
        propietarioTelefono: "600 111 222",
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
        propietarioNombre: "Propietario 2",
        propietarioEmail: "prop2@vitobadi.com",
        propietarioTelefono: "600 333 444",
        fechaInicio: "2025-03-15",
        fechaFin: "2025-07-15",
        estado: "Aceptada"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const cont = document.getElementById("lista-solicitudes-inq");
    const msg = document.getElementById("msg-no-solicitudes-inq");

    function render() {
        cont.innerHTML = "";

        if (SOLICITUDES_INQUILINO.length === 0) {
            msg.classList.remove("hidden");
            return;
        }
        msg.classList.add("hidden");

        SOLICITUDES_INQUILINO.forEach(sol => {
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
                <p class="text-xs mt-1">
                    <strong>Desde:</strong> ${sol.fechaInicio} – 
                    <strong>Hasta:</strong> ${sol.fechaFin}
                </p>
            `;

            left.appendChild(img);
            left.appendChild(text);

            const right = document.createElement("div");
            right.className = "flex flex-col gap-2 min-w-[150px]";

            const badge = document.createElement("span");
            const base = "px-3 py-1 rounded-full text-xs font-semibold text-center ";
            if (sol.estado === "Aceptada") {
                badge.className = base + "bg-green-100 text-green-700";
            } else if (sol.estado === "Rechazada") {
                badge.className = base + "bg-red-100 text-red-700";
            } else {
                badge.className = base + "bg-yellow-100 text-yellow-700";
            }
            badge.textContent = `Estado: ${sol.estado}`;

            const contacto = document.createElement("p");
            contacto.className = "text-xs text-gray-600";
            if (sol.estado === "Aceptada") {
                contacto.innerHTML = `
                    <strong>Contacto propietario:</strong><br>
                    ${sol.propietarioNombre}<br>
                    Tel: ${sol.propietarioTelefono}<br>
                    Email: ${sol.propietarioEmail}
                `;
            } else {
                contacto.textContent = "Verás los datos de contacto cuando la solicitud esté aceptada.";
            }

            const btnModificar = document.createElement("button");
            btnModificar.className = "btn btn-secondary";
            btnModificar.textContent = "Modificar (demo)";
            btnModificar.onclick = () => {
                alert("US11 – Modificar solicitud (demo, sin BD).");
            };

            const btnEliminar = document.createElement("button");
            btnEliminar.className = "btn btn-primary";
            btnEliminar.style.backgroundColor = "#dc2626";
            btnEliminar.style.border = "none";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.onclick = () => {
                if (confirm("¿Eliminar esta solicitud? (US12 – demo)")) {
                    SOLICITUDES_INQUILINO = SOLICITUDES_INQUILINO.filter(x => x.id !== sol.id);
                    render();
                }
            };

            right.appendChild(badge);
            right.appendChild(contacto);
            right.appendChild(btnModificar);
            right.appendChild(btnEliminar);

            card.appendChild(left);
            card.appendChild(right);

            cont.appendChild(card);
        });
    }

    render();
});
