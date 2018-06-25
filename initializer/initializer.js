const axios = require('axios')
const getStagingInstancesList = require('../utils/getStagingInstancesList')
const initializeConditions = require('./initializeConditions')
const initializeCooldowns = require('./initializeCooldowns')
const initializeImmunities = require('./initializeImmunities')
const initializePortals = require('./initializePortals')
const initializeSpirits = require('./initializeSpirits')

async function initializer() {
  try {
    const id = process.env.INSTANCE_ID

    let url = 'https://www.googleapis.com/compute/beta/projects/raincrow-pantheon/'
    let managers = []
    if (process.env.NODE_ENV === 'staging') {
      const response = await getStagingInstancesList()
      console.log(response)
      managers = JSON.parse(response).items.map(vm => vm.id)
    }
    else if (process.env.NODE_ENV === 'production') {
      url = url + 'regions/' +
        process.env.INSTANCE_REGION.split('/').pop().slice(0, -2) +
        '/instanceGroupManagers/' + 'prod-manager-group-' +
        process.env.INSTANCE_REGION.split('/').pop().slice(0, -2) +
        '/listManagedInstances'
      const response = await axios.post(url, {})
      console.log(response)
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
