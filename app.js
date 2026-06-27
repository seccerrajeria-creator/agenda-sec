// =========================================================================
// CONFIGURACIÓN DE FIREBASE (¡Listo con tus datos reales de Agenda-SEC!)
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA-vRPCL2Jmjp_32viALp_EcJW-TZoJyJk",
  authDomain: "agenda-sec-d7e6b.firebaseapp.com",
  databaseURL: "https://agenda-sec-d7e6b-default-rtdb.firebaseio.com",
  projectId: "agenda-sec-d7e6b",
  storageBucket: "agenda-sec-d7e6b.firebasestorage.app",
  messagingSenderId: "757579379131",
  appId: "1:757579379131:web:bae84cc13928a10c46d49e",
  measurementId: "G-DPZFJYLQWL"
};

// Inicializar la App y los servicios utilizando las librerías cargadas desde el HTML
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referencias directas en la nube de Firebase
const dbCitasRef = database.ref("citas");
const dbTecnicosRef = database.ref("tecnicos");

// Inicializar la App y los servicios utilizando las librerías cargadas desde el HTML
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referencias directas en la nube de Firebase
const dbCitasRef = database.ref("citas");
const dbTecnicosRef = database.ref("tecnicos");

// Elementos de la interfaz
const form = document.getElementById("formCita");
const tabla = document.getElementById("tablaCitas");
const buscador = document.getElementById("buscarCita");

let citas = []; // Se llenará dinámicamente desde Firebase
let idEdicionCita = null; // Guardará el ID único de Firebase al editar

function obtenerClaseEstado(estado){
    if(!estado) return "";
    estado = estado.trim();
    switch(estado){
        case "Pendiente": return "estado-pendiente";
        case "En Camino": return "estado-camino";
        case "En Proceso": return "estado-proceso";
        case "Finalizado": return "estado-finalizado";
        case "Cancelado": return "estado-cancelado";
        default: return "";
    }
}

// =========================================================================
// ESCUCHA EN TIEMPO REAL: SECCIÓN CITAS
// =========================================================================
dbCitasRef.on("value", function(snapshot) {
    citas = [];
    const datos = snapshot.val();
    
    // Convertimos el objeto anidado de Firebase en un Array con IDs útiles
    if (datos) {
        Object.keys(datos).forEach(id => {
            citas.push({ id: id, ...datos[id] });
        });
    }
    
    actualizarTabla();
    actualizarEstadisticas();
});

// Evento para Guardar o Editar Cita
form.addEventListener("submit", function(e){
    e.preventDefault();

    const nuevaCita = {
        cliente: document.getElementById("cliente").value,
        telefono: document.getElementById("telefono").value,
        direccion: document.getElementById("direccion").value,
        barrio: document.getElementById("barrio").value,
        servicio: document.getElementById("servicio").value,
        tecnico: document.getElementById("tecnico").value,
        fechaHora: document.getElementById("fechaHora").value,
        valor: document.getElementById("valor").value,
        estado: document.getElementById("estado").value,
        observaciones: document.getElementById("observaciones").value
    };

    if(idEdicionCita !== null){
        // Actualizar en Firebase usando su ID único
        dbCitasRef.child(idEdicionCita).set(nuevaCita);
        idEdicionCita = null;
    } else {
        // Crear un registro nuevo con ID único en Firebase
        dbCitasRef.push(nuevaCita);
    }

    form.reset();   
});

function actualizarTabla(){
    tabla.innerHTML = "";
    citas.forEach((cita) => {
        tabla.innerHTML += `
        <tr>
            <td>${cita.cliente}</td>
            <td>${cita.telefono}</td>
            <td>${cita.direccion}</td>
            <td>${cita.servicio}</td>
            <td>${cita.tecnico}</td>
            <td>${cita.fechaHora}</td>
            <td>$${Number(cita.valor || 0).toLocaleString()}</td>
            <td>
                <span class="${obtenerClaseEstado(cita.estado)}">
                    ${cita.estado}
                </span>
            </td>
            <td><button onclick="abrirMapa('${cita.id}')">📍 Ruta</button></td>
            <td><button onclick="enviarWhatsApp('${cita.id}')">📲 WhatsApp</button></td>
            <td><button onclick="finalizarCita('${cita.id}')">✅ Finalizar</button></td>
            <td>
                <button onclick="editarCita('${cita.id}')">✏️ Editar</button>
                <button onclick="eliminarCita('${cita.id}')">🗑 Eliminar</button>
            </td>
        </tr>`;
    });
}

function finalizarCita(id){
    if(confirm("¿Marcar servicio como Finalizado?")){
        dbCitasRef.child(id).update({ estado: "Finalizado" });
    }
}

function eliminarCita(id){
    if(confirm("¿Eliminar esta cita?")){
        dbCitasRef.child(id).remove();
    }
}

function enviarWhatsApp(id){
    const cita = citas.find(c => c.id === id);
    if(!cita) return;

    const tecnico = tecnicos.find(t => t.nombre === cita.tecnico);
    if(!tecnico){
        alert("No se encontró el teléfono del técnico");
        return;
    }

    const telefono = tecnico.telefono;
    const direccionCodificada = encodeURIComponent(cita.direccion);
    const rutaMaps = `https://www.google.com/maps/search/?api=1&query=${direccionCodificada}`;
    
    const mensaje = `🔑 NUEVO SERVICIO SEC\n\n👤 Cliente: ${cita.cliente}\n📞 Teléfono: ${cita.telefono}\n\n📍 Dirección:\n${cita.direccion}\n\n🏠 Barrio:\n${cita.barrio}\n\n🗺 Ruta:\n${rutaMaps}\n\n🔧 Servicio:\n${cita.servicio}\n\n💰 Valor:\n$${cita.valor}\n\n📅 Fecha y Hora:\n${cita.fechaHora}\n\n👨‍🔧 Técnico:\n${cita.tecnico}\n\n📝 Observaciones:\n${cita.observaciones}`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    
    // Cambiar estado a "En Camino" directamente en Firebase
    dbCitasRef.child(id).update({ estado: "En Camino" });
}

