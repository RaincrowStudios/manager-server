const initializeConditions = require('./initializeConditions')
const initializeSpirits = require('./initializeSpirits')

async function initializer() {
  initializeConditions()
  initializeSpirits()
}

module.exports = initializer
