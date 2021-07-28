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

app.get('/', (req, res) => {
    res.json("Congratulations!!! You've reached smart-brain");
})

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login').where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if(isValid){
            db.select('*').from('users').where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0]);
            })
            .catch(error => {
                res.status(400).json("Unable to get user");
            })
        } else{
            res.status(400).json("Wrong credentials");
        }
    })
    .catch(error => {
        res.status(400).json("Wrong credentials");
    });
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