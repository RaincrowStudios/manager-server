const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')

module.exports = async (immunityInstance) => {
  try {
    const immunity = await getAllFromHash(immunityInstance)

    if (immunity) {
      const bearer = await getAllFromHash(immunity.bearer)

      await Promise.all([
        informNearbyPlayers(
          bearer,
          {
            command: 'map_immunity_remove',
            instance: bearer.instance,
            immunity: immunity.caster
          }
        ),
        removeFromActiveSet('immunities', immunityInstance),
        removeHash(immunityInstance),
        updateHashFieldObject(
          immunity.bearer,
          'remove',
          'immunities',
          immunityInstance
        )
      ])
    }
  }
  catch (err) {
    console.error(err)
  }
}
