const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Database connection
let uri = 'mongodb+srv://Victors:' + process.env.PW + '@victorsesan.bdbgdox.mongodb.net/fcc-mongodb-and-mongoose?retryWrites=true&w=majority&appName=Victorsesan';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the Mongoose Schema
const urlSchema = new mongoose.Schema({
  original: { type: String, required: true },
  short: Number
});

// Define the Mongoose Model
const Url = mongoose.model('Url', urlSchema);

// API endpoint for creating short URLs
app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const inputUrl = req.body['url'];
  const urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

  if (!inputUrl.match(urlRegex)) {
    res.json({ error: 'Invalid URL' });
    return;
  }

  const responseObject = { original_url: inputUrl };

  let inputShort = 1;
  Url.findOne({}).sort({ short: 'desc' }).exec((error, result) => {
    if (!error && result) {
      inputShort = result.short + 1;
    }

    Url.findOneAndUpdate(
      { original: inputUrl },
      { original: inputUrl, short: inputShort },
      { new: true, upsert: true },
      (error, savedUrl) => {
        if (!error) {
          responseObject['short_url'] = savedUrl.short;
          res.json(responseObject);
        }
      }
    );
  });
});

// API endpoint for redirection based on short URL
app.get('/api/shorturl/:input', (req, res) => {
  const input = req.params.input;
  Url.findOne({ short: input }, (error, result) => {
    if (!error && result) {
      res.redirect(result.original);
    } else {
      res.json('URL not found');
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});