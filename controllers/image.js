const Clarifai = require('clarifai');
const clarifai_api_key = require('./../api_key');

const app = new Clarifai.App(clarifai_api_key.clarifai_api_key);

const handleAPICall = (req, res) => {
    app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => res.json(data))
    .catch(error => {
        res.status(400).json("Unable to work with API");
    });
}

const handleImage = (req, res, db) => {
    const {id} = req.body;
    db('users').where('id', '=', id).increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries);
    })
    .catch(error => res.status(400).json("Unable to get entries"));
}

module.exports = {
    handleImage : handleImage,
    handleAPICall: handleAPICall
}