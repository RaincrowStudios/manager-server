const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const informPlayers = require('../../../utils/informPlayers')
const deleteAllConditions = require('../../conditions/deleteAllConditions')
const portalDestroy = require('../../portals/portalDestroy')
const spiritDeath = require('../spiritDeath')

module.exports = (target, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      if (target.type === 'spirit') {
        update.push(spiritDeath(target.instance, killer))
      }
      else if (target.type === 'portal') {
        update.push(portalDestroy(target.instance, killer))
      }
      else {
        for (let i = 0; i < target.conditions.length; i++) {
          update.push(
            updateHashFieldArray(
              target.instance,
              'remove',
              'conditions',
              target.conditions[i],
              i
            )
          )
        }

        update.push(
          informPlayers(
            [target.instance],
            {
              command: 'player_character_death',
              killer: {
                displayName: killer.displayName,
                type: killer.type,
                degree: killer.degree,
                owner: killer.ownerDisplay
              }
            }
          ),
          deleteAllConditions(target.conditions)
        )
      }

      await Promise.all(update)
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
