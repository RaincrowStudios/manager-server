const removeFromActiveSet = require('../../../../redis/removeFromActiveSet')
const removeHash = require('../../../../redis/removeHash')
const updateHashFieldArray = require('../../../../redis/updateHashFieldArray')
const informPlayers = require('../../../../utils/informPlayers')
const deleteCondition = require('../../../conditions/deleteCondition')

module.exports = (caster, target) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = {
        total: 0,
        critical: false,
        resist: false,
      }

      const index = Math.floor(Math.random() * target.conditions.length)

      if (target.conditions.length) {
        await Promise.all([
          deleteCondition(target.conditions[index].instance),
          informPlayers(
            [target.player],
            {
              command: 'player_condition_remove',
              condition: target.conditions[index].instance
            }
          ),
          removeFromActiveSet('conditions', target.conditions[index].instance),
          removeHash(target.conditions[index].instance),
          updateHashFieldArray(
            target.instance,
            'remove',
            'conditions',
            target.conditions[index].instance,
            index
          )
        ])

        result.dispelled = [target.conditions[index].displayName]
      }
      else {
        result.dispelled = []
      }
      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}
