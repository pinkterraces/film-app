const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

//logs
//creates a write stream in append mode
//creates log.txt file in root directory
//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });
//sets up the logger
//app.use(morgan('combined', { stream: accessLogStream }))

//logs all requests and errors to the console
app.use(morgan('common'));

//defines public folder for static files
app.use(express.static('public'));

//defines request handling

app.get('/', (req, res) => {
    res.send('Welcome to Film Ghost');
});

app.get('/top-ten-movies.json', (req, res) => {});
app.get('/documentation.html', (req, res) => {});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

//defines web server port
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});