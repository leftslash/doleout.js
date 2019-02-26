const parmRegExp = /^{.*}$/

function getRegExp(path) {
  var str = '^'
  var dirs = path.split('/').slice(1)
  for (dir of dirs) {
    if (parmRegExp.test(dir)) {
      str += '/[^/]+'
    } else {
      str += '/' + dir
    }
  }
  return new RegExp(str + '$')
}

function Route(method, path, handler) {
  this.method = method
  this.path = path
  this.handler = handler
}

function Router() {
  this.table = []
}

Router.prototype.add = function(method, path, handler) {
  const route = new Route(method, path, handler)
  route.regexp = getRegExp(route.path)
  this.table.push(route)
}

Router.prototype.find = function(method, path) {
  for (route of this.table) {
    if (route.method === method) {
      if (route.regexp.test(path)) {
        return route
      }
    }
  }
  return null
}

module.exports = new Router()
