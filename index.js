const { response } = require('express');
const { check, validationResult } = requrie('express-validator'); //Serverside validation
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    Movies = Models.Movie,
    Users = Models.User,
    passport = require('passport');

require('./passport');

//Connects mongoose to the database
mongoose.connect('mongodb://0.0.0.0:27017/dumbslateDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

//Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//CORS Cross Origin Resource Sharing
let cors = require('cors');
app.use(cors());
//Authenticaton
let auth = require('./auth')(app);
//Defines public folder for static files
app.use(express.static('public'));
//Logs all requests and errors to the console
app.use(morgan('common'));


//READ Static files
app.get('/top-ten-movies.json', (req, res) => { });
app.get('/documentation.html', (req, res) => { });

//READ - Default request
app.get('/', (req, res) => {
    res.send('Welcome to Film Ghost');
});


//MOVIE ENDPOINTS

//READ - Get all movies
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            return res.status(200).json(movies);
        }).catch((err) => {
            console.log(err);
            res.status(500).send("Error: " + err);
        })
});

//READ - Get single movie by title
app.get("/movies/:title", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.title })
        .then((movie) => {
            return res.status(200).json(movie);
        }).catch((err) => {
            console.log(error);
            res.status(404).send("Error: " + err)
        })
});

//READ - Get information on Genre
app.get("/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genreName })
        .then((genre) => {
            return res.status(200).json(genre.Genre);
        }).catch((err) => {
            console.log(err);
            res.status(404).send("Error: " + err)
        });
});

//READ - Get director by name
app.get("/movies/directors/:directorName", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName })
        .then((director) => {
            return res.status(200).json(director.Director)
        }).catch((err) => {
            console.log(err);
            res.status(404).send("Error: " + err)
        });
});


//USER ENDPOINTS

//CREATE New user registration
app.post("/users", 
    [   check('Username', 'Please enter a username that is at least 5 characters long.').isLength({ min: 5 }), 
        check('Username', 'Username contaons non-alphanumeric character - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required.').not().isEmpty(),
        check('Email', 'Email is not valid.').isEmail()
    ], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    };
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthdate: req.body.Birthdate
                    }).then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

//UPDATE User name
app.put("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthdate: req.body.Birthdate
        }
    },
        { new: true })
        .then((updatedUser) => {
            return res.status(200).json(updatedUser);
        }).catch((err) => {
            console.log(err);
            res.status(501).send("Error: " + err);
        });
});

//DELETE User from database with username
app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(404).send(req.params.Username + " could not be found.")
            } else {
                res.status(200).send(req.params.Username + " has been deleted.")
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

//GET Single user by username
app.get("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            return res.status(200).json(user);
        }).catch((err) => {
            res.status(404).send("Error: " + err)
        });
});

//READ - Get all users
app.get("/users", passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            return res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//CREATE Item on favourites list
app.post("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        { $push: { FavoriteMovies: req.params.MovieID } },
        { new: true })
        .then((updatedUser) => {
            //return res.status(200).json(updatedUser);
            return res.status(200).send("Movie added to your favourites!");
        }).catch((err) => {
            console.log(err);
            res.status(404).send("Error: " + err)
        });
});

//DELETE Remove item from user's favourites list
app.delete("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    }, { new: true })
        .then((updatedUser) => {
            return res.status(200).json(updatedUser);
        }).catch((err) => {
            console.log(err);
            res.status(404).send("Error: " + err)
        });
});





//** SERVER Defines web server port */
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});