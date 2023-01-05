const { response } = require('express');
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    Movies = Models.Movie,
    Users = Models.User;

//Connects mongoose to the database
mongoose.connect('mongodb://0.0.0.0:27017/dumbslateDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

//Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

//READ - Get all movies NEW *****
app.get("/movies", (req, res) => {
    Movies.find()
        .then((movies) => {
            return res.status(200).json(movies);
        }).catch((err) => {
            console.log(err);
            res.status(500).send("Error: " + err);
        })
});

//READ - Get single movie by title NEW *****
app.get("/movies/:title", (req, res) => {
    Movies.findOne({ Title: req.params.title })
        .then((movie) => {
            return res.status(200).json(movie);
        }).catch((err) => {
            console.log(error);
            res.status(404).send("Error: " + err)
        })
});

//READ - Get information on Genre NEW *****
app.get("/movies/genre/:genreName", (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genreName })
        .then((genre) => {
            return res.status(200).json(genre.Genre);
        }).catch((err) => {
            console.log(err);
            res.status(404).send("Error: " + err)
        });
});

//READ - Get director by name
app.get("/movies/directors/:directorName", (req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName })
        .then((director) => {
            return res.status(200).json(director.Director)
        }).catch((err) => {
            console.log(err);
            res.status(404).send("Error: " + err)
        });
});


//USER ENDPOINTS

//CREATE New user NEW *****
app.post("/users", (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
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

//UPDATE User name NEW *****
app.put("/users/:Username", (req, res) => {
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

//DELETE User from database with username NEW *****
app.delete("/users/:Username", (req, res) => {
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
app.get("/users/:Username", (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            return res.status(200).json(user);
        }).catch((err) => {
            res.status(404).send("Error: " + err)
        });
});

//READ - Get all users NEW *****
app.get("/users", (req, res) => {
    Users.find()
        .then((users) => {
            return res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// //READ - Get individual user ******************* NEW
// app.get("/users/:Name", (req, res) => {
//     Users.findOne({ Name: req.params.Name })
//         .then((user) => {
//             console.log(user);
//             return res.status(200).json(user);
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(404).send('Error: ' + err);
//         });
// });

//CREATE Item on favourites list NEW *****
app.post("/users/:Username/movies/:MovieID", (req, res) => {
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

//DELETE Remove item from user's favourites list NEW *****
app.delete("/users/:Username/movies/:MovieID", (req, res) => {
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