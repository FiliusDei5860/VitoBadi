// JavaScript/solicitudesPropietario.js
// Solicitudes recibidas para habitaciones del propietario (IndexedDB)

document.addEventListener("DOMContentLoaded", async () => {
  const cont = document.getElementById("lista-solicitudes-prop");
  const msg  = document.getElementById("msg-no-solicitudes");
  if (!cont) return;

  // usuario logeado
  let usuarioActual = null;
  try {
    const raw = sessionStorage.getItem("usuarioActual");
    usuarioActual = raw ? JSON.parse(raw) : null;
  } catch (e) {}
  if (!usuarioActual?.email) {
    cont.innerHTML = "<p>Debes iniciar sesión.</p>";
    return;
  }

  try {
    const db = await abrirBD();

    const [solicitudes, habitaciones, usuarios] = await Promise.all([
      getAllFromStore(db, STORE_SOLICITUD),
      getAllFromStore(db, STORE_HABITACION),
      getAllFromStore(db, STORE_USUARIO),
    ]);

    const mapaHab = new Map(habitaciones.map(h => [h.idHabitacion, h]));
    const mapaUsr = new Map(usuarios.map(u => [u.email, u]));

    // solicitudes cuyas habitaciones son mías
    const mias = solicitudes.filter(s => {
      const hab = mapaHab.get(s.idHabitacion);
      return hab && hab.emailPropietario === usuarioActual.email; // <- ESTE es tu campo real :contentReference[oaicite:3]{index=3}
    });

    cont.innerHTML = "";
    if (mias.length === 0) {
      msg?.classList.remove("hidden");
      return;
    }
    msg?.classList.add("hidden");

    // opcional: ordenar por fecha si existe
    mias.sort((a,b) => {
      const fa = a.fechaSolicitud || a.fecha || "";
      const fb = b.fechaSolicitud || b.fecha || "";
      return fb.localeCompare(fa);
    });

    mias.forEach(sol => {
      const hab = mapaHab.get(sol.idHabitacion);
      const inq = mapaUsr.get(sol.emailInquilinoPosible);

      const card = document.createElement("article");
      card.className = "solicitud-card";

      const left = document.createElement("div");
      left.className = "solicitud-info-group";

      const img = document.createElement("div");
      img.className = "solicitud-imagen-placeholder";
      const imgSrc =
        (Array.isArray(hab?.imagenes) && hab.imagenes[0]) ||
        hab?.imagen ||
        null;
      if (imgSrc) {
        img.style.backgroundImage = `url('${imgSrc}')`;
        img.style.backgroundSize = "cover";
        img.style.backgroundPosition = "center";
      }

      const text = document.createElement("div");
      const tituloHab = hab?.titulo || hab?.direccion || `Hab ${sol.idHabitacion}`;
      const ciudadTxt = hab?.ciudad || "-";
      const precioTxt = hab?.precio != null ? `${hab.precio} €/mes` : "-";
      const nombreInq = inq?.nombre || sol.emailInquilinoPosible;

      const fechaTxt =
        sol.fechaSolicitud || sol.fecha || sol.createdAt || "";

      text.innerHTML = `
        <h4 class="solicitud-titulo">${tituloHab}</h4>
        <p class="solicitud-secundario">${hab?.direccion || ""} – ${ciudadTxt}</p>
        <p class="font-bold text-indigo-600">${precioTxt}</p>
        <p class="text-xs mt-1"><strong>Inquilino:</strong> ${nombreInq}</p>
        ${fechaTxt ? `<p class="text-xs text-gray-500">Recibida: ${fechaTxt}</p>` : ""}
      `;

      left.appendChild(img);
      left.appendChild(text);

      const right = document.createElement("div");
      right.className = "flex flex-col gap-2 min-w-[150px]";

      const estado = sol.estado || "Pendiente";
      const badge = document.createElement("span");
      const base = "px-3 py-1 rounded-full text-xs font-semibold text-center ";
      badge.className =
        estado === "Aceptada"  ? base + "bg-green-100 text-green-700" :
        estado === "Rechazada" ? base + "bg-red-100 text-red-700" :
                                 base + "bg-yellow-100 text-yellow-700";
      badge.textContent = `Estado: ${estado}`;

      const btnVer = document.createElement("button");
      btnVer.className = "btn btn-secondary";
      btnVer.textContent = "Ver detalle";
      btnVer.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `DetalleSolicitudPropietario.html?id=${sol.idSolicitud}`;
      });

      right.appendChild(badge);
      right.appendChild(btnVer);

      card.appendChild(left);
      card.appendChild(right);

      cont.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    cont.innerHTML = "<p>Error cargando solicitudes.</p>";
  }
});

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const st = tx.objectStore(storeName);
    const req = st.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = () => reject(req.error);
  });
}
