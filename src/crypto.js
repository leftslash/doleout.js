const fs = require('fs')
const crypto = require('crypto')

const promisify = require('./promisify')

const randomBytes = promisify(crypto.randomBytes)
const scrypt      = promisify(crypto.scrypt)

const algorithm = 'aes-192-cbc'

let cipher
let decipher

async function setup() {

  if (cipher && decipher) return

  const passwd = await randomBytes(24)
  const salt   = await randomBytes(16)
  const iv     = await randomBytes(16)
  const key    = await scrypt(passwd, salt, 24)

  cipher = crypto.createCipheriv(algorithm, key, iv)
  decipher = crypto.createDecipheriv(algorithm, key, iv)

}

async function encrypt (clearText) {
  await setup()
  let cipherText = cipher.update(clearText, 'utf8', 'hex')
  cipherText += cipher.final('hex')
  return cipherText
}

async function decrypt (cipherText) {
  await setup()
  let clearText = decipher.update(cipherText, 'hex', 'utf8')
  clearText += decipher.final('utf8')
  return clearText
}

module.exports = { encrypt, decrypt }
