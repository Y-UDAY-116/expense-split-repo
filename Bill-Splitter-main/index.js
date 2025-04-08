// Existing variables
const initialForm = document.getElementById('initialForm');
const initialFormContainer = document.getElementById('initialFormContainer');
const nameFormContainer = document.getElementById('nameFormContainer');
const nameForm = document.getElementById('nameForm');
const foodAndNameSelect = document.getElementById('foodAndNameSelect');
const foodForm = document.getElementById('foodForm');
const taxFormContainer = document.getElementById('taxFormContainer');
const finalResultContainer = document.getElementById('finalResultContainer');
const finalResult = document.getElementById('finalResult');

let personTotals = {}; // { personName: [{foodName: 'Pizza', price: 10}, ...], ... }
let personTotalsStack = []; // Stack to store states of personTotals
let formIndex = 1; // Keep track of the current food form
let foodForms = [];
let names = []; // To store names globally for recalculation

// Function to clear all food forms
const clearFoodForms = () => {
    foodForms.forEach(form => {
        form.style.display = 'none';
    });
    foodForms = [];
    foodForm.innerHTML = ''; // Remove all child elements
};

// Function to handle full recalculation of personTotals
const recalculatePersonTotals = () => {
    // Reset personTotals
    personTotals = {};

    // Initialize personTotals for each person
    names.forEach(name => {
        personTotals[name] = [];
    });

    // Iterate through all food forms and process them
    foodForms.forEach((form, idx) => {
        const currentFormIndex = idx + 1; // Assuming formIndex starts at 1
        const foodPriceInput = document.getElementById(`foodPrice${currentFormIndex}`);
        const foodNameInput = document.getElementById(`foodName${currentFormIndex}`);
        const nameButtons = document.querySelectorAll(`#foodForm${currentFormIndex} .nameButton`);

        const selectedPeople = Array.from(nameButtons)
            .filter(button => button.classList.contains('selected'))
            .map(button => button.dataset.name);

        const foodPrice = parseFloat(foodPriceInput.value);
        const foodName = foodNameInput.value.trim();

        // Validate input before processing
        if (selectedPeople.length > 0 && !isNaN(foodPrice) && foodName !== '') {
            const splitPrice = foodPrice / selectedPeople.length;

            selectedPeople.forEach(person => {
                if (!Array.isArray(personTotals[person])) {
                    personTotals[person] = [];
                }
                personTotals[person].push({
                    foodName: foodName,
                    price: splitPrice,
                    originalPrice: foodPrice
                });

                // Update the total for this person
                if (!personTotals[person].total) {
                    personTotals[person].total = 0;
                }
                personTotals[person].total += splitPrice;
            });
        }
    });
};

// Function to create a new food form
const createFoodForm = (index) => {
    let foodFormHTML = `
        <div id="foodForm${index}">
            <label for="foodName${index}">Food Name:</label>
            <input type="text" id="foodName${index}" name="foodName${index}" required><br>
            <label for="foodPrice${index}">Price:</label>
            <input type="number" id="foodPrice${index}" name="foodPrice${index}" step="0.01" min="0" required><br>

            <div id="errorMessage${index}" class="errorMessage" style="display: none; color: red;">Please fill in both the food name and price.</div>

            <div id="buttonContainer${index}" class="buttonContainer">`;

    // Add buttons for each person to select who ate the food
    names.forEach(name => {
        foodFormHTML += `<button type="button" class="nameButton" data-name="${name}">${name}</button>`;
    });

    foodFormHTML += `</div>
            <div id="errorMessagePerson${index}" class="errorMessagePerson" style="display: none; color: red;">Please select at least one person.</div>
            <br>
            <button type="button" id="nextButton${index}" class="next commonButton">Next</button>
            <button type="button" id="backButton${index}" class="back commonButton">Back</button>
            <br>
            <button type="button" id="calculateTotalButton${index}" class="calculateTotal commonButton">Calculate Total</button>
        </div>`;

    return foodFormHTML;
};

