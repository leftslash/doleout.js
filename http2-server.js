const fs    = require('fs')
const url   = require('url')
const http2 = require('http2')

const port = 1234
const host = 'localhost'

const options = {
  ca:   fs.readFileSync('ssl/ca.crt'),
  cert: fs.readFileSync('ssl/http.crt'),
  key:  fs.readFileSync('ssl/http.openkey')
}

const server = new http2.createSecureServer(options)

server.on('stream', (stream, headers) => {
  // request.headers
  // request.method
  // request.url
  // response.setHeader(name, value)
  // response.statusCode 404
  // response.statusMessage 'Not Found'
  stream.respond({'content-type':'text/plain', 'status':200})
  stream.end('Hello, World!\n')
})

server.listen(port, host)
