const web = require('web')

// Intialize, setup routes and run web server

web.config()
web.registerStatic('/static')
web.registerPost('/item', addItem)
web.registerGet('/item', getItems)
web.registerGet('/item/{id}', getItem)
web.registerPut('/item/{id}', updateItem)
web.registerDelete('/item/{id}', deleteItem)
web.run()

// Specify route handlers

function addItem(req) {
  req.response.type('text/plain')
  req.response.write('Hello, World!')
}

function getItems(req) {
  const cookie = req.cookie()
  req.response.type('text/json')
  req.response.cookie({ sessionId: cookie.sessionId + 1 })
  req.response.write(JSON.stringify({ Hello: 'World!' })
}

function getItem(req) {
  const id = req.param('id')
  if (!id) {
    req.response.err(404)
  }
}

function updateItem(req) {
  const item = req.bodyJson()
}
