const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const nodemailer = require('nodemailer');


const app = express();
const port = 3000;



/////////////////////////////////////
/************* DB STRING ************ */
/////////////////////////////////////

const db = new pg.Client({
    user: "world_j3vg_user",
    host: "dpg-cojgia8cmk4c73bqv2mg-a",  ///string voor op render.com
    //host: "dpg-cojgia8cmk4c73bqv2mg-a.frankfurt-postgres.render.com", // string voor via local host
    database: "world_j3vg",
    password: "LuQNOF0WaL1Hw4LlydE1ZrDqMj24ZPfz",
    port: 5432,
    ssl: {
        rejectUnauthorized: false // Schakel SSL-certificaatverificatie uit (gebruik dit alleen voor ontwikkeling)
    }
});

db.connect();



/////////////////////////////////////
/************* Middleware ************ */
/////////////////////////////////////
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/views', express.static('views'));



/////////////////////////////////////
/************* Start Index ejs welkom paginga ************ */
/////////////////////////////////////
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


/////////////////////////////////////
/************* GET routes ************ */
/////////////////////////////////////

app.get('/bezoekers', (req, res) => {
    res.render('bezoekers.ejs');
});

app.get('/index', (req, res) => {
    res.render('index.ejs');
});

app.get('/boekOns', (req, res) => {
    res.render('boekOns.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/ledenKeuzeMenu', (req, res) => {
    res.render('ledenKeuzeMenu.ejs');
});

app.get('/instellingen', (req, res) => {
    res.render('WebsiteInstellingen.ejs');
});

app.get('/ledenzoeknr', (req, res) => {
    res.render('ledenzoeknr.ejs');
});

app.get('/ledendelete', (req, res) => {
    res.render('ledendelete.ejs');
});

app.get('/inventaris', (req, res) => {
    res.render('inventaris.ejs');
});

app.get('/doodle', (req, res) => {
    res.render('doodle.ejs');
});

app.get('/ledenLoginBeheer', (req, res) => {
    res.render('ledenLoginBeheer.ejs');
});

app.get('/muziek', (req, res) => {
    res.render('muziek.ejs');
});
app.get('/taken', (req, res) => {
    res.render('taken.ejs');
});

app.get('/Partituren', (req, res) => {
    res.render('Partituren.ejs');
});


app.get('/ledenAdresBeheer', (req, res) => {
    res.render('ledenAdresBeheer.ejs');
});

app.get('/financ', (req, res) => {
    res.render('financ.ejs');
});

app.get("/Ledenlijst", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM leden");
        const users = result.rows; // Gebruik de rijen die zijn opgehaald uit de database
        res.render("ledenlijst.ejs", { users: users }); // Geef de variabele users door aan de weergave
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/', (req, res) => {
    res.render('numberPicker', { initialValue: 0 }); // Initial value
});


app.get("/ledenBeheer", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM leden");
        const users = result.rows; // Gebruik de rijen die zijn opgehaald uit de database
        res.render("ledenBeheer.ejs", { users: users }); // Geef de variabele users door aan de weergave
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});





app.get("/leden/:lid_nr", async (req, res) => {
    try {
        const lid_nr = req.params.lid_nr; // Haal het lidnummer op uit de URL-parameter
        const result = await db.query("SELECT * FROM leden WHERE lid_nr = $1", [lid_nr]);
        if (result.rows.length === 0) {
            // Geen gebruiker gevonden met het opgegeven lidnummer
            res.status(404).send("Geen gebruiker gevonden met het opgegeven lidnummer.");
            return;
        }
        const user = result.rows[0]; // Gebruik de eerste rij die is opgehaald uit de database
        res.render("leden", { user: user}); // Geef de gebruikersgegevens door aan de weergave
    } catch (error) {
        console.error("Fout bij het ophalen van gegevens:", error);
        res.status(500).send("Interne serverfout");
    }
});


/////////////////////////////////////
/************* POST routes ************ */
/////////////////////////////////////
app.post("/addUser", async (req, res) => {
    const { voornaam, achternaam, email, gsm, straat, postcode, woonplaats, geboortedatum, sindsdatum, reknr, instrument,  helper } = req.body;


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

app.post("/leden", (req, res) => {
    const lidnummer = req.body.lidnummer;
    res.redirect(`/leden/${lidnummer}`);
});



app.post('/submit', (req, res) => {
    const { name, email, message } = req.body;

    // E-mailverzendopties
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'jouw@gmail.com', // Jouw e-mailadres
            pass: 'jouw_wachtwoord' // Jouw e-mailwachtwoord
        }
    });


    // E-mailinhoud
    const mailOptions = {
        from: 'jouw@gmail.com',
        to: 'ontvanger@gmail.com', // E-mailadres van de ontvanger
        subject: 'Nieuw bericht van contactformulier',
        text: `Naam: ${name}\nE-mail: ${email}\nBericht: ${message}`
    };


    // Verzend de e-mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.send('Er is een fout opgetreden bij het verzenden van de e-mail.');
        } else {
            console.log('E-mail verzonden: ' + info.response);
            res.send(`Bedankt ${name}! We hebben je bericht ontvangen en zullen zo spoedig mogelijk reageren.`);
        }
    });
});


app.post("/leden/addUser", async (req, res) => {
    const { voornaam, achternaam, email, gsm, straat, postcode, woonplaats, geboortedatum, sindsdatum, reknr, instrument, helper } = req.body;
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
