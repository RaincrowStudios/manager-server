const timers = require('../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const cooldownExpire = require('../manager/cooldowns/cooldownExpire')

const getAllFromHash = require('../redis/getAllFromHash')

async function initializeCooldowns() {
  try {
    const cooldowns = await getActiveSet('cooldowns')
    console.log(await getAllFromHash('list:cooldowns'))
    if (cooldowns.length) {
      for (let i = 0; i < cooldowns.length; i++) {
        const currentTime = Date.now()
        const cooldown = await getFieldsFromHash(
          'list:cooldowns',
          [cooldowns[i]]
        )

        if (cooldown) {
          if (cooldown.expiresOn > currentTime) {
            const expireTimer =
              setTimeout(() =>
                cooldownExpire(cooldowns[i]),
                cooldown.expiresOn - currentTime
              )

            const previousTimers = timers.by('instance', cooldowns[i])
            if (previousTimers) {
              previousTimers.expireTimer

              timers.update(previousTimers)
            }
            else {
              timers.insert({instance: cooldowns[i], expireTimer})
            }
          }
          else {
            cooldownExpire(cooldowns[i])
          }
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializeCooldowns
