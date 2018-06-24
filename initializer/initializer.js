const axios = require('axios')
const initializeConditions = require('./initializeConditions')
const initializeCooldowns = require('./initializeCooldowns')
const initializeImmunities = require('./initializeImmunities')
const initializePortals = require('./initializePortals')
const initializeSpirits = require('./initializeSpirits')

async function initializer() {
  try {
    const id = process.env.INSTANCE_ID
    const region = process.env.NODE_ENV === 'development' ?
      'local' :
      process.env.INSTANCE_REGION.split('/').pop().slice(0, -2)

    let group
    switch (process.env.NODE_ENV) {
      case 'development':
        group = 'local'
        break
      case 'staging':
        group = 'staging-manager-group'
        break
      default:
        group = 'prod-manager-group-' + region
    }

    let managers = []
    if (process.env.NODE_ENV !== 'development') {
      const url =
        'https://www.googleapis.com/compute/beta/projects/raincrow-pantheon/regions/' +
        region + '/instanceGroupManagers/' + group + '/listManagedInstances'
      const response = axios.post(url, {})
      managers = JSON.parse(response).managedInstances.map(vm => vm.id)
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
    console.error(err)
  }
}

module.exports = initializer
