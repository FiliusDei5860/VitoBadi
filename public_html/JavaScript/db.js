// JavaScript/db.js
// CONFIGURACIÓN BASE DE INDEXEDDB PARA VITOBADI

// Nombre y versión de la BD
const DB_NAME = "vitobadi01";
const DB_VERSION = 1;

// Nombres de los object stores
const STORE_USUARIO    = "usuario";
const STORE_HABITACION = "habitacion";
const STORE_ALQUILER   = "alquiler";
const STORE_SOLICITUD  = "solicitud";

/**
 * Abre la BD. Si no existe o cambia la versión, crea los stores.
 */
function abrirBD() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("❌ Error abriendo IndexedDB:", event.target.error);
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log("📌 Creando/actualizando BD:", DB_NAME);

            // --- 1) USUARIO ---
            if (!db.objectStoreNames.contains(STORE_USUARIO)) {
                const store = db.createObjectStore(STORE_USUARIO, {
                    keyPath: "email"  // PK
                });
                store.createIndex("porNombre", "nombre", { unique: false });
            }

            // --- 2) HABITACION ---
            if (!db.objectStoreNames.contains(STORE_HABITACION)) {
                const store = db.createObjectStore(STORE_HABITACION, {
                    keyPath: "idHabitacion"
                });
                store.createIndex("porCiudad", "ciudad", { unique: false });
            }

            // --- 3) ALQUILER ---
            if (!db.objectStoreNames.contains(STORE_ALQUILER)) {
                const store = db.createObjectStore(STORE_ALQUILER, {
                    keyPath: "idContrato"
                });
                store.createIndex("porEmailInquilino", "emailInquilino", { unique: false });
            }

            // --- 4) SOLICITUD ---
            if (!db.objectStoreNames.contains(STORE_SOLICITUD)) {
                const store = db.createObjectStore(STORE_SOLICITUD, {
                    keyPath: "idSolicitud"
                });
                store.createIndex("porEmailInquilinoPosible", "emailInquilinoPosible", { unique: false });
            }

            // Usar la transacción de version change para meter datos de prueba
            const tx = event.target.transaction;
            inicializarDatosPrueba(tx);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log("✅ BD abierta correctamente:", DB_NAME);
            resolve(db);
        };
    });
}

/**
 * Auxiliar para obtener una store en modo lectura/escritura.
 */
function getObjectStore(db, storeName, mode = "readonly") {
    return db.transaction(storeName, mode).objectStore(storeName);
}

// ======================= DATOS DE PRUEBA =======================

const USUARIOS_PRUEBA = [
    { email: "ane.arrieta@gmail.com",   password: "aaa", nombre: "Ane Arrieta",   foto: null },
    { email: "ibon.bilbao@gmail.com",   password: "bbb", nombre: "Ibon Bilbao",   foto: null },
    { email: "maite.lopez@gmail.com",   password: "ccc", nombre: "Maite López",   foto: null },
    { email: "javier.garcia@gmail.com", password: "ddd", nombre: "Javier García", foto: null },
    { email: "nerea.uribe@gmail.com",   password: "eee", nombre: "Nerea Uribe",   foto: null },
    { email: "mikel.sarasola@gmail.com",password: "fff", nombre: "Mikel Sarasola",foto: null },
    { email: "leire.mendizabal@gmail.com",password:"ggg",nombre:"Leire Mendizabal",foto:null},
    { email: "andoni.saenz@gmail.com",  password: "hhh", nombre: "Andoni Sáenz",  foto: null }
];

