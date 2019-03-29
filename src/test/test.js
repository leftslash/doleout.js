const path = require('path')
const server = require('../web')

function listHandler(req, res) {
  res.render('html/template.html', {
    title: req.query('title'),
    list: {
      a:     req.query('a'),
      b:     req.query('b'),
      c:     req.query('c')
    }
  })
}

const config = {
  https: { disabled: true },
  http2: { disabled: true }
}

server.configure(config)
server.registerStatic('/public', 'test/static')
server.registerGet('/list', listHandler)
server.run()
