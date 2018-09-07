const timers = require('../database/timers')
const addFieldToHash = require('../redis/addFieldToHash')
const getOneFromHash = require('../redis/getOneFromHash')
const collectibleAdd = require('./collectibles/collectibleAdd')
const cooldownAdd = require('./cooldowns/cooldownAdd')
const conditionAdd = require('./conditions/conditionAdd')
const consumableAdd = require('./consumables/consumableAdd')
const idleTimerAdd = require('./idleTimers/idleTimerAdd')
const immunityAdd = require('./immunities/immunityAdd')
const locationAdd = require('./locations/locationAdd')
const portalAdd = require('./portals/portalAdd')
const spiritAdd = require('./spirits/spiritAdd')
const spiritDeath = require('./spirits/spiritDeath')
const informLogger = require('../utils/informLogger')

const addTimers = {
  collectible: collectibleAdd,
  condition: conditionAdd,
  consumable: consumableAdd,
  cooldown: cooldownAdd,
  idleTimer: idleTimerAdd,
  immunity: immunityAdd,
  location: locationAdd,
  portal: portalAdd,
  spirit: spiritAdd
}

const deathTimers = {
  spirit: spiritDeath
}

async function manager(message) {
  try {
    console.log(message.command, 'received')
    let timersToClear
    const instanceManager = await getOneFromHash(message.instance, 'manager')
    switch (message.command) {
      case 'remove':
        timersToClear = timers.by('instance', message.instance)
        if (timersToClear) {
          for (const key of Object.keys(timersToClear)) {
            if (key !== 'meta' && typeof timersToClear[key] === 'object') {
              clearTimeout(timersToClear[key])
            }
          }
        }
        break
      case 'add':
        message[message.type].manager = process.env.INSTANCE_ID
        await addFieldToHash(message.instance, 'manager', process.env.INSTANCE_ID)
        addTimers[message.type](message.instance, message[message.type])
        break
      case 'death':
      console.log(instanceManager)
      console.log(process.env.INSTANCE_ID)
        if (instanceManager === process.env.INSTANCE_ID) {
          deathTimers[message.type](message.entity, message.killer)
        }
        break
      default:
        break
    }
    return true
  }
  catch (err) {
    console.error('ERROR!!!!', err)

    informLogger({
      route: 'error',
      error_code: err.message,
      source: 'manager-server',
      content: err.stack
    })
  }
}

module.exports = manager
