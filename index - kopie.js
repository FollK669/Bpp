const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { Strategy } = require("passport-local");
const session = require("express-session");
const env = require("dotenv");
const nodemailer = require('nodemailer');
const multer = require('multer');
const flash = require('connect-flash');
const path = require('path');
const fs = require('fs');


const jimp = require('jimp');
const rateLimit = require("express-rate-limit");
const googleAPICommon = require('googleapis-common');
const upload = multer({ dest: 'public/images/' });
const { check, validationResult } = require('express-validator');

const { google } = require('googleapis');
require('dotenv').config();
const i18n = require('i18n');
const cookieParser = require('cookie-parser');





/////////////////////////////////////
////DEV purposes only////////////////////////
/////////////////////////////////////




// Create a rate limiter middleware
const loginRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // Maximum number of requests allowed within the window
    message: "Too many login attempts. Please try again later.",
});



/////////////////////////////////////
/************* Check if dir exist and create if needed ************ */
/////////////////////////////////////
const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

const dirResized = './uploads/resized';
if (!fs.existsSync(dirResized)) {
    fs.mkdirSync(dirResized);
}

const localesDir = './locales';
if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir);
}




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, dir)); // Use path.join to create the correct path
    },
    filename: function (req, file, cb) {
        const date = new Date().toISOString().replace(/:/g, '-');
        cb(null, date + file.originalname);
    }
});











                
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


app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})



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
/************* Routes ************ */
/////////////////////////////////////
app.use(bodyParser.json());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/views', express.static('views'));
app.use('/uploads', express.static('uploads'));


/////////////////////////////////////
/************* Middleware ************ */
/////////////////////////////////////
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cookieParser());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

i18n.configure({
    locales: ['en', 'nl'], // The locales you support
    directory: __dirname + '/locales', // The directory where your locale files will be stored
    objectNotation: true, // This allows you to use nested JSON objects for your locale files
    cookie: 'language', // Set the cookie name to 'language'
    queryParameter: 'lang', // Set the query parameter name to 'lang'
    defaultLocale: 'nl', // Set the default locale to 'en'
});
// Middleware to load the language preference from the cookie

app.use(i18n.init);


// Define your language options globally
const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'nl', label: 'Dutch' }
];
// Define your routes after the i18n middleware


// Route to handle language selection
// Route to handle language selection and save the preference in a cookie
app.post("/language", (req, res) => {
    const selectedLanguage = req.body.language; // Set the default language to English if not provided
    req.setLocale(selectedLanguage);

    // Save the selected language preference in a cookie
    res.cookie("language", selectedLanguage, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // Cookie expires in 30 days

    console.log("Selected language:", selectedLanguage);
    res.status(200).send({ message: 'Language updated successfully' });
});

// Middleware to load the language preference from the cookie
app.use((req, res, next) => {
    const selectedLanguage = req.cookies.language; // Set the default language to English if not provided
    if (selectedLanguage) {
        req.setLocale(selectedLanguage);
    }
    next();
});


app.get("/language", (req, res) => {
    const selectedLanguage = req.getLocale(); // Set the default language to English if not provided
    res.status(200).send({ language: selectedLanguage });
});




/////////////////////////////////////
/************* read instrumenten.txt ************ */
/////////////////////////////////////

const readInstrumentenFile = async () => {
    try {
        const filePath = path.join(__dirname, 'instrumenten.txt');
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const instrumenten = data.split('\n');
        return instrumenten;
    } catch (error) {
        console.error(error);
        res.status(500).send(req.__('errors.randomError'));
    }
};



/////////////////////////////////////
/************* Start Index ejs welcome page ************ */
/////////////////////////////////////

app.get("/", async (req, res) => {
    try {
        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);
        const errorMessage = req.flash("error")[0]; // Get the first error message from the flash messages
        const selectedLanguage = req.cookies.language ; // Set the default language to English if not provided in the cookie

        console.log("Selected language B:", selectedLanguage);
   
        res.render('index.ejs', { error: errorMessage, color: settings.color, background: settings.background, image: settings.image, languageOptions, selectedLanguage }, function (err, html) {
            if (err) {
                console.error(err); // Log the error for debugging purposes
                res.status(500).send(req.__('errors.pageLoadError')); //ERROR From json file
            } else {
                res.send(html);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
}); 



// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('/react', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

/////////////////////////////////////////////////////
/************* GET routes NO LOGIN ************ */
///////////////////////////////////////////////////


// Declare languageOptions and selectedLanguage as global variables
// Function to update the selected language and language options


// Route to render the bezoekers.ejs page with language select box
app.get("/bezoekers", (req, res) => {

    const selectedLanguage = req.cookies.language; 



    res.render('logged-out/bezoekers.ejs', {
        languageOptions, selectedLanguage
    }, function (err, html) {
        if (err) {
            console.error(err); // Log the error for debugging purposes
            res.status(500).send(req.__('errors.pageLoadError')); //ERROR From json file
        } else {
            res.send(html);
        }
    });
});










app.get("/hetweer", (req, res) => {
    res.render('logged-out/hetweer.ejs', function (err, html) {
        if (err) {
            console.error(err); // Log the error for debugging purposes
            res.status(500).send(req.__('errors.pageLoadError')); //ERROR From json file
        } else {
            res.send(html);
        }
    });
});








app.post('/saveENG', (req, res) => {
    const homepage = req.body.homepage;
    const welcome = req.body.welcome
    const moreinfo = req.body.moreinfo;

    fs99.readFile('./locales/en.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('An error occurred while reading the file.');
            return;
        }

        const jsonContent = JSON.parse(data);
        jsonContent.titles.homepage = homepage;
        jsonContent.titles.welcome = welcome;
        jsonContent.titles.moreinfo = moreinfo;
        fs.writeFile('./locales/en.json', JSON.stringify(jsonContent, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('An error occurred while writing to the file.');
                return;
            }
            res.redirect('/instellingen');
        });
    });
});


app.post('/saveNL', (req, res) => {
    const homepagenl = req.body.homepageNL;
    const welcomenl = req.body.welcomeNL;
    const moreinfonl = req.body.moreinfoNL;

    fs99.readFile('./locales/nl.json', 'utf8', (err, dataNL) => {
        if (err) {
            console.error(err);
            res.status(500).send('An error occurred while reading the file.');
            return;
        }

        const jsonContentnl = JSON.parse(dataNL);
        jsonContentnl.titles.homepage = homepagenl;
        jsonContentnl.titles.welcome = welcomenl;
        jsonContentnl.titles.moreinfo = moreinfonl; // Corrected line
        fs.writeFile('./locales/nl.json', JSON.stringify(jsonContentnl, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('An error occurred while writing to the file.');
                return;
            }
            res.redirect('/instellingen');
        });
    });
});








