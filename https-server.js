const fs    = require('fs')
const https = require('https')

const port = 1234
const host = 'localhost'

const options = {
  ca:   fs.readFileSync('ssl/ca.crt'),
  cert: fs.readFileSync('ssl/http.crt'),
  key:  fs.readFileSync('ssl/http.openkey')
}

const server = new https.createServer(options)

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