const HABITACIONES_PRUEBA = [
    { idHabitacion: 1,  direccion:"C/ Gorbea 1", ciudad:"Vitoria-Gasteiz", latitud:42.846,longitud:-2.672,precio:320,imagen:null,emailPropietario:"ane.arrieta@gmail.com" },
    { idHabitacion: 2,  direccion:"C/ Gorbea 2", ciudad:"Vitoria-Gasteiz", latitud:42.847,longitud:-2.673,precio:350,imagen:null,emailPropietario:"ane.arrieta@gmail.com" },
    { idHabitacion: 3,  direccion:"Avda. Gasteiz 10", ciudad:"Vitoria-Gasteiz", latitud:42.845,longitud:-2.670,precio:375,imagen:null,emailPropietario:"ane.arrieta@gmail.com" },
    { idHabitacion: 4,  direccion:"Avda. Gasteiz 12", ciudad:"Vitoria-Gasteiz", latitud:42.844,longitud:-2.671,precio:390,imagen:null,emailPropietario:"ane.arrieta@gmail.com" },
    { idHabitacion: 5,  direccion:"C/ San Prudencio 5", ciudad:"Vitoria-Gasteiz", latitud:42.847,longitud:-2.671,precio:310,imagen:null,emailPropietario:"maite.lopez@gmail.com" },
    { idHabitacion: 6,  direccion:"C/ San Prudencio 8", ciudad:"Vitoria-Gasteiz", latitud:42.848,longitud:-2.672,precio:340,imagen:null,emailPropietario:"maite.lopez@gmail.com" },
    { idHabitacion: 7,  direccion:"C/ Los Herrán 20", ciudad:"Vitoria-Gasteiz", latitud:42.843,longitud:-2.668,precio:330,imagen:null,emailPropietario:"javier.garcia@gmail.com" },
    { idHabitacion: 8,  direccion:"C/ Los Herrán 25", ciudad:"Vitoria-Gasteiz", latitud:42.842,longitud:-2.667,precio:360,imagen:null,emailPropietario:"javier.garcia@gmail.com" },
    { idHabitacion: 9,  direccion:"C/ Francia 3", ciudad:"Vitoria-Gasteiz", latitud:42.846,longitud:-2.674,precio:295,imagen:null,emailPropietario:"nerea.uribe@gmail.com" },
    { idHabitacion:10,  direccion:"C/ Francia 7", ciudad:"Vitoria-Gasteiz", latitud:42.847,longitud:-2.675,precio:345,imagen:null,emailPropietario:"nerea.uribe@gmail.com" },
    { idHabitacion:11,  direccion:"Gran Vía 25", ciudad:"Bilbao", latitud:43.262,longitud:-2.935,precio:420,imagen:null,emailPropietario:"mikel.sarasola@gmail.com" },
    { idHabitacion:12,  direccion:"C/ Autonomía 14", ciudad:"Bilbao", latitud:43.261,longitud:-2.937,precio:390,imagen:null,emailPropietario:"mikel.sarasola@gmail.com" },
    { idHabitacion:13,  direccion:"C/ Miraconcha 5", ciudad:"Donostia-San Sebastián", latitud:43.314,longitud:-1.991,precio:480,imagen:null,emailPropietario:"ane.arrieta@gmail.com" },
    { idHabitacion:14,  direccion:"C/ Gros 10", ciudad:"Donostia-San Sebastián", latitud:43.323,longitud:-1.981,precio:430,imagen:null,emailPropietario:"andoni.saenz@gmail.com" }
];

const ALQUILERES_PRUEBA = [
    { idContrato:1, idHabitacion:1,  emailInquilino:"mikel.sarasola@gmail.com", fechaInicioAlquiler:"2025-01-01", fechaFinAlquiler:"2025-06-30" },
    { idContrato:2, idHabitacion:2,  emailInquilino:"nerea.uribe@gmail.com",     fechaInicioAlquiler:"2025-02-15", fechaFinAlquiler:"2025-08-15" },
    { idContrato:3, idHabitacion:11, emailInquilino:"ane.arrieta@gmail.com",      fechaInicioAlquiler:"2025-03-01", fechaFinAlquiler:"2025-09-30" }
];

const SOLICITUDES_PRUEBA = [
    { idSolicitud:1, idHabitacion:3,  emailInquilinoPosible:"leire.mendizabal@gmail.com" },
    { idSolicitud:2, idHabitacion:4,  emailInquilinoPosible:"andoni.saenz@gmail.com" },
    { idSolicitud:3, idHabitacion:13, emailInquilinoPosible:"maite.lopez@gmail.com" }
];

/**
 * Inserta los datos de prueba usando la transacción de onupgradeneeded.
 */
function inicializarDatosPrueba(tx) {
    console.log("📥 Insertando datos de prueba...");

    const tUsuario    = tx.objectStore(STORE_USUARIO);
    const tHabitacion = tx.objectStore(STORE_HABITACION);
    const tAlquiler   = tx.objectStore(STORE_ALQUILER);
    const tSolicitud  = tx.objectStore(STORE_SOLICITUD);

    USUARIOS_PRUEBA.forEach(u => tUsuario.add(u));
    HABITACIONES_PRUEBA.forEach(h => tHabitacion.add(h));
    ALQUILERES_PRUEBA.forEach(a => tAlquiler.add(a));
    SOLICITUDES_PRUEBA.forEach(s => tSolicitud.add(s));

    tx.oncomplete = () => console.log("✅ Datos insertados correctamente");
    tx.onerror = (e) => console.error("❌ Error insertando datos:", e.target.error);
}