const fs2 = require('fs').promises;
/////////////////////////////////////////////////////
/************* Instellingen stuff ************ */
///////////////////////////////////////////////////
// Function to load settings from settings.json file
const loadSettings = async (filePath) => {
    try {
        let settings;

        // Check if the file exists
        const fileExists = await fs2.access(filePath, fs2.constants.F_OK)
            .then(() => true)
            .catch(() => false);

        if (fileExists) {
            // If the file exists, read it
            const data = await fs2.readFile(filePath, 'utf-8');
            settings = JSON.parse(data);
        } else {
            // If the file doesn't exist, create it with default values
            settings = { color: 'black', background: 'black', image: '/images/icon.jpg' };
            await fs2.writeFile(filePath, JSON.stringify(settings), 'utf-8');
        }

        return settings;
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
};





app.get("/logmenu", async (req, res) => {
    try {
        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);

        const errorMessage = req.flash("error")[0] || ""; // Get the first error message from the flash messages or set it to an empty string if it doesn't exist

        // Pass the settings and the error message to the view
        res.render('logged-out/logmenu.ejs', { error: errorMessage, color: settings.color, background: settings.background , image: settings.image });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});




app.get('/overzichtplaylijst', (req, res) => {
    const filePath = path.join(__dirname, '/localJson');
    fs.readdir(filePath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return res.status(500).send('Error reading folder');
        }

        const jsonFiles = files.filter(file => file.endsWith('.json'));
        res.render('logged-in/Overzichtplaylijst.ejs', { jsonFiles }); // Pass jsonFiles to the template
    });
});




app.get('/bezoekersleden', async (req, res) => {
    try {
        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);

        const errorMessage = req.flash("error")[0];


        const result = await db.query("SELECT voornaam, achternaam, afbeelding , instrument FROM users");/************* visitors access to DB! ************ */
        const leden = result.rows;
        res.render('logged-out/bezoekersleden.ejs', { leden, error: errorMessage, color: settings.color, background: settings.background, image: settings.image });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});



app.get('/Overzichtparituren', async (req, res) => {
    try {
        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);

        const errorMessage = req.flash("error")[0];


        const result = await db.query("SELECT * FROM nummers");/************* visitors access to DB! ************ */
        const nummers = result.rows;
        res.render('logged-out/Overzichtparituren.ejs', { nummers, error: errorMessage, color: settings.color, background: settings.background, image: settings.image });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});




