const getManagedInstancesList = require('../utils/getManagedInstancesList')
const initializeConditions = require('./initializeConditions')
const initializeCooldowns = require('./initializeCooldowns')
const initializeImmunities = require('./initializeImmunities')
const initializePortals = require('./initializePortals')
const initializeSpirits = require('./initializeSpirits')

async function initializer() {
  try {
    const id = process.env.INSTANCE_ID

    let managers = []
    if (process.env.NODE_ENV !== 'development') {
      const managers = await getManagedInstancesList()
    }

    console.log(managers)
    await Promise.all([
      initializeConditions(id, managers),
      initializeCooldowns(id, managers),
      initializeImmunities(id, managers),
      initializePortals(id, managers),
      initializeSpirits(id, managers)
    ])
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializer
