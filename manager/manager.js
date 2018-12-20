const addFieldToHash = require('../redis/addFieldToHash')
const getOneFromHash = require('../redis/getOneFromHash')
const initializer = require('../initializer/initializer')
const botAdd = require('./bots/botAdd')
const botStart = require('./bots/botStart')
const botActivate = require('./bots/botActivate')
const collectibleAdd = require('./collectibles/collectibleAdd')
const cooldownAdd = require('./cooldowns/cooldownAdd')
const conditionAdd = require('./conditions/conditionAdd')
const dailiesAdd = require('./dailies/dailiesAdd')
const dukeAdd = require('./dukes/dukeAdd')
const idleTimerAdd = require('./idleTimers/idleTimerAdd')
const immunityAdd = require('./immunities/immunityAdd')
const locationAdd = require('./locations/locationAdd')
const portalAdd = require('./portals/portalAdd')
const spawnPointAdd = require('./spawnPoints/spawnPointAdd')
const spiritAdd = require('./spirits/spiritAdd')
const spiritStart = require('./spirits/spiritStart')
const clearTimers = require('../utils/clearTimers')
const stopTimers = require('../utils/stopTimers')
const getManagedInstancesList = require('../utils/getManagedInstancesList')

const addTimers = {
  bot: botAdd,
  collectible: collectibleAdd,
  condition: conditionAdd,
  cooldown: cooldownAdd,
  dailies: dailiesAdd,
  duke: dukeAdd,
  idleTimer: idleTimerAdd,
  immunity: immunityAdd,
  location: locationAdd,
  portal: portalAdd,
  spirit: spiritAdd,
  spawnPoint: spawnPointAdd
}

const startTimers = {
  bot: botStart,
  spirit: spiritStart
}

async function manager(message) {
  let managers = []
  let manager

  switch (message.command) {
    case 'initialize':
      initializer(message.instance)
      break
    case 'remove':
      clearTimers(message.instance)
      break
    case 'start':
      if (process.env.NODE_ENV === 'production') {
        managers = await getManagedInstancesList()
      }
      manager = await getOneFromHash(message.instance, 'manager')
      if (manager === process.env.INSTANCE_ID || !managers.includes(manager)) {
        await startTimers[message.type](message.instance)
      }
      break
    case 'activate':
      if (process.env.NODE_ENV === 'production') {
        managers = await getManagedInstancesList()
      }

      manager = await getOneFromHash(message.instance, 'manager')
      if (manager === process.env.INSTANCE_ID || !managers.includes(manager)) {
        await botActivate(message.instance)
      }
      break
    case 'stop':
      stopTimers(message.instance)
      break
    case 'add':
      await addFieldToHash(message.instance, 'manager', process.env.INSTANCE_ID)
      await addTimers[message.type](message.instance)
      break
    default:
      break
  }
  return true
}

module.exports = manager