app.get("/logmenu", async (req, res) => {
    try {
        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);

        const errorMessage = req.flash("error")[0]; // Get the first error message from the flash messages

        // Pass the settings and the error message to the view
        res.render('logged-out/logmenu.ejs', { error: errorMessage, color: settings.color, background: settings.background, image: settings.image });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});
/////////////////////////////////////////////////////
/************* GET routes WITH  LOGIN ************ */
///////////////////////////////////////////////////

app.get("/mainmenu", async (req, res) => {

    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }

    const email = req.user.email; // get the 'voornaam' of the lid

    try {
     
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]); ///////// logged user email value

        if (result.rows.length > 0) {
            const user = result.rows[0];
            delete user.password; // Remove password from the user object


            res.render('logged-in/mainMenu.ejs', { user: user });
        } else {
            res.redirect('logged-out/logmenu.ejs');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }

});




app.get('/bezoekersledenlogin', async (req, res) => {

    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }
    try {
        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);

        const errorMessage = req.flash("error")[0];


        const result = await db.query("SELECT voornaam, achternaam, afbeelding , instrument FROM users");/************* visitors access to DB! ************ */
        const leden = result.rows;
        res.render('logged-in/bezoekersleden.ejs', { leden, error: errorMessage, color: settings.color, background: settings.background, image: settings.image });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});


app.get('/Overzichtpariturenlogin', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }
    try {
        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);

        const errorMessage = req.flash("error")[0];


        const result = await db.query("SELECT * FROM nummers");/************* visitors access to DB! ************ */
        const nummers = result.rows;
        res.render('logged-in/Overzichtparituren.ejs', { nummers, error: errorMessage, color: settings.color, background: settings.background, image: settings.image });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});

app.get("/nieuweplaylijst", async (req, res) => {

  

    try {
        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);

        const errorMessage = req.flash("error")[0]; // Get the first error message from the flash messages
        const result = await db.query('SELECT * FROM nummers');
        const nummers = result.rows;
        // Pass the settings and the error message to the view
        res.render('logged-in/Nieuweplaylijst.ejs', { nummers, error: errorMessage, color: settings.color, background: settings.background, image: settings.image });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});


const fs99 = require('fs');
app.get('/instellingen', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }

    try {
        const enData = await fs.promises.readFile('./locales/en.json', 'utf8');
        const enContent = JSON.parse(enData);
        const homepageTitleENG = enContent.titles.homepage;
        const welcomeTitleENG = enContent.titles.welcome;
        const moreTitleENG = enContent.titles.moreinfo;
        const nlData = await fs.promises.readFile('./locales/nl.json', 'utf8');
        const nlContent = JSON.parse(nlData);
        const homepageTitleNL = nlContent.titles.homepage;
        const welcomeTitleNL = nlContent.titles.welcome;
        const moreTitleNL = nlContent.titles.moreinfo;
        const selectedLanguage = req.cookies.language; // Set the default language to English if not provided in the cookie

        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);

        const errorMessage = req.flash("error")[0]; // Get the first error message from the flash messages

        res.render('logged-in/Instellingen.ejs', { error: errorMessage, color: settings.color, background: settings.background, image: settings.image, homepageTitleENG, welcomeTitleENG, homepageTitleNL, welcomeTitleNL, moreTitleENG, moreTitleNL,languageOptions, selectedLanguage });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});


/////////////////////////////////////
/************* new lid  ************ */
/////////////////////////////////////

app.get("/newlid", async (req, res) => {

    if (req.isAuthenticated()) {   
        try {    
            const instrumenten = await readInstrumentenFile();   //filling the suggestion list with instruments
            res.render('logged-in/Newlids.ejs', {  instrumenten: instrumenten });

        } catch (err) {
            console.error(err);
            res.status(500).send(req.__('errors.randomError'));
        }
    } else {
        res.redirect("/logmenu");
    }

});




/////////////////////////////////////
/************* default JSON for instellingen  ************ */
/////////////////////////////////////








/////////////////////////////////////
/************* update lid  ************ */
/////////////////////////////////////


// Function to get user by email and render update lid page
const renderUpdateLidPage = async (req, res, email, error = null, msg = false) => {
    try {
        const instrumenten = await readInstrumentenFile(); //filling the suggestion list with instruments
        const emailResult = await db.query("SELECT email FROM users"); //filling combobox with all users
        const emails = emailResult.rows.map(row => row.email);
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]); //search by email
        const user = result.rows.length > 0 ? result.rows[0] : {//if the user is emtpy because of the empty search.
            email: "",
            voornaam: "",
            achternaam: "",
            postcode: "",
            rlvl: "",
            instrument: "",
            afbeelding: ""
        };

        if (result.rows.length === 0) {
            error = "Geen gebruiker gevonden met dit emailadres";
            msg = true;
        } else {
            delete user.password;
        }
        res.render('logged-in/updatelid.ejs', { user, instrumenten, emails, error, msg });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
};


