const loki = require('lokijs')
const db = new loki()

const subscribers = db.addCollection('subscribers', { unique: ['subscribers'] })

module.exports = subscribers
