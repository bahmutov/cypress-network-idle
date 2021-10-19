const micro = require('micro')
const fs = require('fs')
const path = require('path')

// using https://github.com/dotcypress/micro-route
// to route different requests to their own handlers
const dispatch = require('micro-route/dispatch')

const html = (req, res) => {
  const filename = path.join(__dirname, 'index.html')
  const text = fs.readFileSync(filename, 'utf8')
  micro.send(res, 200, text)
}

const htmlDelayed = (req, res) => {
  const filename = path.join(__dirname, 'delayed.html')
  const text = fs.readFileSync(filename, 'utf8')
  micro.send(res, 200, text)
}

const user = (req, res) => {
  micro.send(res, 200, {
    name: 'John Doe',
  })
}

const userDelayed = (req, res) => {
  setTimeout(() => {
    micro.send(res, 200, {
      name: 'John Doe',
    })
  }, 1000)
}

module.exports = dispatch()
  .dispatch('/', 'GET', html)
  .dispatch('/delayed', 'GET', htmlDelayed)
  .dispatch('/user', 'GET', user)
  .dispatch('/user/delayed', 'GET', userDelayed)
  .otherwise(html)
