const jwt = require('jsonwebtoken')
const keys = require('../keys/keys')

module.exports = (object, expiration = '') => {
  if (expiration) {
    return jwt.sign(object, Buffer.from(keys.jwt, 'base64'), { expiresIn: expiration })
  }
  else {
    return jwt.sign(object, Buffer.from(keys.jwt, 'base64'))
  }
}
