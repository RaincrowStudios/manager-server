const informPlayers = require('../../../utils/informPlayers')
const deleteAllConditions = require('../../conditions/deleteAllConditions')
const portalDestroy = require('../../portals/portalDestroy')
const spiritDeath = require('../spiritDeath')

module.exports = (targetInstance, target, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (target.type === 'spirit') {
        await spiritDeath(targetInstance, killer)
      }
      else if (target.type === 'portal') {
        await portalDestroy(targetInstance, killer)
      }
      else {
        await Promise.all([
          informPlayers(
            [targetInstance],
            {
              command: 'player_death',
              killer: killer.displayName,
              owner: killer.ownerDisplay
            }
          ),
          deleteAllConditions(target.conditions)
        ])
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
