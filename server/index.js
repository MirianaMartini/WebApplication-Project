"use strict";

const express = require("express");
const morgan = require("morgan"); // logging middleware
const { check, validationResult } = require("express-validator"); // validation middleware
const dao = require("./dao"); // module for accessing the DB
const passport = require("passport"); // auth middleware
const LocalStrategy = require("passport-local").Strategy; // username and password for login
const session = require("express-session"); // enable sessions
const cors = require("cors");
const userDao = require("./user-dao"); // module for accessing the users in the DB

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(
  new LocalStrategy(function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, {
          message: "Incorrect username and/or password.",
        });

      return done(null, user);
    });
  })
);

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao
    .getUserById(id)
    .then((user) => {
      done(null, user); // this will be available in req.user
    })
    .catch((err) => {
      done(err, null);
    });
});

// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan("dev"));
app.use(express.json());
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

//inserisco isloggedIn nelle funzioni che non possono essere chiamate se non possono essere eseguite se non sei loggato
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.status(401).json({ error: "not authenticated" });
};

// set up the session
app.use(
  session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret:
      "a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie",
    resave: false,
    saveUninitialized: false,
  })
);

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** APIs Courses*******************************************************************************************************************************/
// GET /courses
app.get("/courses", (req, res) => {
  dao.listCourses()
    .then((courses) => {
      res.json(courses);
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ errors: `Database error while retrieving courses` })
        .end();
    });
});

// GET /courses/incompatibile/:codice
app.get("/courses/incompatibile/:codice", async (req, res) => {
  try {
    const result = await dao.getCorsiIncompatibili(req.params.codice);
    if (result) res.status(200).json(result);
    else res.status(404).json(result); //se restituisce questo errore è perchè il corso con il codice passato non ha corsi incompatibili
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({
        error: `Database error while retrieving incompatible courses of ${req.params.codice}.`,
      })
      .end();
  }
});

// GET /courses/propedeutico/:codice
app.get("/courses/propedeutico/:codice", async (req, res) => {
  try {
    const result = await dao.getNomePropedeutico(req.params.codice);
    console.log(result)
    if (result) res.status(200).json(result);
    else res.status(404).json(result); //se restituisce questo errore è perchè il corso con il codice passato non ha corsi incompatibili
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({
        error: `Database error while retrieving incompatible courses of ${req.params.codice}.`,
      })
      .end();
  }
});

/* PianoStudio APIs ******************************************************************************************************************************/
// GET /PianoStudio
app.get("/PianoStudio", isLoggedIn, async (req, res) => {
  try {
    const courses = await dao.getStudyPlan(req.user.id);
    res.json(courses);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: `Database error while retrieving exams` })
      .end();
  }
});

//PUT /PianoStudio
app.put("/PianoStudio", [
    check("tip_str").isLength({ min: 1 }), //checkare non la lunghezza ma che sia uguale a 'full-time' o 'part-time' vedere se c'è un modo
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const tipologia = req.body.tip_str;
    // you can also check here if the code passed in the URL matches with the code in req.body
    try {
      await dao.updateUser(tipologia, req.user.id);
      console.log(res)
      res.status(200).end();
    } catch (err) {
      console.log(err);
      res
        .status(503)
        .json({
          error: `Database error during the update of user ${req.user}.`,
        });
    }
  }
);

//PUT /SavePianoStudio
app.put("/SavePianoStudio", async (req, res) => {
    //controlli di validità dei vincoli sono sul dao.js
    dao.checkValidation(req.body.pianoStudi, req.user.id)
      .then(() => {
        dao.SavePianoStudio(req.body.pianoStudi, req.body.corsiToUpdate, req.user.id);
        res.status(200).end();
      })
      .catch((err) => { console.log(err);  res.status(503).json({error: `Errore durante il salvataggio del Piano Studi, violazione vincoli. ${err}` }) })
});

// DELETE /DeletePianoStudio
app.put("/DeletePianoStudio", isLoggedIn, async (req, res) => {
  try {
    await dao.deleteStudyPlan(req.body.pianoStudio, req.user.id);
    res.status(204).end();
  } catch (err) {
    console.log(err);
    res
      .status(503)
      .json({ error: `Database error during the deletion of Study Plan.` });
  }
});

/*** Users APIs *******************************************************************************************************************************/
app.get("/user", isLoggedIn, async (req, res) => {
  try {
    const result = await userDao.getUserById(req.user.id);
    if (result) res.status(200).json(result);
    else res.status(404).json(result);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({
        error: `Database error while retrieving user with id ${req.user.id}.`,
      })
      .end();
  }
});

// login
// POST /sessions
app.post("/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err) return next(err);
      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// logout
// DELETE /sessions/current
app.delete("/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// check whether the user is logged in or not
// GET /sessions/current
app.get("/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ error: "Unauthenticated user!" });
});

/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
  console.log(`react-score-server listening at http://localhost:${port}`);
});
