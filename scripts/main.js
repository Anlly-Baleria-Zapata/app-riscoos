let elementCount = 0;

// Función para validar si los campos obligatorios están llenos
function validateForm() {
    const minCalories = document.getElementById('minCalories').value;
    const maxWeight = document.getElementById('maxWeight').value;
    const addButton = document.getElementById('addElementButton');

    // Habilitar el botón solo si ambos campos tienen valores válidos
    if (minCalories && maxWeight) {
        addButton.disabled = false;
    } else {
        addButton.disabled = true;
    }
}

// Función para validar si el formulario del elemento actual está completo
function validateElementForm() {
    const elementGroups = document.querySelectorAll('.element-group');
    if (elementGroups.length === 0) return true; // Si no hay elementos, permitir añadir uno nuevo

    const lastElementGroup = elementGroups[elementGroups.length - 1];
    const inputs = lastElementGroup.querySelectorAll('input');
    for (const input of inputs) {
        if (!input.value) {
            return false; // Si algún campo está vacío, no permitir añadir otro elemento
        }
    }
    return true; // Todos los campos están llenos
}

// Función para validar que el nombre del elemento solo contenga letras
function validateNameInput(input) {
    const regex = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/; // Acepta letras, espacios y caracteres especiales en español
    if (!regex.test(input.value)) {
        input.classList.add('invalid-input');
        return false;
    } else {
        input.classList.remove('invalid-input');
        return true;
    }
}

// Función para añadir un nuevo elemento
function addElement() {
    if (!validateElementForm()) {
        alert("Por favor, complete todos los campos del elemento actual antes de añadir uno nuevo.");
        return;
    }

    // Validar que el nombre del último elemento no contenga números
    const lastElementGroup = document.querySelector('.element-group:last-child');
    if (lastElementGroup) {
        const nameInput = lastElementGroup.querySelector('input[type="text"]');
        if (!validateNameInput(nameInput)) {
            alert("El nombre del elemento no puede contener números o caracteres especiales.");
            return;
        }
    }

    elementCount++;
    const elementHTML = `
        <div class="element-group mb-2">
            <label class="required-field">Nombre del Elemento</label>
            <input type="text" class="form-control mb-1" placeholder="Nombre del Elemento" required oninput="validateNameInput(this)">
            <label class="required-field">Calorías</label>
            <input type="number" class="form-control mb-1" placeholder="Calorías" required>
            <label class="required-field">Peso (g)</label>
            <input type="number" class="form-control" placeholder="Peso (g)" required>
        </div>
    `;
    document.getElementById('elementsContainer').insertAdjacentHTML('beforeend', elementHTML);
}

// Función para guardar el historial en localStorage
function saveHistory(combination, totalWeight, totalCalories) {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const elements = [];

    // Obtener los elementos ingresados
    const elementGroups = document.querySelectorAll('.element-group');
    elementGroups.forEach(group => {
        const inputs = group.querySelectorAll('input');
        const name = inputs[0].value;
        const calories = parseInt(inputs[1].value);
        const weight = parseInt(inputs[2].value);
        elements.push({ name, calories, weight });
    });

    const entry = {
        date: new Date().toLocaleString(),
        elements, // Guardar los elementos ingresados
        combination,
        totalWeight,
        totalCalories
    };
    history.push(entry);
    localStorage.setItem('history', JSON.stringify(history));
}

// Función para mostrar el historial
function mostrarHistorial() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const historialContainer = document.getElementById('historialContainer');

    if (!historialContainer) {
        console.error("No se encontró el contenedor del historial.");
        return;
    }

    historialContainer.innerHTML = ''; // Limpiar el contenedor

    if (history.length === 0) {
        historialContainer.innerHTML = '<p>No hay historial disponible.</p>';
        return;
    }

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
        historialContainer.insertAdjacentHTML('beforeend', entryHTML);
    });
}

