const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const db_password = require('./db_password.js');
const { response } = require('express');

const db = knex({
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
    const hash = bcrypt.hashSync( password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    name: name,
                    email: loginEmail[0],
                    joined: new Date()
                })
                .then(user => {
                     res.json(user[0]);
                })
        })
        .then(trx.commit)
        .catch(err => res.status(400).json("trx roolback"));
    })
})

app.get('/profile/:userId', (req, res) => {
    const id = req.params.userId;
    db.select('*').from('users').where({id})
    .then(user => {
        console.log(user);
        if(user.length){
            res.json(user[0]);
        }else {
            res.status(400).json('Not found')
        }
    })
    .catch(error => res.status(400).json("Error getting user"));
})

app.put('/image', (req, res) => {
    const {id} = req.body;
    db('users').where('id', '=', id).increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries);
    })
    .catch(error => res.status(400).json("Unable to get entries"));
})

app.listen(3001, () => {
    console.log("App is running on port 3001");
});