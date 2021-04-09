const path = require('path')
const express = require('express')
const bodyParser = require("body-parser");
const backend = require('./ContributorBackend')

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

app.get('/contributions?/:edition/:path?/?', function(req, res) {
  /**
   * options
   * @type { import('./ContributorBackend').FilterOptions }
   */
  const options = {
    edition: req.params.edition
  }
  if(req.params.path)
    options.path = req.params.path

  backend.get(options)
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
})

let lastTypes = undefined

app.get('/contributors/types', function(req, res) {
  backend.contributors.types()
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
    backend.contributors.types()
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
  console.log(req.params)
  backend.contributors.get(req.params.name, req.params.type)
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
  backend.contributors.change(req.body)
  .then(() => {
    res.status(200);
  })
  .catch(()=> {
    res.status(400);
  })
  .finally(() => {
    res.end()
  })
})