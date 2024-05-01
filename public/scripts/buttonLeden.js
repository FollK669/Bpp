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
function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Hier zou je normaal gesproken de inloggegevens naar een server sturen voor verificatie
    // Voor dit voorbeeld controleren we gewoon of beide velden zijn ingevuld

    if (username && password) {
        // Simuleer een geslaagde inlogpoging
        alert('Inloggen gelukt!');
        window.location.href = '/ledenKeuzeMenu';
        // Hier zou je de gebruiker naar een andere pagina kunnen doorsturen, of iets anders kunnen doen na het inloggen
    } else {
        // Toon een foutmelding als een van de velden leeg is
        document.getElementById('error-message').innerText = 'Vul zowel gebruikersnaam als wachtwoord in.';
    }
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



// JavaScript source code
window.addEventListener('resize', function () {
    var selectBox = document.getElementById('topRightSelectBox');
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    selectBox.style.top = '0';
    selectBox.style.right = '10px';
});

// Voer de functie uit wanneer de pagina is geladen



function toggleDropdown() {
    var dropdownMenu = document.getElementById("myDropdown");
    if (dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
    } else {
        dropdownMenu.style.display = "block";
    }
}// JavaScript source code



const moveableImage = document.getElementById('moveableImage');
const targetArea = document.getElementById('targetArea');
let isDragging = false;
let startX = 0;
let pageOpened = false;

moveableImage.addEventListener('mousedown', handleMouseDown);
moveableImage.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousemove', handleMouseMove);

moveableImage.addEventListener('touchstart', handleTouchStart);
moveableImage.addEventListener('touchend', handleTouchEnd);
document.addEventListener('touchmove', handleTouchMove);

function handleMouseDown(event) {
    if (!pageOpened) {
        isDragging = true;
        startX = event.clientX;
    }
}

function handleMouseUp(event) {
    if (!pageOpened) {
        isDragging = false;
        const endX = event.clientX;
        const diff = endX - startX;
        checkSwipe(diff);
    }
}

function handleMouseMove(event) {
    if (isDragging && !pageOpened) {
        moveImage(event.clientX, event.clientY);
    }
}

function handleTouchStart(event) {
    if (!pageOpened) {
        isDragging = true;
        startX = event.touches[0].clientX;
    }
}

function handleTouchEnd(event) {
    if (!pageOpened) {
        isDragging = false;
        const endX = event.changedTouches[0].clientX;
        const diff = endX - startX;
        checkSwipe(diff);
    }
}

function handleTouchMove(event) {
    if (isDragging && !pageOpened) {
        const touch = event.touches[0];
        moveImage(touch.clientX, touch.clientY);
    }
}

function moveImage(x, y) {
    moveableImage.style.left = `${x - moveableImage.offsetWidth / 2}px`;
    moveableImage.style.top = `${y - moveableImage.offsetHeight / 2}px`;

    // Check if the image overlaps with the target area
    const imageRect = moveableImage.getBoundingClientRect();
    const targetRect = targetArea.getBoundingClientRect();

    if (
        imageRect.left < targetRect.right &&
        imageRect.right > targetRect.left &&
        imageRect.top < targetRect.bottom &&
        imageRect.bottom > targetRect.top
    ) {
        // Open a new page if the image overlaps with the target area
        window.open('https://example.com', '_blank');
        pageOpened = true; // Set pageOpened to true once the page is opened
        // Remove event listeners to prevent further dragging/swiping
        removeEventListeners();
    }
}

function checkSwipe(diff) {
    if (!pageOpened && Math.abs(diff) > 50) { // Adjust swipe threshold as needed
        // Open a new page if swipe distance is greater than threshold
        window.open('https://example.com', '_blank');
        pageOpened = true; // Set pageOpened to true once the page is opened
        // Remove event listeners to prevent further dragging/swiping
        removeEventListeners();
    }
}

function removeEventListeners() {
    moveableImage.removeEventListener('mousedown', handleMouseDown);
    moveableImage.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleMouseMove);
    moveableImage.removeEventListener('touchstart', handleTouchStart);
    moveableImage.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchmove', handleTouchMove);
}
