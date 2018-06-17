const loki = require('lokijs')
const db = new loki()

const clients = db.addCollection('clients', { unique: ['region', 'client'] })

module.exports = clients
