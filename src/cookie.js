const crypto = require('./crypto')

async function set(name, value, options) {
  let cookieOptions = ''
  if (options) {
    if (options.expires) {
      cookieOptions += `; Expires=${options.expires}`
    }
    if (options.secure) {
      cookieOptions += `; Secure`
    }
    if (options.httpOnly) {
      cookieOptions += `; HttpOnly`
    }
    if (options.domain) {
      cookieOptions += `; Domain=${options.domain}`
    }
    if (options.path) {
      cookieOptions += `; Path=${options.path}`
    }
    if (options.samesite) {
      cookieOptions += `; SameSite=${options.samesite}`
    }
  } 
  const secureCookie = await crypto.encrypt(value))
  this.response.setHeader('Set-Cookie', `${name}=${secureCookie}${cookieOptions}`)
}

function get(name) {
  let cookieArray
  let cookies = {}
  const cookieHeader = this.request.getHeader('Cookie')
  if (typeof cookieHeader === 'String') {
    cookieArray = [cookieHeader]
  } else {
    cookieArray = [...cookieHeader]
  }
  for (cookie of cookieHeader) {
    cookieNameVal = cookie.split('=')
    cookieName = cookieNameVal[0]
    cookieVal
    cookies[cookieNameVal[0]] = cookieNameVal[1]
  }
}

module.exports = { get, set }