// Función para guardar y recargar el formulario
function guardarYRecargar() {
    const resultText = document.getElementById('resultText').textContent;

    // Verificar si hay resultados para guardar
    if (resultText.includes("Elementos recomendados:")) {
        const combination = resultText.match(/Elementos recomendados: (.*?)\./)[1].split(', ');
        const totalWeight = resultText.match(/Peso total: (\d+) g/)[1];
        const totalCalories = resultText.match(/Total de calorías: (\d+)/)[1];

        // Guardar en el historial
        saveHistory(combination, totalWeight, totalCalories);
    }

    // Recargar el formulario
    document.getElementById('minCalories').value = '';
    document.getElementById('maxWeight').value = '';
    document.getElementById('elementsContainer').innerHTML = '';
    document.getElementById('resultText').textContent = 'Los elementos recomendados aparecerán aquí.';

    // Deshabilitar el botón "Guardar" después de recargar
    document.getElementById('guardarButton').disabled = true;

    // Validar el formulario para habilitar/deshabilitar el botón "Añadir Elemento"
    validateForm();

    // Mostrar el historial actualizado
    mostrarHistorial();
}

// Manejar el envío del formulario
document.getElementById('optimizationForm').onsubmit = function(event) {
    event.preventDefault();

    // Validar que haya al menos dos elementos
    const elementGroups = document.querySelectorAll('.element-group');
    if (elementGroups.length < 2) {
        alert("Debe haber al menos dos elementos para calcular los óptimos.");
        return;
    }

    // Validar que todos los nombres de los elementos sean válidos
    let allNamesValid = true;
    elementGroups.forEach(group => {
        const nameInput = group.querySelector('input[type="text"]');
        if (!validateNameInput(nameInput)) {
            allNamesValid = false;
        }
    });

    if (!allNamesValid) {
        alert("Por favor, asegúrese de que todos los nombres de los elementos contengan solo letras.");
        return;
    }

    // Obtener los valores de los requisitos globales
    const minCalories = parseInt(document.getElementById('minCalories').value);
    const maxWeight = parseInt(document.getElementById('maxWeight').value);

    // Obtener los elementos ingresados
    const elements = [];
    elementGroups.forEach(group => {
        const inputs = group.querySelectorAll('input');
        const name = inputs[0].value;
        const calories = parseInt(inputs[1].value);
        const weight = parseInt(inputs[2].value);
        elements.push({ name, calories, weight });
    });

    // Lógica de optimización mejorada
    let bestCombination = [];
    let bestWeight = Infinity;
    let bestCalories = 0;

    // Función recursiva para encontrar combinaciones válidas
    function findCombinations(startIndex, currentCombination, currentWeight, currentCalories) {
        if (currentCalories >= minCalories && currentWeight <= maxWeight) {
            // Priorizar la combinación con el menor peso total
            if (currentWeight < bestWeight) {
                bestCombination = [...currentCombination];
                bestWeight = currentWeight;
                bestCalories = currentCalories;
            }
            return;
        }

        for (let i = startIndex; i < elements.length; i++) {
            if (currentWeight + elements[i].weight <= maxWeight) {
                currentCombination.push(elements[i].name);
                findCombinations(i + 1, currentCombination, currentWeight + elements[i].weight, currentCalories + elements[i].calories);
                currentCombination.pop();
            }
        }
    }

    // Buscar combinaciones válidas
    findCombinations(0, [], 0, 0);

    // Mostrar resultados
    if (bestCombination.length > 0) {
        document.getElementById('resultText').innerHTML = `
            <strong>Elementos recomendados:</strong> ${bestCombination.join(', ')}.<br>
            <strong>Peso total:</strong> ${bestWeight} g.<br>
            <strong>Total de calorías:</strong> ${bestCalories}.
        `;

        // Habilitar el botón "Guardar"
        document.getElementById('guardarButton').disabled = false;
    } else {
        document.getElementById('resultText').textContent = "No se encontró una combinación válida.";
    }
};

// Asignar el evento input a los campos para validar en tiempo real
document.getElementById('minCalories').addEventListener('input', validateForm);
document.getElementById('maxWeight').addEventListener('input', validateForm);

// Reiniciar el formulario al cargar la página
window.onload = function() {
    // Limpiar los campos del formulario
    document.getElementById('minCalories').value = '';
    document.getElementById('maxWeight').value = '';
    document.getElementById('elementsContainer').innerHTML = '';
    document.getElementById('resultText').textContent = 'Los elementos recomendados aparecerán aquí.';

    // Deshabilitar el botón "Guardar" inicialmente
    document.getElementById('guardarButton').disabled = true;

    // Validar el formulario para habilitar/deshabilitar el botón "Añadir Elemento"
    validateForm();

    // Mostrar el historial al cargar la página
    mostrarHistorial();
};