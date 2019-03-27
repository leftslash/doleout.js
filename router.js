const pathUtil = require('path')

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
  return new RegExp(str + '\/?')
}

function Router() {

  // Constructor initiated properties
  this.table = []
  
  // Properties assigned later, included here for sanity's sake
  this.config = undefined

}

function Route(method, path, handler) {

  // Constructor initiated properties
  this.method  = method
  this.path    = path
  this.handler = handler

  // Properties assigned later, included here for sanity's sake
  this.regexp    = undefined
  this.directory = undefined

}

Router.prototype.add = function(method, path, handler) {
  const route = new Route(method, path, handler)
  route.regexp = makeRegExp(route.path)
  this.table.push(route)
}

Router.prototype.find = function(request) {
  for (let route of this.table) {
    if (route.method === request.method) {
      if (route.regexp.test(request.path)) {
        request.route = route
        return route
      }
    }
  }
  return null
}

Router.prototype.addStatic = function(path, directory) {
  const route = new Route('get', path, null)
  route.regexp = makeRegExp(route.path)
  route.directory = pathUtil.join(this.config.http.dir, directory)
  this.table.push(route)
}

module.exports = new Router
