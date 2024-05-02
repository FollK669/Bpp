function openPageLeden() {
    // Vervang 'andere_pagina.html' door de URL van de pagina die je wilt openen
    window.location.href = '/leden';
}

function openPageBoek() {
    // Vervang 'andere_pagina.html' door de URL van de pagina die je wilt openen
    window.location.href = '/boekOns';
}

function openPageBezoekers() {
    // Vervang 'andere_pagina.html' door de URL van de pagina die je wilt openen
    window.location.href = '/bezoekers';
}

function openPageHome() {
    // Vervang 'andere_pagina.html' door de URL van de pagina die je wilt openen
    window.location.href = '/index';
}

function openPageLogin() {
    // Vervang 'andere_pagina.html' door de URL van de pagina die je wilt openen
    window.location.href = '/login';
}

// JavaScript code to handle incrementing and decrementing the value
let value = 1; // Initial value from EJS
const valueLabel = document.getElementById('valueLabel');

function increment() {



    value++;
    updateLabel();
}

function decrement() {

    if (value > 1) {
        value--;
    }

    updateLabel();
}

function updateLabel() {
    valueLabel.textContent = value;
}



function toggleMenu() {
    var sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show-sidebar");
}

function toggleDropdown() {
    var dropdownMenu = document.getElementById("myDropdown");
    if (dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
    } else {
        dropdownMenu.style.display = "block";
    }
}// JavaScript source code


// Definieer een JavaScript-functie om alle leden te verwijderen
async function deleteAllMembers() {
    try {
        const response = await fetch("/leden/deleteMembers", {
            method: "POST",
        });

        if (response.ok) {
            const result = await response.text();
            console.log(result); // Logging voor controle
            alert("Alle leden zijn verwijderd."); // Toon een melding dat alle leden zijn verwijderd
            window.location.reload(); // Ververs de pagina om de veranderingen te tonen
        } else {
            throw new Error("Fout bij het verwijderen van alle leden");
        }
    } catch (error) {
        console.error("Fout bij het verwijderen van alle leden:", error);
        alert("Er is een fout opgetreden bij het verwijderen van alle leden. Raadpleeg de console voor meer informatie.");
    }
}



function confirmCheck() {
    var confirmationInput = document.getElementById("confirmation").value;
    // Hier kun je de controle uitvoeren, bijvoorbeeld vergelijken met een vooraf gedefinieerd controlegetal
    var controlNumber = "1234"; // Dit is slechts een voorbeeld, vervang dit met je eigen controlegetal
    if (confirmationInput !== controlNumber) {
        alert("Het ingevoerde controlegetal is onjuist.");
        return false; // Voorkom dat het formulier wordt verzonden
    }
    return true; // Laat het formulier verzenden als het controlegetal overeenkomt
}

function Darktheme() {
    // Vervang 'andere_pagina.html' door de URL van de pagina die je wilt openen
    window.location.href = 'index.html';
}




function addClassToDiv() {
    // Selecteer de div
    var myDiv = document.getElementById('myDiv');

    // Voeg de klasse toe
    myDiv.classList.add('starWars');

    // Zorg ervoor dat de standaardgedrag van de hyperlink niet wordt uitgevoerd
    event.preventDefault();
}



window.onload = function () {
    const swipeElement = document.getElementById('swipeElement');
    const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints);

    if (isTouchDevice) {
        // If touch device, create and append image element
        const img = document.createElement('img');
        img.src = 'images/achter.jpg';
        img.alt = 'Swipe Me';
        img.id = 'swipeImage';
        swipeElement.appendChild(img);
    } else {
        // If not touch device, create and append button element
        const button = document.createElement('button');
        button.id = 'swipeButton';
        
        button.onclick = handleSwipe;
        swipeElement.appendChild(button);
    }

    // Add swipe handling logic
    function handleSwipe(event) {
        event.preventDefault();
        let startX;

        if (isTouchDevice) {
            startX = event.touches[0].clientX;
        } else {
            startX = event.clientX;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(event) {
            const endX = event.clientX;
            const deltaX = endX - startX;

            if (deltaX > 0) {
                swipeElement.classList.add('swipe-right');
            } else if (deltaX < 0) {
                swipeElement.classList.add('swipe-left');
            }
        }

        function onMouseUp(event) {
            const endX = event.clientX;
            const deltaX = endX - startX;

            if (deltaX > 50) {
                // Swipe right action
                console.log('Swiped right!');
                // Navigate to a page on right swipe
                window.location.href = "/logmenu";
            } else if (deltaX < -50) {
                // Swipe left action
                console.log('Swiped left!');
                // Navigate to a page on left swipe
                window.location.href = "/logmenu";
            }

            swipeElement.classList.remove('swipe-left', 'swipe-right');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
};
