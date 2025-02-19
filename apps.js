// Variables
let listaObservaciones = [];

// Elementos del DOM
const responsableInput = document.getElementById('responsable');
const horaInicioInput = document.getElementById('horaInicio');
const cargoInput = document.getElementById('cargo');
const observacionesInput = document.getElementById('observaciones');
const listaObservacionesElement = document.getElementById('listaObservaciones');
const agregarObservacionBtn = document.getElementById('agregarObservacion');
const finalizarTurnoBtn = document.getElementById('finalizarTurno');

// Función para agregar una observación
agregarObservacionBtn.addEventListener('click', () => {
    const observacion = observacionesInput.value.trim();
    if (observacion) {
        listaObservaciones.push(observacion);
        observacionesInput.value = ''; // Limpiar campo
        actualizarListaObservaciones();
    }
});

// Actualizar lista de observaciones en el HTML
function actualizarListaObservaciones() {
    listaObservacionesElement.innerHTML = '';
    listaObservaciones.forEach((observacion) => {
        const li = document.createElement('li');
        li.textContent = observacion;
        listaObservacionesElement.appendChild(li);
    });
}

// Función para formatear la hora en HH:mm:ss
function formatearHora(hora) {
    if (!hora) return null; // Si la hora está vacía, retorna null
    return `${hora}:00`; // Agrega los segundos
}

// Función para finalizar el turno y registrar la información
finalizarTurnoBtn.addEventListener('click', () => {
    const responsable = responsableInput.value.trim();
    let horaInicio = formatearHora(horaInicioInput.value);
    const cargo = cargoInput.value.trim();
    const horaFin = new Date().toLocaleTimeString('es-ES', { hour12: false }); // Hora actual en HH:mm:ss

    if (!responsable || !horaInicio || !cargo || listaObservaciones.length === 0) {
        alert("Por favor complete todos los campos antes de registrar el turno.");
        return;
    }

    guardarEnBaseDeDatos(responsable, horaInicio, cargo, listaObservaciones, horaFin);
});

// Función para enviar los datos al servidor
function guardarEnBaseDeDatos(responsable, horaInicio, cargo, observaciones, horaFin) {
    fetch('/guardarTurno', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            responsable,
            horaInicio,
            cargo,
            observaciones,
            horaFin
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Turno registrado correctamente.");
    })
    .catch(error => {
        console.error('Error al registrar turno:', error);
        alert("Hubo un error al guardar la información.");
    });
}
