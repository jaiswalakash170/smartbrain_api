const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const db_password = require('./db_password.js');

knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : db_password.password,
      database : 'smart-brain'
    }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            password: 'cookies',
            email: 'john@gmail.com',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            password: 'bananas',
            email: 'sally@gmail.com',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '123',
            hash: '',
            email: 'john@gmail.com'
        }
    ]
}

app.get('/', (req, res) => {
    res.json(database.users);
})

app.post('/signin', (req, res) => {
    // Load hash from your password DB.
    /*bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
    });
    bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
    });*/
    let found = false;
    database.users.forEach(user => {
        if(req.body.email === user.email &&
            req.body.password === user.password ){
            found = true;
            return res.json(user);
        }
    })
    if(!found) {
        res.status(400).json("error logging in");
    }
})

app.post('/register', (req, res) => {
    const {name, email, password} = req.body;
    bcrypt.hash(password, null, null, function(err, hash) {
        console.log(hash);
    });
    database.users.push({
        id: '125',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    });
    res.json(database.users[database.users.length - 1]);
})

app.get('/profile/:userId', (req, res) => {
    const id = req.params.userId;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            found = true;
            return res.json(user);
        }
    });
    if(!found){
        res.status(404).json("No such user");
    }
})

app.put('/image', (req, res) => {
    const {id} = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            user.entries++;
            found = true;
            return res.json(user.entries);
        }
    })
    if(!found){
        res.status(404).json("No such user");
    }
})

app.listen(3001, () => {
    console.log("App is running on port 3001");
});