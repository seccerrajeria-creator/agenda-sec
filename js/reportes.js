const citas =
JSON.parse(localStorage.getItem("citas")) || [];

const tecnicos =
JSON.parse(localStorage.getItem("tecnicos")) || [];

let ventasTotales = 0;
let pagoTecnicos = 0;
let gananciaSEC = 0;

let reporte = {};

// Crear automáticamente todos los técnicos
tecnicos.forEach(tecnico => {

    reporte[tecnico.nombre] = {
        ventas: 0,
        pago: 0,
        sec: 0
    };

});

citas.forEach(cita => {

    const valor = Number(cita.valor) || 0;

    ventasTotales += valor;

    if(reporte[cita.tecnico]){

        const pago = valor * 0.60;
        const sec = valor * 0.40;

        reporte[cita.tecnico].ventas += valor;
        reporte[cita.tecnico].pago += pago;
        reporte[cita.tecnico].sec += sec;

        pagoTecnicos += pago;
        gananciaSEC += sec;
    }

});

document.getElementById("ventasTotales").textContent =
"$" + ventasTotales.toLocaleString("es-CO");

document.getElementById("gananciaSEC").textContent =
"$" + gananciaSEC.toLocaleString("es-CO");

document.getElementById("pagoTecnicos").textContent =
"$" + pagoTecnicos.toLocaleString("es-CO");

const tabla =
document.getElementById("tablaReportes");

tabla.innerHTML = "";

for(const tecnico in reporte){

    tabla.innerHTML += `
    <tr>

        <td>${tecnico}</td>

        <td>
            $${reporte[tecnico].ventas.toLocaleString("es-CO")}
        </td>

        <td>
            $${reporte[tecnico].pago.toLocaleString("es-CO")}
        </td>

        <td>
            $${reporte[tecnico].sec.toLocaleString("es-CO")}
        </td>

    </tr>
    `;
}