// Function to show the food form based on the current form index
const showFoodForm = (index) => {
    // Hide all forms first
    foodForms.forEach(form => form.style.display = 'none');
    // Show the form corresponding to the index
    const currentForm = document.getElementById(`foodForm${index}`);
    if (currentForm) {
        currentForm.style.display = 'block';
    }
};

// Function to add event listeners to a specific food form
const addFormListeners = (index) => {
    const currentForm = document.getElementById(`foodForm${index}`);
    if (!currentForm) return;

    const validateInput = () => {
        const foodNameInput = document.getElementById(`foodName${index}`);
        const foodPriceInput = document.getElementById(`foodPrice${index}`);
        const errorMessage = document.getElementById(`errorMessage${index}`);
        const errorMessagePerson = document.getElementById(`errorMessagePerson${index}`);

        const nameButtons = document.querySelectorAll(`#foodForm${index} .nameButton`);

        const isPersonSelected = Array.from(nameButtons).some(button => button.classList.contains('selected'));

        // Validate that both inputs are filled
        if (foodNameInput.value.trim() === '' || foodPriceInput.value.trim() === '') {
            errorMessage.style.display = "block";
            errorMessagePerson.style.display = "none";
            return false; // Validation failed
        } else {
            errorMessage.style.display = "none";
            if (!isPersonSelected) {
                errorMessagePerson.style.display = "block";
                return false; // Validation failed
            } else {
                errorMessagePerson.style.display = "none";
            }
        }
        return true; // Validation passed
    };

    // Event delegation for name buttons
    const buttonContainer = document.getElementById(`buttonContainer${index}`);
    buttonContainer.addEventListener('click', function(event) {
        if (event.target && event.target.matches('button.nameButton')) {
            event.target.classList.toggle('selected'); // Toggle selection
        }
    });

    // Next button event listener
    const nextButton = document.getElementById(`nextButton${index}`);
    nextButton.addEventListener('click', function() {
        if (validateInput()) {
            // Recalculate all person totals
            recalculatePersonTotals();

            // Push the current state of personTotals onto the stack
            personTotalsStack.push(JSON.parse(JSON.stringify(personTotals)));

            // Move to the next form
            formIndex++; // Increment form index
            if (!document.getElementById(`foodForm${formIndex}`)) {
                const newFormHTML = createFoodForm(formIndex);
                foodForm.insertAdjacentHTML('beforeend', newFormHTML);
                const newForm = document.getElementById(`foodForm${formIndex}`);
                foodForms.push(newForm);
                addFormListeners(formIndex); // Add listeners to the new form
            }
            showFoodForm(formIndex); // Show the next form
        }
    });

    // Back button event listener
    const backButton = document.getElementById(`backButton${index}`);
    backButton.addEventListener('click', function() {
        if (formIndex > 1) {
            formIndex--; // Decrement form index

            // Restore the previous state of personTotals from the stack
            if (personTotalsStack.length > 0) {
                personTotals = personTotalsStack.pop();
            }

            showFoodForm(formIndex); // Show the previous form
        } else {
            // Navigate back to the Name Form
            foodAndNameSelect.style.display = 'none';
            nameFormContainer.style.display = 'block';

            // Reset state variables
            personTotals = {};
            personTotalsStack = [];

            // Clear existing food forms
            clearFoodForms();
        }
    });

    // Calculate Total button event listener
    const calculateTotalButton = document.getElementById(`calculateTotalButton${index}`);
    calculateTotalButton.addEventListener('click', function() {
        if (validateInput()) {
            // Recalculate all person totals
            recalculatePersonTotals();

            // Push the current state of personTotals onto the stack
            personTotalsStack.push(JSON.parse(JSON.stringify(personTotals)));

            // Show the tax form and hide the food form
            taxFormContainer.style.display = 'block';
            foodAndNameSelect.style.display = 'none';
        }
    });
};

