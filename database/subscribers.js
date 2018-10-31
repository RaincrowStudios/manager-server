const loki = require('lokijs')
const db = new loki()

const subscribers = db.addCollection('subscribers', { unique: ['subscriber'] })

module.exports = subscribers
