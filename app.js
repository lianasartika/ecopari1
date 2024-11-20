const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const app = express();


const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'ecopari_db',
    debug: false
});

const session = require("express-session");
const redis = require("redis");
const RedisStore = require("connect-redis").default;
const redisClient = redis.createClient({
    url: "redis://redis:6379",
});

redisClient.connect().catch(console.error);



let redisStore = new RedisStore({
    client: redisClient,
});

app.use(
   session({
     store: redisStore,
     secret: "SESSION_SECRET",
     resave: false,
     saveUninitialized: false,
     cookie: {
       secure: false,
    },
  })
);

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

//-momery unleaked---------
app.set('trust proxy', 1);

app.use(session({
cookie:{
    secure: true,
    maxAge:60000
       },
store: new RedisStore(),
secret: 'secret',
saveUninitialized: true,
resave: false
}));

app.use(function(req,res,next){
if(!req.session){
    return next(new Error('Oh no')) //handle error
}
next() //otherwise continue
});

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (error, results) => {
            if (results.length > 0) {
                req.session.userId = results[0].id;
                res.redirect('/dashboard');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, result) => {
        if (err) throw err;
        res.redirect('/login');
    });
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('dashboard');
});

app.get('/coral', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('coral');
});

app.get('/mangrove', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('mangrove');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running on port ${port} `);
});
