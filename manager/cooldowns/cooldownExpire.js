const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const handleError = require('../../utils/handleError')
const informPlayers = require('../../utils/informPlayers')

module.exports = async (cooldownInstance) => {
  try {
    const cooldown = await getAllFromHash(cooldownInstance)

    if (cooldown) {
      const player = await getOneFromHash(cooldown.bearer, 'player')

      await Promise.all([
        informPlayers(
          [player],
          {
            command: 'character_cooldown_remove',
            instance: cooldownInstance,
          }
        ),
        removeFromActiveSet('cooldowns', cooldownInstance),
        removeHash(cooldownInstance),
        updateHashFieldObject(
          cooldown.bearer,
          'remove',
          'cooldowns',
          cooldownInstance
        )
      ])
    }
  }
  catch (err) {
    handleError(err)
  }
}
