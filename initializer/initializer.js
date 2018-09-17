const getManagedInstancesList = require('../utils/getManagedInstancesList')
const handleError = require('../utils/handleError')
const initializeConditions = require('./initializeConditions')
const initializeCooldowns = require('./initializeCooldowns')
const initializeDukes = require('./initializeDukes')
const initializeImmunities = require('./initializeImmunities')
const initializeLocations = require('./initializeLocations')
const initializePortals = require('./initializePortals')
const initializeQuests = require('./initializeQuests')
const initializeSpirits = require('./initializeSpirits')

async function initializer() {
  try {
    const id = process.env.INSTANCE_ID

    let managers = []
    if (process.env.NODE_ENV !== 'development') {
      managers = await getManagedInstancesList()
    }

    await Promise.all([
      initializeConditions(id, managers),
      initializeCooldowns(id, managers),
      initializeImmunities(id, managers),
      initializePortals(id, managers),
      initializeSpirits(id, managers)
    ])
  }
  catch (err) {
    handleError(err)
  }
}

module.exports = initializer
