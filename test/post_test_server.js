var express = require('express')
var bodyParser = require('body-parser')
var app = express()

// parse application/json
app.use(bodyParser.json())

app.post('/', function (req, res) {
  if (req.body.ok === true) {
    res.sendStatus(200)
  } else {
    res.sendStatus(400)
  }
})

app.listen(8001)
