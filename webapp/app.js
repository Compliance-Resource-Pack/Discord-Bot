const path = require('path')
const express = require('express')
const bodyParser = require("body-parser")

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

app.post('/contributor', function(req, res) {
  console.log(req.body)
  res.status(200)
  res.end()
})