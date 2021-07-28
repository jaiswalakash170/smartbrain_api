const express = require('express');

const app = express();

app.get('/', (req, res) => {
    console.log("This is working");
})

app.post('/signin', (req, res) => {
    console.log("POST - SignIn");
})

app.post('/register', (req, res) => {
    console.log("POST - Register");
})

app.get('/profile/.userId', (req, res) => {
    console.log("GET - profile", userId);
})

app.put('/image', (req, res) => {
    console.log("PUT - Image");
})

app.listen(3000, () => {
    console.log("App is running on port 3000");
});