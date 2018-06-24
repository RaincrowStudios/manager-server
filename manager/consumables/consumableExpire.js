const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const incrementHashField = require('../../redis/incrementHashField')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromList = require('../../redis/removeFromList')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')

module.exports = async (consumableInstance) => {
  try {
    const consumable = await getOneFromList('active:consumables', consumableInstance)

    if (consumable) {
      const [player, activeConsumables] =
        await getFieldsFromHash(consumable.bearer, ['player', 'activeConsumables'])

      const index = activeConsumables
        .map(oldConsumable => oldConsumable.id)
        .indexOf(consumable.id)

      await Promise.all([
        informPlayers(
          [player],
          {
            command: 'character_consumable_remove',
            instance: consumableInstance,
          }
        ),
        removeFromActiveSet('consumables', consumableInstance),
        removeFromList('consumables', consumableInstance),
        incrementHashField(
            consumable.bearer,
            consumable.effectedStat,
            consumable.effectedAmount*-1
        ),
        updateHashFieldArray(
          consumable.bearer,
          'remove',
          'activeConsumables',
          consumable,
          index
        )
      ])
    }
  }
  catch (err) {
    console.error(err)
  }
}