app.get("/updatelid", async (req, res) => {  //update lid page
    if (req.isAuthenticated()) {
        await renderUpdateLidPage(req, res, req.user.email);
    } else {
        res.redirect("/logmenu");
    }
});


app.get("/updatemail", async (req, res) => {   //combo box search
    if (req.isAuthenticated()) {
        await renderUpdateLidPage(req, res, req.query.email);
    } else {
        res.redirect("/logmenu");
    }
});

app.get('/search', async (req, res) => { //search by email
    if (req.isAuthenticated()) {
        await renderUpdateLidPage(req, res, req.query.query);
    } else {
        res.redirect("/logmenu");
    }
});







/////////////////////////////////////
/************* update song  ************ */
/////////////////////////////////////
app.get('/updatenummer', async (req, res) => {  //update nummer page
    if (req.isAuthenticated()) {
        await renderUpdateNummerPage(req, res, req.query.nr_naam);
    } else {
        res.redirect("/logmenu");
    }
});

app.get('/searchnummer', async (req, res) => { //search by nummerId
    if (req.isAuthenticated()) {
        await renderUpdateNummerPage(req, res, req.query.query);
    } else {
        res.redirect("/logmenu");
    }
});

const renderUpdateNummerPage = async (req, res, nr_naam = '', error = null, msg = false) => {
    try {
        const nrResult = await db.query("SELECT nr_naam FROM nummers"); //filling combobox with all nummers
        const nr = nrResult.rows.map(row => row.nr_naam);

        let nummer = null;
        if (nr_naam) {
            const result = await db.query("SELECT id, nr_naam, nr_uitvoerder ,nr_genre, nr_aantalkerengespeeld, nr_partituur, nr_info, EXTRACT(HOUR FROM nr_duur) || ' uur : ' || EXTRACT(MINUTE FROM nr_duur) || ' minuten : ' || ROUND(EXTRACT(SECOND FROM nr_duur)) || ' seconden :' as nr_duur FROM nummers WHERE nr_naam LIKE $1", [`%${nr_naam}%`]); //search by nr_nam
            nummer = result.rows.length > 0 ? result.rows[0] : null;
        } else if (nr.length > 0) {
            const result = await db.query("SELECT id,nr_naam, nr_genre , nr_uitvoerder, nr_aantalkerengespeeld, nr_partituur,nr_info, EXTRACT(HOUR FROM nr_duur) || ' uur : ' || EXTRACT(MINUTE FROM nr_duur) || ' minuten : ' || ROUND(EXTRACT(SECOND FROM nr_duur)) || ' seconden : ' as nr_duur FROM nummers WHERE nr_naam = $1", [nr[0]]); //get first nummer
            nummer = result.rows.length > 0 ? result.rows[0] : null;
        }

        if (!nummer) {
            error = "Geen nummer gevonden met deze nr_naam";
            msg = false;
        }

        res.render('logged-in/updatepart.ejs', { nummer, nr, error, msg });
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }

    
};













const strftime = require('strftime');

app.get('/Updatepartituren', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }

    const result = await db.query('SELECT * FROM nummers');



   const nummers = result.rows;


  
    res.render('logged-in/Updatepartituren.ejs', { nummers });
});



app.get('/searchsong', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }
    const searchsong = req.query.searchsong;
    const result = await db.query('SELECT * FROM nummers WHERE nr_naam LIKE $1', [`%${searchsong}%`]);
    const nummers = result.rows;
    res.render('logged-in/Updatepartituren.ejs', { nummers });
});








/////////////////////////////////////
/************* Route to the new partituur /song ************ */
/////////////////////////////////////


app.get("/nieuwpartituur", async (req, res) => {

    if (req.isAuthenticated()) {
        try {
            const result = await db.query('SELECT * FROM nummers');



            const nummers = result.rows; res.render('logged-in/Nieuwepartituur.ejs', { nummers });

        } catch (err) {
            console.error(err);
            res.status(500).send(req.__('errors.randomError'));
        }
    } else {
        res.redirect("/logmenu");
    }

});




/////////////////////////////////////
/************* Log-out GET  ************ */
/////////////////////////////////////

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});





/////////////////////////////////////
/************* POST ************ */
/////////////////////////////////////






