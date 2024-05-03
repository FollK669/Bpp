
const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { Strategy } = require("passport-local");
const session = require("express-session");
const env = require("dotenv");
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;
env.config();


app.use(
    session({
        secret: "TOPSECRETWORD",
        resave: false,
        saveUninitialized: true,
    })
);

/////////////////////////////////////
/************* DB STRING ************ */
/////////////////////////////////////

const db = new pg.Client({
    user: "world_j3vg_user",
    host: "dpg-cojgia8cmk4c73bqv2mg-a",  ///string voor op render.com
// host: "dpg-cojgia8cmk4c73bqv2mg-a.frankfurt-postgres.render.com", // string voor via local host
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
app.use(passport.initialize());
app.use(passport.session());



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/views', express.static('views'));



/////////////////////////////////////
/************* Start Index ejs welkom paginga ************ */
/////////////////////////////////////

app.get("/", async (req, res) => {

        res.render('index.ejs'); // Geef de variabele users door aan de weergave
  
});


//////////////////////////////////////////////////////
/************* GET routes zonder LOGIN ************ */
///////////////////////////////////////////////////

app.get('/bezoekers', (req, res) => {
    res.render('bezoekers.ejs');
});

app.get('/bezoekersleden', (req, res) => {
    res.render('bezoekersLeden.ejs');
});

    app.get('/bezoekersledenlid1', (req, res) => {
        res.render('bezoekersLedenLid1.ejs');
    });

    app.get('/index', (req, res) => {
        res.render('index.ejs');
    });

    app.get('/boekOns', (req, res) => {
        res.render('boekons2.ejs');
    });

   



    app.get('/logmenu', (req, res) => {
        res.render('logmenu.ejs');
    });














/////////////////////////////////////
/************* Login-out GET  ************ */
/////////////////////////////////////

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});


//////////////////////////////////////////////////////
/************* GET routes zonder LOGIN ************ */
///////////////////////////////////////////////////

app.get("/login2", (req, res) => {
    // console.log(req.user);
    if (req.isAuthenticated()) {
        res.render("login2.ejs");
    } else {
        res.redirect("/login");
    }
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







/*OVERBODIG NADIEN VERWIJDEREN*/ 
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
        res.render("leden", { user: user }); // Geef de gebruikersgegevens door aan de weergave
    } catch (error) {
        console.error("Fout bij het ophalen van gegevens:", error);
        res.status(500).send("Interne serverfout");
    }
});


app.get("/ledenKeuzeMenu", (req, res) => {
    // console.log(req.user);
    if (req.isAuthenticated()) {
        res.render("ledenKeuzeMenu.ejs");
    } else {
        res.redirect("/logmenu");
    }
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


app.get('/vergeten', (req, res) => {
    res.render('vergeten.ejs');
});


app.get('/Newlid', (req, res) => {
    res.render('Newlid.ejs');
});


    /////////////////////////////////////
    /************* POST routes ************ */
    /////////////////////////////////////
    app.post("/addUser", async (req, res) => {
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
                user: 'kenfoll78@gmail.com', // Jouw e-mailadres
                pass: '1234' // Jouw e-mailwachtwoord
            }
        });


        // E-mailinhoud
        const mailOptions = {
            from: 'kenfoll78@gmail.com',
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




/////////////////////////////////////
/************* POST login out ************ */
/////////////////////////////////////


app.post(
    "/logmenu",
    passport.authenticate("local", {
        successRedirect: "/ledenKeuzeMenu",
        failureRedirect: "/logmenu",
    })
);

app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);

        if (checkResult.rows.length > 0) {
            req.redirect("logmenu");
        } else {
            bcrypt.hash(password, 2, async (err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                } else {
                    const result = await db.query(
                        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
                        [email, hash]
                    );
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        console.log("success");
                        res.redirect("/logmenu");
                    });
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
});

passport.use(
    new Strategy(async function verify(username, password, cb) {
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
                username,
            ]);
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const storedHashedPassword = user.password;
                bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                    if (err) {
                        //Error with password check
                        console.error("Error comparing passwords:", err);
                        return cb(err);
                    } else {
                        if (valid) {
                            //Passed password check
                            return cb(null, user);
                        } else {
                            //Did not pass password check
                            return cb(null, false);
                        }
                    }
                });
            } else {
                return cb("User not found");
            }
        } catch (err) {
            console.log(err);
        }
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});









    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });


