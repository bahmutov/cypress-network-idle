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

const htmlButton = (req, res) => {
  const filename = path.join(__dirname, 'button.html')
  const text = fs.readFileSync(filename, 'utf8')
  micro.send(res, 200, text)
}

const htmlAfter = (req, res) => {
  const filename = path.join(__dirname, 'after.html')
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

const afterMs = (req, res, { params }) => {
  console.log('responding after %d ms', params.ms)
  if (!params.ms) {
    throw new Error('missing ms')
  }
  setTimeout(() => {
    micro.send(res, 200, 'OK')
  }, params.ms)
}

module.exports = dispatch()
  .dispatch('/', 'GET', html)
  .dispatch('/delayed', 'GET', htmlDelayed)
  .dispatch('/button', 'GET', htmlButton)
  .dispatch('/user', 'GET', user)
  .dispatch('/user/delayed', 'GET', userDelayed)
  .dispatch('/after', 'GET', htmlAfter)
  .dispatch('/after/:ms', 'GET', afterMs)
  .otherwise(html)