/////////////////////////////////////
/************* INLOG, passport, limit login to loginRateLimiter ************ */
/////////////////////////////////////


app.post("/inloggen", loginRateLimiter, passport.authenticate("local", {
    successRedirect: "/mainmenu",
    failureRedirect: "/logmenu?error=InvalidCredentials",
    failureFlash: "Fout bij inloggen",
}));






/////////////////////////////////////
/************* RESET JSON SETtings ************ */
/////////////////////////////////////


app.post("/reset", async (req, res) => {
    try {
        // Define the paths to the files
        const defaultFilePath = path.join(__dirname, '/public', 'default.json');
        const settingsFilePath = path.join(__dirname, '/public', 'settings.json');

        // Read the default settings
        const defaultSettings = await fs2.readFile(defaultFilePath, 'utf-8');

        // Write the default settings to the settings file
        await fs2.writeFile(settingsFilePath, defaultSettings, 'utf-8');

        res.redirect('/instellingen');
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});


app.post("/opslaan_lijst", async (req, res) => {
    try {
        const lijstNaam = req.body.lijst_naam;
        const aantalGespeeld = req.body.lijst_aantal;
        const lijstType = req.body.lijst_type;
        const nummers = req.body.lijst_nummernaam; // Check if req.body.lijst_nummernaam2 exists before splitting
      console.log(nummers);
       

     


        const filePath = path.join(__dirname, 'lijst.json');
        const data = {
            lijstNaam,
            aantalGespeeld,
            lijstType,
            nummers
        };
        console.log(data);
        const jsonData = JSON.stringify(data, null, 2);

        await fs2.writeFile(filePath, jsonData, 'utf-8');

        res.redirect('/mainmenu');
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const fs987 = require('fs');


app.post('/save-values', (req, res) => {
    console.log(req.body); // Log the received data

    const lijstNaam = req.body.lijst_naam;
    const values = {
        lijst_aantal: req.body.lijst_aantal,
        lijst_type: req.body.lijst_type,
        lijst_nummernaam2: req.body.mySelect
       
    };
    console.log(values);
    // Generate a unique filename based on the playlist name
    const fileName = `${lijstNaam}.json`;

    // Save the values to a new JSON file in the localJson directory
    const filePath = path.join(__dirname, 'localJson', fileName);
    fs987.writeFile(filePath, JSON.stringify(values, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        console.log(`Values saved to ${fileName}`);
        res.json({ success: true });
    });
});

app.post("/resetENG", async (req, res) => {
    try {
        // Define the paths to the files
        const defaultFilePath = path.join(__dirname, '/locales', 'DEFen.json');
        const settingsFilePath = path.join(__dirname, '/locales', 'en.json');

        // Read the default settings
        const defaultSettings = await fs2.readFile(defaultFilePath, 'utf-8');

        // Write the default settings to the settings file
        await fs2.writeFile(settingsFilePath, defaultSettings, 'utf-8');

        res.redirect('/enJson');
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});


app.post("/resetNL", async (req, res) => {
    try {
        // Define the paths to the files
        const defaultFilePath = path.join(__dirname, '/locales', 'DEFnl.json');
        const settingsFilePath = path.join(__dirname, '/locales', 'nl.json');

        // Read the default settings
        const defaultSettings = await fs2.readFile(defaultFilePath, 'utf-8');

        // Write the default settings to the settings file
        await fs2.writeFile(settingsFilePath, defaultSettings, 'utf-8');

        res.redirect('/enJson');
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});



/////////////////////////////////////
/************* DELETE USER ************ */
/////////////////////////////////////

app.post('/delete-user', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }

    const idToDelete = req.body.idToDelete;
    const loggedInUserId = req.user.id;

    if (idToDelete == loggedInUserId) {
        res.status(400).send('Je kunt jezelf niet verwijderen.');
        return;
    }

    try {
        const result = await db.query("DELETE FROM users WHERE id = $1", [idToDelete]);

        if (result.rowCount > 0) {
            const email = req.user.email;
            renderUpdateLidPage(req, res, email);
        } else {
            res.status(500).send(req.__('errors.randomError'));
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'))
    }

  
});






/////////////////////////////////////
/************* DELETE nummer ************ */
/////////////////////////////////////


app.post('/delete-nummer', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }

    const nrdel = req.body.nrdel || ""; // Set default value for nrdel if it is not provided

    try {
        const result = await db.query("DELETE FROM nummers WHERE id = $1", [nrdel]);

        if (result.rowCount > 0) {
           
            
            renderUpdateNummerPage(req, res);
        } else {
            res.status(404).send('Gebruiker niet gevonden.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }

});





/////////////////////////////////////
/*********** REGISTER NEW USER  ************ */
/////////////////////////////////////
const upload4 = multer({ storage: storage });
app.post('/register', upload4.single('afbeelding'), async (req, res) => {

    const email = req.body.email.trim();
    const password = req.body.password.trim();
   
    const voornaam = req.body.voornaam.trim();
    const instrument = req.body.instrument.trim();
    const achternaam = req.body.achternaam.trim();
    const postcode = req.body.postcode.trim();
    const rlvl = req.body.rlvl.trim();
    const passwordRegex = /[\s\S]{6,20}/; // Regex for password length between 6 and 20
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/; // Regex for special characters
    const digitRegex = /\d/; // Regex for digits
    const uppercaseRegex = /[A-Z]/; // Regex for uppercase letters
    const lowercaseRegex = /[a-z]/; // Regex for lowercase letters
    const userExistsResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userExistsResult.rows.length > 0) {
        // user already exists
        res.status(400).send('Een gebruiker met dit e-mailadres bestaat al.');
        return;
    }

    // Check if user is not authenticated
    switch (true) {
        case !req.isAuthenticated():
            res.redirect("/logmenu");
            return;
        case !passwordRegex.test(password):
            res.status(400).send('Het wachtwoord moet tussen de 6 en 20 tekens lang zijn.');
            return;
        case !specialCharRegex.test(password):
            res.status(400).send('Het wachtwoord moet minstens één speciaal teken bevatten.');
            return;
        case !digitRegex.test(password):
            res.status(400).send('Het wachtwoord moet ten minste één cijfer bevatten.');
            return;
        case !uppercaseRegex.test(password):
            res.status(400).send('Het wachtwoord moet ten minste één hoofdletter bevatten.');
            return;
        case !lowercaseRegex.test(password):
            res.status(400).send('Het wachtwoord moet ten minste één kleine letter bevatten.');
            return;
        default:
            break;
    }


    try {
      
        let afbeelding;
        if (req.file) {
            const filePath = path.join(__dirname, './uploads/', req.file.filename);
            const resizedFilePath = path.join(__dirname, './uploads/resized/', req.file.filename); // New file path for resized image

            // Read the image with jimp
            const image = await jimp.read(filePath);

            // Resize the image
            image.resize(500, jimp.AUTO); // Resize the width to 500 and scale the height automatically
                image.cover(500, 500); // Resize and crop the image to fit within a 500x500 square
            // Save the resized image
            await image.writeAsync(resizedFilePath);

            afbeelding = '/uploads/resized/' + req.file.filename; // Use the new file path for the image
            console.log(afbeelding);
        } else {
            
                afbeelding = '/uploads/icon.jpg';
            }

        
        
            bcrypt.hash(password, 15, async (err, hash) => {
                if (err) {
                    console.log(password);
                    console.error("Error hashing password:", err);
                    res.status(500).send('Er is iets misgegaan bij het hashen van het wachtwoord.');
                } else {
                    try {
                        const insertUserQuery = "INSERT INTO users (email, password, voornaam, achternaam, postcode, rlvl, instrument, afbeelding) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";
                        const result = await db.query(insertUserQuery, [email, hash, voornaam, achternaam, postcode, rlvl, instrument, afbeelding]);

                        const user = result.rows[0];
                        req.login(user, (err) => {
                            if (err) {
                                console.error("Error logging in:", err);
                                res.status(500).send('Er is iets misgegaan bij het inloggen.');
                            } else {
                               
                                res.redirect("/mainmenu");
                            }
                        });
                    } catch (err) {
                        console.error(err);
                        res.status(500).send('Er is iets misgegaan bij het opslaan van de gegevens.');
                    }
                }
            });
        
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});




/////////////////////////////////////
/************* UPDATE  USER ************ */
/////////////////////////////////////

const upload5 = multer({ storage: storage });

app.post('/update-profile', upload5.single('afbeelding'), async (req, res) => {
   
    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }

    const email = req.body.email;
    const id = req.body.id;
    const voornaam = req.body.voornaam;
    const instrument = req.body.instrument
    const achternaam = req.body.achternaam;
    const postcode = req.body.postcode;
    const rlvl = req.body.rlvl;
  
    try {

        let afbeelding;
        if (req.file) {
            const filePath = path.join(__dirname, './uploads/', req.file.filename);
            const resizedFilePath = path.join(__dirname, './uploads/resized/', req.file.filename); // New file path for resized image

            // Read the image with jimp
            const image = await jimp.read(filePath);

            // Resize the image
            image.resize(500, jimp.AUTO); // Resize the width to 500 and scale the height automatically

            // Save the resized image
            await image.writeAsync(resizedFilePath);

            afbeelding = '/uploads/resized/' + req.file.filename; // Use the new file path for the image
        } else {
            // If no new image is uploaded, keep the existing image
            const userResult = await db.query("SELECT afbeelding FROM users WHERE id = $1", [id]);
            if (userResult.rows.length > 0) {
                afbeelding = userResult.rows[0].afbeelding;
            } else {
                afbeelding = '/uploads/icon.jpg';
            }
        }



        const result = await db.query(
            "UPDATE users SET email = $1, voornaam = $2, achternaam = $3, postcode = $4, rlvl = $5, instrument = $6, afbeelding = $7 WHERE id = $8 RETURNING *",
            [email, voornaam, achternaam, postcode, rlvl, instrument, afbeelding, id]
        );

        if (result.rowCount > 0) {
            const updatedUser = result.rows[0];
            delete updatedUser.password; // Remove password from the updated user object
            updatedUser.afbeelding = req.user.afbeelding;
            req.login(updatedUser, async (err) => {
                if (err) {
                    console.error("Error logging in:", err);
                    res.status(500).send('An error occurred while logging in.');
                } else {
                    console.log("Profile updated successfully.");
                    const email = req.user.email;
                    await renderUpdateLidPage(req, res, email);
                }
            });
        } else {
            res.status(404).send('User not found.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});



/////////////////////////////////////
/************* UPDATE  nummer ************ */
/////////////////////////////////////

const upload8 = multer({ storage: storage });

app.post('/update-nummer', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect("/logmenu");
        return;
    }
    const nr_id = req.body.id;
    console.log(nr_id);
    const nr_naam = req.body.nr_naam;
  
    const nr_genre = req.body.nr_genre;
    const nr_uitvoerder = req.body.nr_uitvoerder;
    const nr_aantalkerengespeeld = req.body.nr_aantalkerengespeeld;
    const nr_info = req.body.nr_info;

    try {
        const result = await db.query(
            "UPDATE nummers SET nr_naam= $1,  nr_genre = $2, nr_uitvoerder = $3, nr_aantalkerengespeeld = $4, nr_info = $5 WHERE id  = $6 RETURNING *",
            [ nr_naam,nr_genre, nr_uitvoerder, nr_aantalkerengespeeld, nr_info, nr_id]
        );

        if (result.rowCount > 0) {
            console.log("Nummer updated successfully.");
            const nrnaam = req.body.nr_naam;
            await renderUpdateNummerPage(req, res, nrnaam);
        }  else {
            res.status(404).send(req.__('errors.nummerNotFound'));
        }
        
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            // This is a unique constraint violation, which means the nr_naam already exists
            res.status(400).send('A nummer with this name already exists.');
        } else if (err.code === '22P02') {
            // This is an invalid text representation error, which means the nr_duur, nr_genre, nr_uitvoerder, nr_aantalkerengespeeld, or nr_info was not in the correct format
            res.status(400).send('Invalid input format.');
        } else {
            // If it's not one of the above errors, send a generic error message
            res.status(500).send(req.__('errors.randomError'));
        }
    }
});









/////////////////////////////////////
/************* setup website ************ */
/////////////////////////////////////
const upload2 = multer({ dest: dir }); // Use the 'dir' variable you defined earlier
const upload3 = multer({ storage: storage });
app.post("/instellingen", upload3.single('image'), async (req, res) => {
    try {
        const filePath = path.join(__dirname, '/public', 'settings.json');
        const settings = await loadSettings(filePath);

        // Update the settings with the new values from the form
        settings.color = req.body.color;
        settings.background = req.body.background;

        // If a new image was uploaded, update the image setting
        if (req.file) {
            const newImagePath = '/uploads/' + req.file.filename;
            settings.image = newImagePath;
        }
        // Write the updated settings back to the file
        await fs2.writeFile(filePath, JSON.stringify(settings), 'utf-8');

        res.redirect('/instellingen');
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});

/////////////////////////////////////
/************* ADD new song ************ */
/////////////////////////////////////

app.post('/voegpartituurtoe', upload.single('nr_partituur'), async (req, res) => {
    const nr_naam = req.body.nr_naam ? req.body.nr_naam.trim() : '';
    const nr_duur = req.body.nr_duur ? req.body.nr_duur.trim() : '';
    const nr_genre = req.body.nr_genre ? req.body.nr_genre.trim() : '';
    const nr_uitvoerder = req.body.nr_uitvoerder ? req.body.nr_uitvoerder.trim() : '';
    const nr_aantalkerengespeeld = req.body.nr_aantalkerengespeeld ? req.body.nr_aantalkerengespeeld.trim() : '';
    const nr_partituur = req.file ? '/uploads/' + req.file.filename : '/uploads/icon.jpg'; // Set default image if no file is chosen
    const nr_info = req.body.nr_info ? req.body.nr_info.trim() : '';

    try {
        // Validatie van invoervelden
        if (!nr_naam || !nr_duur || !nr_genre || !nr_uitvoerder || !nr_aantalkerengespeeld) {
            throw new Error('Vul alle vereiste velden in.');
        }

        // Bestaand nummer controle
        const existingNummerQuery = "SELECT * FROM nummers WHERE nr_naam = $1";
        const existingNummerResult = await db.query(existingNummerQuery, [nr_naam]);
        if (existingNummerResult.rows.length > 0) {
            throw new Error('Dit nummer bestaat al.');
        }

     

        // Voeg nummer toe aan de database
        const insertPartituurQuery = "INSERT INTO nummers (nr_naam, nr_duur, nr_genre, nr_uitvoerder, nr_aantalkerengespeeld, nr_partituur, nr_info) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
        const result = await db.query(insertPartituurQuery, [nr_naam, nr_duur, nr_genre, nr_uitvoerder, nr_aantalkerengespeeld, nr_partituur, nr_info]);

        const partituur = result.rows[0];
        res.redirect("/nieuwpartituur");
    } catch (err) {
        if (err instanceof TypeError) {
            // Behandel TypeError
            console.error("TypeError:", err);
            res.status(400).send("Er is een typefout opgetreden.");
        } else if (err instanceof ReferenceError) {
            // Behandel ReferenceError
            console.error("ReferenceError:", err);
            res.status(400).send("Er is een referentiefout opgetreden.");
        } else {
            // Behandel andere fouten
            console.error("Fout:", err);
            res.status(500).send(req.__('errors.randomError'));
        }
    }
});




/////////////////////////////////////
/************* DELete a song ************ */
/////////////////////////////////////

app.delete('/delete-song', async (req, res) => {
    const songName = req.query.naam;
    try {
        await db.query('DELETE FROM nummers WHERE nr_naam = $1', [songName]);
        res.status(200).send('Song deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});






/////////////////////////////////////
/************* UPDATE a song ************ */
/////////////////////////////////////


app.put('/update-song', async (req, res) => {
    const songName = req.query.naam;

    const naam = req.body.nr_naam ? req.body.nr_naam.trim() : '';
    const duur = req.body.nr_duur ? req.body.nr_duur.trim() : '';
    const genre = req.body.nr_genre ? req.body.nr_genre.trim() : '';
    const uitvoerder = req.body.nr_uitvoerder ? req.body.nr_uitvoerder.trim() : '';
    const aantalkerengespeeld = req.body.nr_aantalkerengespeeld ? req.body.nr_aantalkerengespeeld.trim() : '';
    const partituur = req.file ? '/uploads/' + req.file.filename : '/uploads/icon.jpg'; // Set default image if no file is chosen
    const info = req.body.nr_info ? req.body.nr_info.trim() : '';

    console.log(songName);
    try {
        // Perform the update operation here
        const result = await db.query("UPDATE nummers SET nr_naam = $1, nr_genre = $2, nr_duur = $3, nr_uitvoerder = $4, nr_aantalkerengespeeld = $5, nr_partituur = $6, nr_info = $7 WHERE nr_naam = $8", [naam, genre, duur, uitvoerder, aantalkerengespeeld, partituur, info, songName]);

        res.status(200).send('Song updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send(req.__('errors.randomError'));
    }
});




/////////////////////////////////////
/************* STILL DOESNT WORK SEND EMAIL ************ */
/////////////////////////////////////

app.post('/send-email', async (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        'http://localhost:3000' // Redirect URL
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken = oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    const recipientEmail = req.body.email; // Get the recipient email address from the request body
    const subject = req.body.subject; // Get the subject from the request body
    const message = req.body.message; // Get the message from the request body

    let mailOptions = {
        from: process.env.EMAIL,
        to: recipientEmail, // Use the recipient email address provided by the user
        subject: subject,
        text: message
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        res.send('Email sent successfully');
    } catch (error) {
        console.error('An error occurred: ', error);
        res.status(500).send('An error occurred while sending the email.');
    }
});


/////////////////////////////////////
/************** pasport */
/////////////////////////////////////

passport.use(
    new Strategy(async function verify(email, password, cb) {
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
                email,
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
    console.log(`Server running on ${port}`);
});

