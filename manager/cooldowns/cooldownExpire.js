const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromList = require('../../redis/removeFromList')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')

module.exports = async (cooldownInstance) => {
  try {
    const cooldown = await getOneFromHash('list:cooldowns', cooldownInstance)

    if (cooldown) {
      const [player, cooldownList] =
        await getFieldsFromHash(cooldown.bearer, ['player', 'cooldownList'])

      const index = cooldownList
        .map(oldCooldown => oldCooldown.spell)
        .indexOf(cooldown.spell)

      await Promise.all([
        informPlayers(
          [player],
          {
            command: 'character_cooldown_remove',
            instance: cooldownInstance,
          }
        ),
        removeFromActiveSet('cooldowns', cooldownInstance),
        removeFromList('cooldowns', cooldownInstance),
        updateHashFieldArray(
          cooldown.bearer,
          'remove',
          'cooldownList',
          cooldown,
          index
        )
      ])
    }
  }
  catch (err) {
    console.error(err)
  }
}
