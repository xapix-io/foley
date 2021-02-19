const mongoose = require("mongoose");
const axios = require("axios");
const express = require("express")
const cors = require('cors')

const router = express.Router();

const app = express();
const port = 3000;
const baseUrl = '/api';

app.use(cors());
app.use(baseUrl, router);

const bodyparser = require('body-parser');
const jsonparser = bodyparser.json();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/playgrounds';


mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

const playgrounds = require("./playground.js");

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

// express

app.listen(port, function() {
  console.log("Server is running on Port: " + port);
});

app.get('/api/plagrounds', (request, response) => {
  playgrounds.find({}, function(error, result) {
    if (error) {
      response.send(error);
    } else {
      response.send(result);
    }
  });
});

app.post('/api/playgrounds', jsonparser, (request, response) => {
  let _id
  playgrounds.find().sort({ _id: -1 }).limit(1).exec((error, result) => {
    const [lastEntry, ] = result || [{}]
    _id = (lastEntry._id || 0) + 1

    const playground = {
      ...request.body,
      _id
    }

    playgrounds.create(playground, (error, result) => {
      if (error) {
        response.send(error);
      } else {
        response.send(result);
      }
    })
  })
});

app.delete('/api/playgrounds/:id', (request, response) => {
  playgrounds.deleteOne({ _id: request.params.id }, function(error, result) {
    if (error) {
      response.send(error);
    } else {
      response.send(result);
    }
  });
});