const pathParamRegExp = /^{.*}$/

function parseForm(data) {
  params = {}
  query = data.split('&')
  for (let keyValue of query) {
    keyValue = keyValue.split('=')
    let key = decodeURIComponent(keyValue[0])
    let val = decodeURIComponent(keyValue[1])
    params[key] = val
  }
  return params
}

function Request(request) { 

  // Constructor initiated properties
  this.request = request
  this.method  = request.method.toLowerCase()
  this.headers = request.headers
  this.path    = request.url.split('?')[0]

  // Properties assigned later, included here for sanity's sake
  this.body        = undefined
  this.formParams  = undefined
  this.jsonData    = undefined
  this.contentType = undefined
  this.waiters     = undefined


  // Read the body of the request now to streamline future requests for data
  // set a private variable to accumulate body data
  let body = ''
  this.request.on('data', (chunk) => {
    body += chunk
  })

  // when body has been completely loaded into local variable
  this.request.on('end', () => {

    // process any input data based on content-type
    this.contentType = this.headers['content-type']
    if (this.contentType) this.contentType = this.contentType.toLowerCase()

    // Parse Form data if applicable
    if (this.contentType === 'application/x-www-form-urlencoded') {
      this.formParams = parseForm(body)
      // move body data to public variable when done loading
      this.body = body
      // if there are any clients already waiting for body data
      if (this.waiters && this.waiters.length > 0) { 
        let waiter = this.waiters.pop()
        waiter.callback(this.formParams[waiter.key])
      }
      return
    } 
    
    // Parse JSON Data if applicable
    if (this.contentType === 'application/json') {
      try { this.jsonData = JSON.parse(body) } catch(e) { this.jsonData = null }
      this.body = body
      // if there are any clients already waiting for body data
      if (this.waiters && this.waiters.length > 0) { 
        let waiter = this.waiters.pop()
        waiter.callback(this.jsonData)
      }
      return
    }

    // Otherwise, parse untyped data
    // set the body in a public field for consumption
    this.body = body
    // if we were slow loading data and there is someone
    // waiting for the data, then call them with the data
    if (this.waiters && this.waiters.length > 0) { 
      let waiter = this.waiters.pop()
      waiter.callback(this.body)
    }
  })
}

Request.prototype.json = function(callback) {
  // if the data is already loaded
  if (this.jsonData) {
    // pass the data back to the caller
    callback(this.jsonData)
  } else {
    // otherwise register a callback
    // to be invoked when data is ready
    if (!this.waiters) this.waiters = []
    this.waiters.push({ callback })
  }
}

Request.prototype.form = function(key, callback) {
  // if the data is already loaded
  if (this.formParams) {
    // call them with the data
    callback(this.formParams[key])
  } else {
    // otherwise register a callback
    // to be invoked when data is ready
    if (!this.waiters) this.waiters = []
    this.waiters.push({ key, callback })
  }
}

Request.prototype.body = function(callback) {
  // if the data is already loaded
  if (this.body) {
    // call them with the data
    callback(this.body)
  } else {
    // otherwise register a callback
    // to be invoked when data is ready
    if (!this.waiters) this.waiters = []
    this.waiters.push({ callback })
  }
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
    const queries = this.request.url.split('?').slice(1)
    for (let query of queries) {
      this.queryParams = parseForm(query)
    }
  }
  return this.queryParams[key]
}

Request.prototype.cookie = function() {}

module.exports = Request
