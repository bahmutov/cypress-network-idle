const micro = require('micro')
const fs = require('fs')
const path = require('path')

// using https://github.com/dotcypress/micro-route
// to route different requests to their own handlers
const dispatch = require('micro-route/dispatch')

const sendHtml = (page) => (req, res) => {
  const filename = path.join(__dirname, page)
  const text = fs.readFileSync(filename, 'utf8')
  micro.send(res, 200, text)
}

const user = (req, res) => {
  micro.send(res, 200, {
    name: 'John Doe',
  })
}

const addUser = (req, res) => {
  micro.send(res, 200)
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

const html = sendHtml('index.html')
module.exports = dispatch()
  .dispatch('/', 'GET', html)
  .dispatch('/delayed', 'GET', sendHtml('delayed.html'))
  .dispatch('/button', 'GET', sendHtml('button.html'))
  .dispatch('/user', 'GET', user)
  .dispatch('/user/delayed', 'GET', userDelayed)
  .dispatch('/after', 'GET', sendHtml('after.html'))
  .dispatch('/after/:ms', 'GET', afterMs)
  .dispatch('/three', 'GET', sendHtml('three.html'))
  .dispatch('/busy-page', 'GET', sendHtml('busy-page.html'))
  .dispatch('/get-vs-post', 'GET', sendHtml('get-vs-post.html'))
  .dispatch('/add-user', 'POST', addUser)
  .otherwise(html)
