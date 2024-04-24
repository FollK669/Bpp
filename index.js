const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');



const app = express();
const port = 3000;

const multer = require('multer');
const upload = multer({ dest: '/images/' }); // Geef de map op waar de afbeelding wordt opgeslagen


const db = new pg.Client({
    user: "world_j3vg_user",
    host: "dpg-cojgia8cmk4c73bqv2mg-a",
    database: "world_j3vg",
    password: "LuQNOF0WaL1Hw4LlydE1ZrDqMj24ZPfz",
    port: 5432,
    ssl: {
        rejectUnauthorized: false // Schakel SSL-certificaatverificatie uit (gebruik dit alleen voor ontwikkeling)
    }
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/views', express.static('views'));

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM leden");
        const users = result.rows; // Gebruik de rijen die zijn opgehaald uit de database
        res.render("index.ejs", { users: users }); // Geef de variabele users door aan de weergave
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});




app.get('/bezoekers', (req, res) => {
    res.render('bezoekers.ejs');
});

app.get('/index', (req, res) => {
    res.render('index.ejs');
});

app.get('/boekOns', (req, res) => {
    res.render('boekOns.ejs');
});

app.get("/leden", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM leden");
        const users = result.rows; // Gebruik de rijen die zijn opgehaald uit de database
        res.render("leden.ejs", { users: users }); // Geef de variabele users door aan de weergave
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post("/addUser", async (req, res) => {
    const { voornaam, achternaam, email, gsm, straat, postcode, woonplaats, geboortedatum, sindsdatum, reknr, instrument,  helper } = req.body;

    // Controleer of er een bestand is geüpload
 

    try {
        console.log("Ontvangen voornaam:", voornaam);
        console.log("Ontvangen achternaam:", achternaam);
        console.log("Ontvangen email:", email);

        // Voeg de gebruiker toe aan de database, inclusief het pad naar de afbeelding
        const result = await db.query("INSERT INTO leden (lid_vnaam, lid_ANaam, lid_Email, lid_gsm, lid_straat, lid_postcode, lid_woonplaats, lid_geboortedatum, lid_sinds_datum, lid_rek_nr, lid_instrument, lid_helper ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *", [voornaam, achternaam, email, gsm, straat, postcode, woonplaats, geboortedatum, sindsdatum, reknr, instrument, helper]);

        console.log("Gebruiker toegevoegd:", result.rows[0]); // Controleer of de gebruiker is toegevoegd
        res.status(201).send("Gebruiker succesvol toegevoegd!");
    } catch (error) {
        console.error("Fout bij toevoegen van gebruiker:", error);
        res.status(500).send("Interne serverfout: " + error.message); // Stuur het specifieke foutbericht terug
    }


});



app.post("/leden/addUser", async (req, res) => {
    const { voornaam, achternaam, email, gsm, straat, postcode, woonplaats, geboortedatum, sindsdatum, reknr, instrument, helper } = req.body;

    // Controleer of er een bestand is geüpload


    try {
        console.log("Ontvangen voornaam:", voornaam);
        console.log("Ontvangen achternaam:", achternaam);
        console.log("Ontvangen email:", email);

        // Voeg de gebruiker toe aan de database, inclusief het pad naar de afbeelding
        const result = await db.query("INSERT INTO leden (lid_vnaam, lid_ANaam, lid_Email, lid_gsm, lid_straat, lid_postcode, lid_woonplaats, lid_geboortedatum, lid_sinds_datum, lid_rek_nr, lid_instrument, lid_helper ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *", [voornaam, achternaam, email, gsm, straat, postcode, woonplaats, geboortedatum, sindsdatum, reknr, instrument, helper]);

        console.log("Gebruiker toegevoegd:", result.rows[0]); // Controleer of de gebruiker is toegevoegd
        res.status(201).send("Gebruiker succesvol toegevoegd!");
    } catch (error) {
        console.error("Fout bij toevoegen van gebruiker:", error);
        res.status(500).send("Interne serverfout: " + error.message); // Stuur het specifieke foutbericht terug
    }


});




app.post("/deleteMembers", async (req, res) => {
    try {
        // Voer een query uit om alle leden te verwijderen
        const result = await db.query("DELETE FROM Leden");

        console.log("Alle leden zijn verwijderd."); // Logging voor controle
        res.redirect("/"); // Redirect naar de startpagina of een andere gewenste locatie
    } catch (error) {
        console.error("Fout bij het verwijderen van alle leden:", error);
        res.status(500).send("Interne serverfout: " + error.message); // Stuur het specifieke foutbericht terug
    }
});

app.post("/leden/deleteMembers", async (req, res) => {
    try {
        // Voer een query uit om alle leden te verwijderen
        const result = await db.query("DELETE FROM Leden");

        console.log("Alle leden zijn verwijderd."); // Logging voor controle
        res.redirect("/"); // Redirect naar de startpagina of een andere gewenste locatie
    } catch (error) {
        console.error("Fout bij het verwijderen van alle leden:", error);
        res.status(500).send("Interne serverfout: " + error.message); // Stuur het specifieke foutbericht terug
    }
});















app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
