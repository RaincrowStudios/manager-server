const getOneFromHash = require('../redis/getOneFromHash')
const informPlayers = require('../utils/informPlayers')
const updateHashFieldObject = require('../redis/updateHashFieldObject')

module.exports = async (location) => {
  try {
    const update = []
    const inform = []

    if (location.controlledBy) {
      let previousControllerPlayers = []
      const previousControllerMembers =
        await getOneFromHash(location.controlledBy, 'members')

      if (previousControllerMembers) {
        previousControllerPlayers = Object.values(previousControllerMembers)
          .map(member => member.player)
      }
      else {
        previousControllerPlayers = await Promise.all([
          getOneFromHash(location.controlledBy, 'player')
        ])
      }

      update.push(
        updateHashFieldObject(
          location.controlledBy,
          'remove',
          'locationsControlled',
          location.instance,
        )
      )

      inform.push(
        {
          function: informPlayers,
          parameters: [
            previousControllerPlayers,
            {
              command: 'character_location_lost',
              location: location.instance
            }
          ]
        }
      )
    }
    return([update, inform])
  }
  catch (err) {
    console.error(err)
  }
}
