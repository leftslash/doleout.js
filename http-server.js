const http = require('http')

const port = 1234
const host = 'localhost'

const server = new http.Server()

server.on('request', (request, response) => {
  // request.headers
  // request.method
  // request.url
  // response.setHeader(name, value)
  // response.statusCode 404
  // response.statusMessage 'Not Found'
  response.write('Hello, World!\n')
  response.end()
})

server.listen(port, host)
