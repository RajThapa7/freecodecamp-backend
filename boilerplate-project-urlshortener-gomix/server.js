require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(cors());

const schema = new mongoose.Schema({ original_url: String, short_url: Number });
let url = mongoose.model("url", schema);

app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
let pattern =
  /(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=&]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=()]*)/;
let responseObject = {};
app.post("/api/shorturl",  (req, res) => {
  const inputUrl = req.body.url;
  if (pattern.test(inputUrl)) {
    responseObject["original_url"] = inputUrl;
    //assigning short url value
    let inputShort = 1;
    url
      .findOne({})
      .sort({ short_url: "desc" })
      .exec((error, result) => {
        if (!error && result != undefined) {
          inputShort = result.short_url + 1;
        }
        if (!error) {
          url.findOneAndUpdate(
            { original_url: inputUrl },

            { original_url: inputUrl, short_url: inputShort },
            { new: true, upsert: true },
            (error, savedUrl) => {
              if (!error) {
                responseObject["short_url"] = savedUrl.short_url;
                res.json(responseObject);
              }
            }
          );
        }
      });
   
  } else {
    res.status(400).json({
      error: "Invalid URL",
    });
  }
});

app.get('/api/shorturl/:input', (request, response) => {
  let input = request.params.input
  
  url.findOne({short_url: input}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original_url)
    }else{
      response.json('URL not Found')
    }
  })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
