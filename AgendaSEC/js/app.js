    const form = document.getElementById("formCita");
    const tabla = document.getElementById("tablaCitas");
    const buscador = document.getElementById("buscarCita");
    let citas = JSON.parse(localStorage.getItem("citas")) || [];
    let indiceEdicion = null;
    function obtenerClaseEstado(estado){

        if(!estado){
            return "";
        }

        estado = estado.trim();

        switch(estado){

            case "Pendiente":
                return "estado-pendiente";

            case "En Camino":
                return "estado-camino";

            case "En Proceso":
                return "estado-proceso";

            case "Finalizado":
                return "estado-finalizado";

            case "Cancelado":
                return "estado-cancelado";

            default:
                return "";
        }

    }
    actualizarTabla();
    actualizarEstadisticas();
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

        if(indiceEdicion !== null){

        citas[indiceEdicion] = nuevaCita;

        indiceEdicion = null;

    }else{

        citas.push(nuevaCita);

    }

        localStorage.setItem(
            "citas",
            JSON.stringify(citas)
        );


        actualizarTabla();
    actualizarEstadisticas();

    form.reset();   

    });

    function actualizarTabla(){

        tabla.innerHTML = "";

        citas.forEach((cita,index) => {

            tabla.innerHTML += `
            <tr>
                <td>${cita.cliente}</td>
                <td>${cita.telefono}</td>
                <td>${cita.direccion}</td>
                <td>${cita.servicio}</td>
                <td>${cita.tecnico}</td>
                <td>${cita.fechaHora}</td>

                <td>
                    $${Number(cita.valor || 0).toLocaleString()}
                </td>

                <td>
                    <span class="${obtenerClaseEstado(cita.estado)}">
                        ${cita.estado}
                    </span>
                </td>

                <td>
                    <button onclick="abrirMapa(${index})">
                        📍 Ruta
                    </button>
                </td>

                <td>
                    <button onclick="enviarWhatsApp(${index})">
                        📲 WhatsApp
                    </button>
                </td>

                <td>
                    <button onclick="finalizarCita(${index})">
                        ✅ Finalizar
                    </button>
                </td>

                <td>
                    <button onclick="editarCita(${index})">
                        ✏️ Editar
                    </button>

        <button onclick="eliminarCita(${index})">
            🗑 Eliminar
        </button>
    </td>

    </tr>
    `;
        });
    }
    function finalizarCita(index){

        if(confirm("¿Marcar servicio como Finalizado?")){

            citas[index].estado = "Finalizado";

            localStorage.setItem(
                "citas",
                JSON.stringify(citas)
            );

            actualizarTabla();
            actualizarEstadisticas();

        }

    }

    function eliminarCita(index){

        if(confirm("¿Eliminar esta cita?")){

            citas.splice(index,1);

            localStorage.setItem(
                "citas",
                JSON.stringify(citas)
            );

            actualizarTabla();
            actualizarEstadisticas();

        }

    }
    function enviarWhatsApp(index){

        const cita = citas[index];

    const tecnico = tecnicos.find(
        t => t.nombre === cita.tecnico
    );

    if(!tecnico){
        alert("No se encontró el teléfono del técnico");
        return;
    }

    const telefono = tecnico.telefono;
    const rutaMaps =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cita.direccion)}`;
        const mensaje = `🔑 NUEVO SERVICIO SEC

    👤 Cliente: ${cita.cliente}
    📞 Teléfono: ${cita.telefono}

    📍 Dirección:
    ${cita.direccion}

    🏠 Barrio:
    ${cita.barrio}

    🗺 Ruta:
    ${rutaMaps}

    🔧 Servicio:
    ${cita.servicio}

    💰 Valor:
    $${cita.valor}

    📅 Fecha y Hora:
    ${cita.fechaHora}

    👨‍🔧 Técnico:
    ${cita.tecnico}

    📝 Observaciones:
    ${cita.observaciones}`;

        const url =
        `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

        window.open(url, "_blank");
    citas[index].estado = "En Camino";

    localStorage.setItem(
        "citas",
        JSON.stringify(citas)
    );

    actualizarTabla();
    actualizarEstadisticas();
    }

    function abrirMapa(index){

        const cita = citas[index];

        const direccion =
        encodeURIComponent(cita.direccion);

        window.open(
            `https://www.google.com/maps/search/?api=1&query=${direccion}`,
            "_blank"
        );

    }
    function editarCita(index){

        indiceEdicion = index;

        const cita = citas[index];

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

        window.scrollTo({
        top:0,
        behavior:"smooth"
    });

    }

    function actualizarEstadisticas(){

        document.getElementById("totalCitas").textContent =
        citas.length;

        const pendientes =
        citas.filter(c =>
            c.estado === "Pendiente"
        ).length;

        document.getElementById("totalPendientes").textContent =
        pendientes;

        const finalizadas =
        citas.filter(c =>
            c.estado === "Finalizado"
        ).length;

        document.getElementById("totalFinalizadas").textContent =
        finalizadas;

        const ventas = citas.reduce((total,cita)=>{

            return total + Number(cita.valor || 0);

        },0);

        document.getElementById("totalVentas").textContent =
        "$" + ventas.toLocaleString();

    }
    function mostrarSeccion(nombre){

        const dashboard =
        document.getElementById("dashboardCards");

        const formulario =
        document.querySelector(".formulario");

        const tabla =
        document.querySelector(".tabla-section");

        const reportes =
        document.getElementById("reportes");

        if(nombre === "reportes"){

            dashboard.style.display = "none";
            formulario.style.display = "none";
            tabla.style.display = "none";

            reportes.style.display = "block";

        }else{

            dashboard.style.display = "flex";
            formulario.style.display = "block";
            tabla.style.display = "block";

            reportes.style.display = "none";

        }

    }
    // =========================================================================
    // SECCIÓN: GESTIÓN DE TÉCNICOS
    // =========================================================================

    // 1. Cargar el arreglo de técnicos desde localStorage sin tocar "citas"
    let tecnicos = JSON.parse(localStorage.getItem("tecnicos")) || [];

    // 2. Obtener elementos de los formularios de técnicos
    const formTecnico = document.getElementById("form-tecnico");
    const tablaTecnicosBody = document.getElementById("tabla-tecnicos-body");
    const tecnicoIndexInput = document.getElementById("tecnico-index");

    // 3. Función para renderizar los técnicos en su tabla correspondientemente
    function actualizarTablaTecnicos() {
        if (!tablaTecnicosBody) return; // Seguridad por si acaso
        tablaTecnicosBody.innerHTML = ""; 

        // 1. Obtener el selector de técnicos del formulario de citas
        const selectTecnicoCita = document.getElementById("tecnico");
        if (selectTecnicoCita) {
            selectTecnicoCita.innerHTML = '<option value="">Seleccione un Técnico</option>'; // Limpiar y poner opción por defecto
        }

        tecnicos.forEach((tecnico, index) => {
            // 2. Pintar la fila en la tabla de técnicos
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${tecnico.nombre}</td>
                <td>${tecnico.telefono}</td>
                <td>${tecnico.especialidad || 'General'}</td>
                <td>
                    <button onclick="editarTecnico(${index})">✏️ Editar</button>
                    <button onclick="eliminarTecnico(${index})">🗑️ Eliminar</button>
                </td>
            `;
            tablaTecnicosBody.appendChild(fila);

            // 3. Agregar el técnico al selector de la "Nueva Cita"
            if (selectTecnicoCita) {
                const opcion = document.createElement("option");
                opcion.value = tecnico.nombre; // Guardará el nombre al agendar la cita
                opcion.textContent = tecnico.nombre;
                selectTecnicoCita.appendChild(opcion);
            }
        });
    }

    // 4. Guardar o actualizar técnico
    if (formTecnico) {
        formTecnico.addEventListener("submit", function(e) {
            e.preventDefault();

            const index = tecnicoIndexInput.value;
            const nuevoTecnico = {
                nombre: document.getElementById("tecnico-nombre").value,
                telefono: document.getElementById("tecnico-telefono").value,
                especialidad: document.getElementById("tecnico-especialidad").value
            };

            if (index === "") {
                // Es un técnico nuevo
                tecnicos.push(nuevoTecnico);
            } else {
                // Editando uno existente
                tecnicos[index] = nuevoTecnico;
                tecnicoIndexInput.value = ""; // Limpiamos el índice
            }

            localStorage.setItem("tecnicos", JSON.stringify(tecnicos));
            actualizarTablaTecnicos();
            formTecnico.reset(); // Deja el formulario en blanco
        });
    }

    // 5. Cargar datos en el formulario para editar
    window.editarTecnico = function(index) {
        const tecnico = tecnicos[index];
        document.getElementById("tecnico-nombre").value = tecnico.nombre;
        document.getElementById("tecnico-telefono").value = tecnico.telefono;
        document.getElementById("tecnico-especialidad").value = tecnico.especialidad;
        tecnicoIndexInput.value = index; 
    };

    // 6. Eliminar un técnico de forma segura (sin borrar localStorage completo)
    window.eliminarTecnico = function(index) {
        const confirmar = confirm("¿Estás seguro de que deseas eliminar a este técnico?");
        if (confirmar) {
            tecnicos.splice(index, 1);
            localStorage.setItem("tecnicos", JSON.stringify(tecnicos));
            actualizarTablaTecnicos();
        }
    };

    // 7. Carga inicial de la tabla al abrir la página
    actualizarTablaTecnicos();
    function mostrarSeccion(idSeccion) {
        // 1. Ocultar todas las secciones que tengan la clase 'seccion-contenido'
        const secciones = document.querySelectorAll('.seccion-contenido');
        secciones.forEach(seccion => {
            seccion.style.display = 'none';
        });

        // 2. Mostrar la sección que el usuario seleccionó
        const seccionActiva = document.getElementById(idSeccion);
        if (seccionActiva) {
            seccionActiva.style.display = 'block';
        }
    }
    if(buscador){

        buscador.addEventListener("keyup", function(){

            const texto =
            this.value.toLowerCase();

            const filas =
            tabla.getElementsByTagName("tr");

            for(let fila of filas){

                const contenido =
                fila.textContent.toLowerCase();

                fila.style.display =
                contenido.includes(texto)
                ? ""
                : "none";

            }

        });

    }
function exportarCitas(){

    const citas =
    JSON.parse(localStorage.getItem("citas")) || [];

    const contenido =
    JSON.stringify(citas, null, 2);

    const blob =
    new Blob([contenido], {
        type: "application/json"
    });

    const enlace =
    document.createElement("a");

    enlace.href =
    URL.createObjectURL(blob);

    enlace.download =
    "respaldo-sec.json";

    enlace.click();

}
function importarCitas(){

    const archivo =
    document.getElementById("archivoRespaldo").files[0];

    if(!archivo){

        alert("Seleccione un archivo de respaldo.");

        return;
    }

    const lector = new FileReader();

    lector.onload = function(e){

        try{

            const citasImportadas =
            JSON.parse(e.target.result);

            if(!Array.isArray(citasImportadas)){

                alert("Archivo inválido.");

                return;
            }

            localStorage.setItem(
                "citas",
                JSON.stringify(citasImportadas)
            );

            citas = citasImportadas;

            actualizarTabla();
            actualizarEstadisticas();

            alert("✅ Respaldo restaurado correctamente.");

        }catch(error){

            alert("❌ Error al leer el archivo.");

        }

    };

    lector.readAsText(archivo);

}
function guardarConfiguracion(){

    const config = {

        nombre: document.getElementById("empresaNombre").value,
        telefono: document.getElementById("empresaTelefono").value,
        direccion: document.getElementById("empresaDireccion").value

    };

    localStorage.setItem(
        "configuracion",
        JSON.stringify(config)
    );

    alert("Configuración guardada");
}