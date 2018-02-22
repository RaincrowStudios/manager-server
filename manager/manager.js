const checkFamiliars = require('./checkFamiliars')
const checkPlaces = require('./checkPlaces')
const checkPortals = require('./checkPortals')
const checkSpirits = require('./checkSpirits')

async function manager() {
  try {
    Promise.all([
      checkFamiliars(),
      checkPlaces(),
      checkPortals(),
      checkSpirits()
    ])
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = manager