// Event listener for the initial form submission
initialForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const peopleCount = document.getElementById('peopleCount').value; // Get number of people

    // Populate name form with input fields
    let nameFormHtml = '';
    for (let i = 1; i <= peopleCount; i++) {
        nameFormHtml += `<label for="name${i}">Name ${i}:</label>
                         <input type="text" id="name${i}" name="name${i}" minlength="1" maxlength="10" required><br>`;
    }

    nameFormHtml += `<button type="button" id="backButton0" class="back commonButton">Back</button> <br>
                    <input type="submit" value="Submit Names">`;

    nameForm.innerHTML = nameFormHtml;

    // Show the name form and hide the initial form
    nameFormContainer.style.display = 'block';
    initialFormContainer.style.display = 'none';

    // Event listener for the Back button in the name form
    document.getElementById('backButton0').addEventListener('click', function() {
        nameFormContainer.style.display = 'none'; // Hide name form
        initialFormContainer.style.display = 'block'; // Show the initial form again
        initialForm.reset(); // Reset the initial form
    });
});

// Add event listener for name form submission
nameForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default submission

    const peopleCount = document.getElementById('peopleCount').value; // Get number of people
    names = []; // Reset names array

    for (let i = 1; i <= peopleCount; i++) {
        let name = document.getElementById(`name${i}`).value.trim(); // Get name from input with id="name{i}"
        if (name === '') {
            alert(`Name ${i} cannot be empty.`);
            return;
        }
        names.push(name); // Store each name in an array
    }

    nameFormContainer.style.display = "none"; // Hide the name form
    foodAndNameSelect.style.display = "block"; // Show the food selection form

    // Initialize personTotals for each person to an empty array
    personTotals = {};
    names.forEach(name => {
        personTotals[name] = [];
    });

    // Reset stacks and food forms
    personTotalsStack = [];
    clearFoodForms();

    // Reset formIndex
    formIndex = 1;

    // Create the initial food form and push it into the array
    foodForm.innerHTML = createFoodForm(formIndex);
    const firstForm = document.getElementById(`foodForm${formIndex}`);
    foodForms.push(firstForm);

    // Add event listeners for the first form
    addFormListeners(formIndex);
    showFoodForm(formIndex); // Display the first food form
});

// Tax Form Submission Event Listener
document.getElementById('taxForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const taxRate = parseFloat(document.getElementById('taxRate').value); // Get tax rate in %
    if (!isNaN(taxRate)) {

        // Save the current state before applying tax
        personTotalsStack.push(JSON.parse(JSON.stringify(personTotals)));

        let totalBillAmount = 0; // Variable to store the total amount for the entire bill

        // Apply tax to each person's total and calculate individual totals
        Object.keys(personTotals).forEach(person => {
            // Check if personTotals[person] is an array and has items, otherwise skip
            if (!Array.isArray(personTotals[person]) || personTotals[person].length === 0) {
                // Handle or skip the person with no assigned food
                return;
            }

            let personTotal = 0;
            personTotals[person] = personTotals[person].map(foodItem => {
                const taxAmount = foodItem.price * (taxRate / 100);
                const totalWithTax = foodItem.price + taxAmount;
                personTotal += totalWithTax;
                return {
                    ...foodItem,
                    price: totalWithTax
                };
            });
            personTotals[person].total = personTotal; // Store the total for this person
            totalBillAmount += personTotal; // Add this person's total to the overall total
        });

        taxFormContainer.style.display = 'none';
        finalResultContainer.style.display = 'block';

        // Display the final result
        let resultHTML = '<h2>Final Amounts with Tax</h2><ul>';
        Object.keys(personTotals).forEach(person => {
            // Skip displaying if the person has no assigned food
            if (!Array.isArray(personTotals[person]) || personTotals[person].length === 0) {
                return;
            }

            resultHTML += `<li><strong>${person}</strong><ul>`;
            personTotals[person].forEach(foodItem => {
                resultHTML += `<li>${foodItem.foodName}: $${foodItem.price.toFixed(2)}</li>`;
            });
            resultHTML += `</ul><strong>Total: $${personTotals[person].total.toFixed(2)}</strong></li>`;
        });
        resultHTML += `</ul><h3>Total Bill Amount: $${totalBillAmount.toFixed(2)}</h3>`;
        finalResult.innerHTML = resultHTML; // Display the final results
    }
});

