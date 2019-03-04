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

Router.prototype.add = function(method, path, handler) {
  const route = { method, path, handler }
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
