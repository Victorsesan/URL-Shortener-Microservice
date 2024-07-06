const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Connected to the database!");
});

// Schema and Model
const urlSchema = new mongoose.Schema({
  original: String,
  short: Number
});

const Url = mongoose.model("Url", urlSchema);

app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const inputUrl = req.body['url'];
  const urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

  if (!inputUrl.match(urlRegex)) {
    res.json({ error: 'Invalid URL' });
    return;
  }

  const responseObject = { original_url: inputUrl };

  let inputShort = 1;

  Url.findOne({})
     .sort({ short: "desc" })
     .exec((error, result) => {
        if (!error && result != undefined) {
          inputShort = result.short + 1;
        }

        if (!error) {
          Url.findOneAndUpdate(
            { original: inputUrl },
            { original: inputUrl, short: inputShort },
            { new: true, upsert: true },
            (error, savedUrl) => {
              if (!error) {
                responseObject["short_url"] = savedUrl.short;
                res.json(responseObject);
              }
            }
          );
        }
     });
});

app.get('/api/shorturl/:input', (req, res) => {
  const input = req.params.input;
  Url.findOne({ short: input }, (error, result) => {
    if (!error && result != undefined) {
      res.redirect(result.original);
    } else {
      res.json('URL not found');
    }
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});