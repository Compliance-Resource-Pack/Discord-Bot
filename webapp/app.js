const path = require('path')
const express = require('express')
const bodyParser = require("body-parser");
const contributor = require('./ContributorBackend')
const contributions = require('./backend/contribution')
const TwinBcrypt = require('twin-bcrypt')
require('dotenv').config()

const port = 3000;


const app = express()

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json());

const webapp_url = '/webapp';

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
  console.log(`Web app at http://localhost:${port}${webapp_url}`)
})

app.get('/', (req, res) => {
	res.redirect(302, 'https://compliancepack.net/')
})

app.get(webapp_url, function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'))
})

app.use(express.static('webapp'))

app.post('/contributor', function(req, res) {
  console.log(req.body)
  res.status(200)
  res.end()
})

app.get('/contributions/:edition?/:search?/', function(req, res) {
  contributions.get(req.params.edition, req.params.search)
  .then(val => {
    console.log(val)
    res.setHeader('Content-Type', 'application/json')
    res.send(val)
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.send(err)
  })
  .finally(() => {
    res.end()
  })
})

let lastTypes = undefined

app.get('/contributors/types', function(req, res) {
  contributor.contributors.types()
  .then(val => {
    res.setHeader('Content-Type', 'application/json')
    lastTypes = val
    res.send(val)
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.send(err)
  })
  .finally(() => {
    res.end()
  })
})

/**
 * Get the contributors depending some criterias
 * @param {Request} req the incoming request
 * @param {*} res the result to send
 */
function GetContributors(req, res) {
  if(!lastTypes) {
    contributor.contributors.types()
    .then(val => {
      lastTypes = val
      GetContributors(req, res)
    })
    return
  }

  if(!req.params.name && lastTypes && !lastTypes.includes(req.params.type)) {
    const tmp = req.params.type
    req.params.type = req.params.name
    req.params.name = tmp
  }
  contributor.contributors.get(req.params.name, req.params.type)
  .then(val => {
    res.setHeader('Content-Type', 'application/json')
    res.send(val)
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.send(err)
  })
  .finally(() => {
    res.end()
  })
}

app.get('/contributors/:type?/:name?/?', GetContributors)

app.post('/contributors/change', function(req, res) {
  if(!req.body.password || !process.env.WEBAPP_PASSWORD || !TwinBcrypt.compareSync(process.env.WEBAPP_PASSWORD, req.body.password)) {
    res.status(400)
    res.end()
    return
  }

  const push = !!req.body.pushToGithub
  
  contributor.contributors.change(req.body)
  .then(() => {
    if(push) {
      console.error('puuush it')
      res.status(500).send({error: 'Saved but you need to push it'})
      res.end()
    } else {
      res.status(200)
      res.end()
    }
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.end()
  })
})

app.post('/contributors/remove', function(req, res) {
  if(!req.body.password || !process.env.WEBAPP_PASSWORD || !TwinBcrypt.compareSync(process.env.WEBAPP_PASSWORD, req.body.password)) {
    res.status(400)
    res.end()
    return
  }

  const push = !!req.body.pushToGithub

  contributor.contributors.remove(req.body.username)
  .then(() => {
    if(push) {
      console.error('puuush it')
      res.status(500).send({error: 'Saved but you need to push it'})
      res.end()
    } else {
      res.status(200)
      res.end()
    }
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.end()
  })
})