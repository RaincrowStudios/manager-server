const timers = require('../database/timers')
const addFieldToHash = require('../redis/addFieldToHash')
const checkKeyExistance = require('../redis/checkKeyExistance')
const getActiveSet = require('../redis/getActiveSet')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const removeFromAll = require('../redis/removeFromAll')
const collectibleExpire = require('../manager/collectibles/collectibleExpire')

module.exports = async (id, managers) => {
  const collectibles = await getActiveSet('collectibles')

  if (collectibles.length) {
    for (let i = 0, length = collectibles.length; i < length; i++) {
      if (!collectibles[i] || !(await checkKeyExistance(collectibles[i]))) {
        removeFromAll('collectibles', collectibles[i])
        continue
      }

      const { manager, expiresOn } = await getFieldsFromHash(collectibles[i], [
        'manager',
        'expiresOn'
      ])

      if (manager === id || !managers.includes(manager)) {
        await addFieldToHash(collectibles[i], 'manager', id)

        const currentTime = Date.now()

        if (expiresOn !== 0 && expiresOn < currentTime) {
          collectibleExpire(collectibles[i])
          continue
        }

        let expireTimer
        if (expiresOn) {
          expireTimer = setTimeout(
            () => collectibleExpire(collectibles[i]),
            expiresOn - currentTime
          )
        }

        const previousTimers = timers.by('instance', collectibles[i])
        if (previousTimers) {
          previousTimers.expireTimer = expireTimer
          timers.update(previousTimers)
        } else {
          timers.insert({ instance: collectibles[i], expireTimer })
        }
      }
    }
  }
  return true
}
