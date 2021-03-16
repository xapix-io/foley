const mongoose = require("mongoose");
const express = require("express")
const cors = require('cors')

const router = express.Router();

const app = express();
const port = 3000;
const baseUrl = process.env.BASE_URL || '/api';

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

app.get('/api/playgrounds', (request, response) => {
  playgrounds.find({}, function(error, result) {
    if (error) {
      response.send(error);
    } else {
      response.send(result);
    }
  })
})

app.get('/api/playgrounds/:id', (request, response) => {
  playgrounds.findById(request.params.id, function(error, result) {
    if (error) {
      response.send(error);
    } else {
      response.send(result);
    }
  })
})

app.post('/api/playgrounds', jsonparser, (request, response) => {
  playgrounds.create(request.body, (error, result) => {
    if (error) {
      response.send(error);
    } else {
      response.send(result);
    }
  })
})

app.put('/api/playgrounds/:id', jsonparser, (request, response) => {
  playgrounds.findOneAndUpdate({ _id: request.params.id }, request.body, { new: true }, (error, result) => {
    if (error) {
      response.send(error);
    } else {
      response.send(result);
    }
  })
})

app.delete('/api/playgrounds/:id', (request, response) => {
  playgrounds.deleteOne({ _id: request.params.id }, function(error, result) {
    if (error) {
      response.send(error);
    } else {
      response.send(result);
    }
  })
})
