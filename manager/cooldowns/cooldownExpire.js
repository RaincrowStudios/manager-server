const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromHash = require('../../redis/removeFromHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')

module.exports = async (cooldownInstance) => {
  try {
    const cooldown = await getOneFromHash('list:cooldowns', cooldownInstance)

    if (cooldown) {
      const cooldownList =
        await getOneFromHash(cooldown.bearer, 'cooldownList')

      const index = cooldownList
        .map(oldCooldown => oldCooldown.spell)
        .indexOf(cooldown.spell)

      await Promise.all([
        removeFromActiveSet('cooldowns', cooldownInstance),
        removeFromHash('list:cooldowns', cooldownInstance),
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
