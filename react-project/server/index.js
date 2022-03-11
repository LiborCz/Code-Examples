const bodyParser = require('body-parser')
const helmet = require('helmet') // creates headers that protect from attacks
const cors = require('cors')  // allows/disallows cross-site communication
require('dotenv').config()


const express = require('express');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// ** MIDDLEWARE ** //
const whitelist = ['http://localhost:3000/', 'http://localhost:8000/', 'https://note-keeper-cz.herokuapp.com']
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(helmet())
app.use(cors(corsOptions))

// ** APP ** //

app.use("/api/users", require("./routes/users"));
app.use("/api/items", require("./routes/items"));

if (process.env.NODE_ENV === 'production') {

  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 8000
app.listen(PORT, (req, res) => { console.log(`server listening on port: ${PORT}`) });
