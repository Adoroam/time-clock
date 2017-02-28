const mongoose = require('mongoose')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 80

app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* DB STUFF */
mongoose.connect('mongodb://localhost/timeclock')// connect to db
const db = mongoose.connection// set variable
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {})
const itemSchema = mongoose.Schema({
  user: String,
  desc: String,
  completed: Boolean,
  time: { start: Date.now, end: false, total: false }
})
const Item = mongoose.model('Item', itemSchema)

app.get('/', (req, res) => {
  res.redirect('/')
})

app.post('/clock', (req, res) => {
  let newItem = new Item
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})