// Event listener for Back button in the tax form
document.getElementById('backButtonTax').addEventListener('click', function () {
    taxFormContainer.style.display = 'none'; 
    foodAndNameSelect.style.display = 'block'; 

    // Restore the previous state of personTotals from the stack
    if (personTotalsStack.length > 0) {
        personTotals = personTotalsStack.pop();
    }

    showFoodForm(formIndex); 
});

// Event listener for Back button in the final result form
document.getElementById('backButtonResult').addEventListener('click', function () {

    // Restore the previous state of personTotals before tax was applied
    if (personTotalsStack.length > 0) {
        personTotals = personTotalsStack.pop();
    }

    taxFormContainer.style.display = 'block';
    finalResultContainer.style.display = 'none';
});

// Night Mode Toggle
document.getElementById('toggleMode').addEventListener('click', function() {
    document.body.classList.toggle('night-mode');
    document.querySelector('.container').classList.toggle('night-mode');

    if (document.body.classList.contains('night-mode')) {
        this.textContent = 'Toggle Light Mode';
        this.classList.add('night-mode');
    } else {
        this.textContent = 'Toggle Night Mode';
        this.classList.remove('night-mode');
    }
});

// PDF Receipt Generator
const { jsPDF } = window.jspdf;

function generatePDF() {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yOffset = margin;

    function addNewPage() {
        doc.addPage();
        yOffset = margin; // Reset yOffset for the new page
    }

    // Add a custom font for the header (optional)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text('Bill Splitter Receipt', pageWidth / 2, yOffset, null, null, 'center'); // Centered title
    yOffset += 10;

    // Add the date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, margin, yOffset);
    yOffset += 10;

    // Divider line after the header
    doc.setLineWidth(0.5);
    doc.line(margin, yOffset, pageWidth - margin, yOffset);
    yOffset += 10;

    // Table header for each person
    Object.keys(personTotals).forEach(person => {
        if (Array.isArray(personTotals[person]) && personTotals[person].length > 0) {
            // Check if adding this section will overflow the page
            if (yOffset + 30 > pageHeight - margin) {
                addNewPage();
            }

            // Person name as a header for each section
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text(`${person}'s Receipt`, margin, yOffset);
            yOffset += 10;

            // Table header (Food name, price, original price)
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text('Food Item', margin + 10, yOffset);
            doc.text('Original Price', margin + 90, yOffset);
            doc.text('Split Price (With Tax)', margin + 140, yOffset);
            yOffset += 6;

            // Table line
            doc.line(margin, yOffset, pageWidth - margin, yOffset);
            yOffset += 6;

            // Loop over each food item for this person
            personTotals[person].forEach(foodItem => {
                if (yOffset + 10 > pageHeight - margin) {
                    addNewPage();
                }
                doc.text(`${foodItem.foodName}`, margin + 10, yOffset);  // Food name
                doc.text(`$${foodItem.originalPrice.toFixed(2)}`, margin + 90, yOffset); // Original price
                doc.text(`$${foodItem.price.toFixed(2)}`, margin + 140, yOffset); // Split price
                yOffset += 8; // Spacing between items
            });

            // Person's total
            yOffset += 4; // Extra spacing before total
            if (yOffset + 10 > pageHeight - margin) {
                addNewPage();
            }
            doc.setFont("helvetica", "bold");
            doc.text(`Total for ${person}: $${personTotals[person].total.toFixed(2)}`, pageWidth - margin, yOffset, { align: "right" });
            yOffset += 10;
        }
    });

    // Calculate and display the total bill
    let totalBillAmount = Object.values(personTotals).reduce((acc, person) => acc + (person.total || 0), 0);
    if (yOffset + 20 > pageHeight - margin) {
        addNewPage();
    }
    doc.setFontSize(16);
    doc.text(`Total Bill: $${totalBillAmount.toFixed(2)}`, pageWidth - margin - 40, yOffset);
    yOffset += 20;  // Adjust to add spacing at the end

    // Add footer with page number (optional)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, null, null, 'center');
    }

    // Save the PDF
    doc.save('bill-splitter-receipt.pdf');
}

// Add a button to trigger PDF generation
const pdfButton = document.getElementById('pdfButton');
pdfButton.addEventListener('click', generatePDF);
