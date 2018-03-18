const informPlayers = require('../../../utils/informPlayers')
const conditionExpire = require('../../conditions/conditionExpire')
const portalDestroy = require('../../portals/portalDestroy')
const spiritDeath = require('../spiritDeath')

module.exports = (targetInstance, target, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (target.type === 'spirit') {

        const conditionsToExpire = target.conditions.length > 0 ?
          target.conditions.map(
            condition => conditionExpire(condition.instance)
          ) : []

        await Promise.all([
          spiritDeath(targetInstance, killer),
          ...conditionsToExpire
        ])
      }
      else if (target.type === 'portal') {
        await portalDestroy(targetInstance, target, killer)
      }
      else {
        const conditionsToExpire = target.conditions
        .map(condition => conditionExpire(condition.instance))

        await Promise.all([
          informPlayers(
            [targetInstance],
            {
              command: 'player_death'
            }
          ),
          ...conditionsToExpire
        ])
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
