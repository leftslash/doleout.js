const pathParamRegExp = /^{.*}$/

function Request(request) { 

  this.request = request
  this.method = request.method.toLowerCase()
  this.headers = request.headers
  this.path = request.url.split('?')[0]

  let body = ''
  this.request.on('data', (chunk) => {
    body += chunk
  })

  this.request.on('end', () => {
    this.body = body
    if (this.client) this.client(this.body)
  })

}

Request.prototype.param = function(key) {
  if (this.pathParams === undefined) {
    this.pathParams = {}
    const routeDirs = this.route.path.split('/').slice(1)
    const pathDirs = this.path.split('/').slice(1)
    for (let i in routeDirs) {
      if (pathParamRegExp.test(routeDirs[i])) {
        let dir = routeDirs[i].slice(1,routeDirs[i].length-1)
        this.pathParams[dir] = pathDirs[i]
      }
    }
  }
  return this.pathParams[key]
}

Request.prototype.query = function(key) {
  if (this.queryParams === undefined) {
    this.queryParams = {}
    const queries = this.request.url.split('?').slice(1)
    for (let query of queries) {
      query = query.split('&')
      for (let keyValue of query) {
        keyValue = keyValue.split('=')
        let key = keyValue[0]
        let val = keyValue[1]
        this.queryParams[key] = val
      }
    }
  }
  return this.queryParams[key]
}

Request.prototype.form = function(callback) {
  this.client = callback
}

Request.prototype.cookie = function() {}
Request.prototype.json = function() {}

module.exports = Request
