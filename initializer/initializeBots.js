//const timers = require('../database/timers')
//const addFieldToHash = require('../redis/addFieldToHash')
const checkKeyExistance = require('../redis/checkKeyExistance')
const getActiveSet = require('../redis/getActiveSet')
//const getFieldsFromHash = require('../redis/getFieldsFromHash')
const removeFromAll = require('../redis/removeFromAll')
const botActivate = require('../manager/bots/botActivate')

module.exports = async () => {
  const bots = await getActiveSet('bots')
  if (bots.length) {
    for (let i = 0, length = bots.length; i < length; i++) {
      if (!bots[i] || !(await checkKeyExistance(bots[i]))) {
        removeFromAll('bots', bots[i])
        removeFromAll('characters', bots[i])
        continue
      }

      await botActivate(bots[i])
    }
  }

  return true
}
