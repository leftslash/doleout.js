const path = require('path')

const request = require('./request')

const parmRegExp = /^{.*}$/

function makeRegExp(path) {
  var str = '^'
  for (dir of path.split('/').slice(1)) {
    if (parmRegExp.test(dir)) {
      str += '/[^/]+'
    } else {
      str += '/' + dir
    }
  }
  return new RegExp(str + '\/?$')
}

function Router() {
  this.table = []
}

// Route object contains:
//   at register time:
//     method
//     path
//     handler
//     directory
//     regexp

Router.prototype.add = function(method, path, handler) {
  const route = { method, path, handler }
  route.regexp = makeRegExp(route.path)
  this.table.push(route)
}

Router.prototype.addStatic = function(path, directory) {
  const route = { method: 'get', path, handler: null, path.join(config.dir, directory) }
  route.regexp = makeRegExp(route.path)
  this.table.push(route)
}

Router.prototype.find = function(request) {
  for (route of this.table) {
    if (route.method === request.method) {
      if (route.regexp.test(request.path)) {
        request.route = route
        return route
      }
    }
  }
  return null
}

module.exports = new Router
