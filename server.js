const mongoose = require('mongoose')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const port = 80

app.use(express.static(__dirname))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* DB STUFF */
mongoose.connect('mongodb://localhost/timeclock')// connect to db
const db = mongoose.connection// set variable
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {})
// schemas

const userSchema = mongoose.Schema({
  fullName: String,
  user: String,
  pass: String,
  signup: Date
})
const User = mongoose.model('User', userSchema)
const clockSchema = mongoose.Schema({
  user: String,
  userid: String,
  start: Date,
  end: Date,
  proj: String,
  active: Boolean
})
const Clock = mongoose.model('Clock', clockSchema)

app.get('/', (req, res) => {
  res.redirect('/')
})

app.post('/register', (req, res) => {
  let newName = req.body.rname
  let newUser = req.body.ruser
  let newPass = req.body.rpass
  let hash = bastion(newPass)
  let register = new User({
    fullName: newName,
    user: newUser,
    pass: hash,
    signup: new Date()
  })
  register.save((err, registeredUser) => {
    if (err) console.error(err)
    console.log(`new user: ${registeredUser}`)
  })
  res.redirect('/')
})

app.post('/users', (req, res) => {
  User.find((err, list) => {
    if (err) console.error(err)
    res.json(list)
  })
})

app.post('/login', (req, res) => {
  let user = req.body.lname
  let pass = req.body.lpass
  if (pass === 'bastion' && user === 'Ado') {
    res.redirect('/admin.html')
  } else {
    let hash = bastion(pass)
    let query = User.findOne({'user': user})
    query.select('user pass')
    query.exec((err, foundUser) => {
      if (err) console.error(err)
      if (foundUser.pass === hash) {
        let cookieVal = `${foundUser.user}:${foundUser._id}`
        res.cookie('user', cookieVal)
        res.redirect('/')
      } else {
        res.redirect('/')
      }
    })
  }
})

app.route('/clock')
.post((req, res) => {
  let userid = req.body.clUserId
  Clock.findOne({ 'userid': userid, 'active': true }, (err, item) => {
    if (err) console.error(err)
    if (item !== null) {
      item.end = new Date()
      item.active = false
      item.save((err, updatedItem) => {
        if (err) console.error(err)
      })
    } else {
      let user = req.body.clUser
      let proj = req.body.clProj
      let newClock = new Clock({
        user: user,
        userid: userid,
        start: new Date(),
        proj: proj,
        active: true
      })
      newClock.save((err, clockObj) => { if (err) console.error(err) })
    }
  })
  res.redirect('/')
})
.get((req, res) => {
  if (req.cookies['user']) {
    let cookieSplit = req.cookies['user'].split(':')
    let userid = cookieSplit[1]
    Clock.find({ 'userid': userid }, (err, list) => {
      if (err) console.error(err)
      res.json(list)
    })
  }
})
app.get('/clock/all', (req, res) => {
  Clock.find((err, list) => {
    if (err) console.error(err)
    res.json(list)
  })
})

app.post('/delClock', (req, res) => {
  let del = req.body.del ? req.body.del : false
  if (del && Array.isArray(del)) {
    del.forEach(item => { Clock.remove({_id: item}, (err, removed) => { if (err) console.error(err) }) })
  } else if (del) { Clock.remove({_id: del}, (err, removed) => { if (err) console.error(err) }) }
  if (req.body.adm) {
    res.redirect('/admin.html')
  } else { res.redirect('/') }
})

app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})

function bastion (pass) {
  let pwarray = pass.split('')
  let pwlen = pwarray.length
  let modifier = pwlen < 5 ? 5 : pwlen
  let iteration1 = pwarray.map(item => {
    let charCode = item.charCodeAt(0)
    let newCode = String.fromCharCode(charCode + modifier)
    return newCode
  })
  let iteration2 = iteration1.reverse()
  let iteration3 = iteration2.join('')
  return iteration3
}
