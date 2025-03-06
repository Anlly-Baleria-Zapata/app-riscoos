// Función para mostrar el historial de combinaciones guardadas
function mostrarHistorial() {
    // Obtener el historial desde localStorage o un array vacío si no hay datos
    const history = JSON.parse(localStorage.getItem('history')) || [];
    // Obtener el contenedor donde se mostrará el historial
    const historyContainer = document.getElementById('historyContainer');

    // Si no hay historial, mostrar un mensaje y salir de la función
    if (history.length === 0) {
        historyContainer.innerHTML = '<p>No hay historial disponible.</p>';
        return;
    }

    // Recorrer cada entrada del historial y crear su representación HTML
    history.forEach(entry => {
        const entryHTML = `
            <div class="historial-entry">
                <p><strong>Fecha:</strong> ${entry.date}</p>
                <p><strong>Elementos ingresados:</strong></p>
                <ul>
                    ${entry.elements.map(element => `
                        <li>${element.name} - ${element.calories} calorías - ${element.weight} g</li>
                    `).join('')}
                </ul>
                <p><strong>Combinación elegida:</strong> ${entry.combination.join(', ')}</p>
                <p><strong>Peso total:</strong> ${entry.totalWeight} g</p>
                <p><strong>Total de calorías:</strong> ${entry.totalCalories}</p>
                <hr>
            </div>
        `;
        // Insertar la entrada en el contenedor del historial
        historyContainer.insertAdjacentHTML('beforeend', entryHTML);
    });
}

// Mostrar el historial automáticamente cuando la página se cargue
window.onload = mostrarHistorial;