function abrirMapa(id){
    const cita = citas.find(c => c.id === id);
    if(cita) {
        const direccion = encodeURIComponent(cita.direccion);
        window.open(`https://www.google.com/maps/search/?api=1&query=${direccion}`, "_blank");
    }
}

function editarCita(id){
    const cita = citas.find(c => c.id === id);
    if(!cita) return;

    idEdicionCita = id;

    document.getElementById("cliente").value = cita.cliente;
    document.getElementById("telefono").value = cita.telefono;
    document.getElementById("direccion").value = cita.direccion;
    document.getElementById("barrio").value = cita.barrio;
    document.getElementById("servicio").value = cita.servicio;
    document.getElementById("tecnico").value = cita.tecnico;
    document.getElementById("fechaHora").value = cita.fechaHora;
    document.getElementById("estado").value = cita.estado;
    document.getElementById("observaciones").value = cita.observaciones;
    document.getElementById("valor").value = cita.valor;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function actualizarEstadisticas(){
    document.getElementById("totalCitas").textContent = citas.length;
    
    const pendientes = citas.filter(c => c.estado === "Pendiente").length;
    document.getElementById("totalPendientes").textContent = pendientes;

    const finalizadas = citas.filter(c => c.estado === "Finalizado").length;
    document.getElementById("totalFinalizadas").textContent = finalizadas;

    const ventas = citas.reduce((total, cita)=>{
        return total + Number(cita.valor || 0);
    }, 0);

    document.getElementById("totalVentas").textContent = "$" + ventas.toLocaleString();
}

// =========================================================================
// SECCIÓN: GESTIÓN DE TÉCNICOS EN LA NUBE
// =========================================================================
let tecnicos = [];
const formTecnico = document.getElementById("form-tecnico");
const tablaTecnicosBody = document.getElementById("tabla-tecnicos-body");
const tecnicoIndexInput = document.getElementById("tecnico-index"); // Actuará como ID en Firebase

// Escucha en tiempo real para Técnicos
dbTecnicosRef.on("value", function(snapshot) {
    tecnicos = [];
    const datos = snapshot.val();
    if(datos) {
        Object.keys(datos).forEach(id => {
            tecnicos.push({ id: id, ...datos[id] });
        });
    }
    actualizarTablaTecnicos();
});

function actualizarTablaTecnicos() {
    if (!tablaTecnicosBody) return;
    tablaTecnicosBody.innerHTML = ""; 

    const selectTecnicoCita = document.getElementById("tecnico");
    if (selectTecnicoCita) {
        selectTecnicoCita.innerHTML = '<option value="">Seleccione un Técnico</option>';
    }

    tecnicos.forEach((tecnico) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${tecnico.nombre}</td>
            <td>${tecnico.telefono}</td>
            <td>${tecnico.especialidad || 'General'}</td>
            <td>
                <button onclick="editarTecnico('${tecnico.id}')">✏️ Editar</button>
                <button onclick="eliminarTecnico('${tecnico.id}')">🗑️ Eliminar</button>
            </td>
        `;
        tablaTecnicosBody.appendChild(fila);

        if (selectTecnicoCita) {
            const opcion = document.createElement("option");
            opcion.value = tecnico.nombre;
            opcion.textContent = tecnico.nombre;
            selectTecnicoCita.appendChild(opcion);
        }
    });
}

if (formTecnico) {
    formTecnico.addEventListener("submit", function(e) {
        e.preventDefault();

        const idFirebase = tecnicoIndexInput.value;
        const nuevoTecnico = {
            nombre: document.getElementById("tecnico-nombre").value,
            telefono: document.getElementById("tecnico-telefono").value,
            especialidad: document.getElementById("tecnico-especialidad").value
        };

        if (idFirebase === "") {
            dbTecnicosRef.push(nuevoTecnico);
        } else {
            dbTecnicosRef.child(idFirebase).set(nuevoTecnico);
            tecnicoIndexInput.value = "";
        }
        formTecnico.reset();
    });
}

window.editarTecnico = function(id) {
    const tecnico = tecnicos.find(t => t.id === id);
    if(!tecnico) return;
    
    document.getElementById("tecnico-nombre").value = tecnico.nombre;
    document.getElementById("tecnico-telefono").value = tecnico.telefono;
    document.getElementById("tecnico-especialidad").value = tecnico.especialidad;
    tecnicoIndexInput.value = id; 
};

window.eliminarTecnico = function(id) {
    if (confirm("¿Estás seguro de que deseas eliminar a este técnico?")) {
        dbTecnicosRef.child(id).remove();
    }
};

// =========================================================================
// SECCIÓN: COMPLEMENTOS Y NAVEGACIÓN
// =========================================================================
function mostrarSeccion(idSeccion) {
    const secciones = document.querySelectorAll('.seccion-contenido');
    secciones.forEach(seccion => {
        seccion.style.display = 'none';
    });
    const seccionActiva = document.getElementById(idSeccion);
    if (seccionActiva) {
        seccionActiva.style.display = 'block';
    }
}

if(buscador){
    buscador.addEventListener("keyup", function(){
        const texto = this.value.toLowerCase();
        const filas = tabla.getElementsByTagName("tr");
        for(let fila of filas){
            const contenido = fila.textContent.toLowerCase();
            fila.style.display = contenido.includes(texto) ? "" : "none";
        }
    });
}