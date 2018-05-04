const removeFromActiveSet = require('../../../../redis/removeFromActiveSet')
const removeFromHash = require('../../../../redis/removeFromHash')
const updateHashFieldArray = require('../../../../redis/updateHashFieldArray')
const informManager = require('../../../../utils/informManager')
const informPlayers = require('../../../../utils/informPlayers')

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
          informManager(
            {
              command: 'remove',
              type: 'condition',
              instance: target.conditions[index].instance,
            }
          ),
          informPlayers(
            [target.player],
            {
              command: 'player_condition_remove',
              condition: target.conditions[index].instance
            }
          ),
          removeFromActiveSet('conditions', target.conditions[index].instance),
          removeFromHash('list:conditions', target.conditions[index].instance),
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
