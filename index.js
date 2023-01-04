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
//mongoose.connect('mongodb://0.0.0.0:27017/dumbslateDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
 
// DATA
let users = [
    {
        "id": 1,
        "name": "Mary",
        "favouriteMovies": []
    },
    {
        "id": 2,
        "name": "Jane",
        "favouriteMovies": ["The Fly"]
    },
    {
        "id": 3,
        "name": "Daphne",
        "favouriteMovies": []
    }
]

let movies = [
    {
        "title": "The Fly",
        "year": "1986",
        "director": {
            "name": "David Cronenberg",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        },
        "genre": {
            "name": "Horror",
            "description": "The key focus horror is to elicit a sense of dread in the reader through frightening images, themes, and situations."
        }
    },
    {
        "title": "The Dead Zone",
        "year": "1983",
        "director": {
            "name": "David Cronenberg",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        },
        "genre": {
            "name": "Horror",
            "description": "The key focus horror is to elicit a sense of dread in the reader through frightening images, themes, and situations."
        }
    },
    {
        "title": "Poltergeist",
        "year": "1982",
        "director": {
            "name": "Tobe Hooper",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        }
    },
    {
        "title": "They Live",
        "year": "1988",
        "director": {
            "name": "John Carpenter",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        }
    },
    {
        "title": "Near Dark",
        "year": "1987",
        "director": {
            "name": "Kathryn Bigelow",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        }
    },
    {
        "title": "Fright Night",
        "year": "1985",
        "director": {
            "name": "Tom Holland",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        }
    },
    {
        "title": "Night of The Creeps",
        "year": "1986",
        "director": {
            "name": "Fred Dekker",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        }
    },
    {
        "title": "Phenomena",
        "year": "1985",
        "director": {
            "name": "Dario Argento",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        }
    },
    {
        "title": "Chopping Mall",
        "year": "1986",
        "director": {
            "name": "Jim Wynorski",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        }
    },
    {
        "title": "Hellraiser",
        "year": "1987",
        "director": {
            "name": "Clive Barker",
            "dateOfBirth": "October 12 1962",
            "biography": "Made some films"
        }
    }
]

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

//CREATE New user
app.post("/users", (req, res) => {
    let newUser = req.body;
    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send("Please provide a user name");
    }
});


//UPDATE User name
app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    let user = users.find(user => user.id == id);
    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
        //res.status(200).send("User " + `${id}` + " name updated to " + `${user.name}`); - how to do as wel?
    } else {
        res.status(400).send("This user does not exist.");
    }
});

//DELETE User from database
app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).json("User with ID: " + `${id}` + " has been deleted");
    } else {
        res.status(400).send("User with this ID does not exist");
    }
});

//CREATE Item on favourites list
app.post("/users/:id/favourites/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        user.favouriteMovies.push(movieTitle);
        //res.status(201).send(user);
        res.status(201).send(`${movieTitle} has been added to favourites for user with ID: ${id}`);
    } else {
        res.status(400).send("Please provide a user name");
    }
});

//DELETE Item from favourites list
app.delete("/users/:id/favourites/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        user.favouriteMovies = user.favouriteMovies.filter(title => title !== movieTitle);
        res.status(201).send(`${movieTitle}` + " has been removed from user's (ID: " + `${id}` + ") favourites");
    } else {
        res.status(400).send("Please provide a user name");
    }
});

//READ - Get all movies NEW *****
app.get("/movies", (req, res) => {
    res.status(200).json(movies);
});

//READ - Get single movie by title NEW *****
app.get("/movies/:title", (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.title === title);
    if (movie) {
        res.status(200).json(movie)
    } else {
        res.status(400).send("No movie by that title.");
    }
});

//READ - Get information on Genre NEW *****
app.get("/movies/genre/:genreName", (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.genre.name === genreName).genre;
    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send("No genres by that name.");
    }
});

//READ - Get director by name
app.get("/movies/directors/:directorName", (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.director.name === directorName).director;
    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send("No directors with that name.");
    }
});


//** SERVER Defines web server port */
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});