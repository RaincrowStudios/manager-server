const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromAll = require('../../redis/getAllFromHash')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')

module.exports = async (collectibleInstance) => {
  try {
    const collectible = await getAllFromHash(collectibleInstance)

    if (collectible) {
      const update = [
        removeFromAll('collectible', collectible.instance)
      ]

      const inform = [
        {
          function: informNearbyPlayers,
          parameters: [
            collectible,
            {
              command: 'map_token_remove',
              instance: collectible.instance
            }
          ]
        }
      ]


      await Promise.all(update)

      for (const informObject of inform) {
        const informFunction = informObject.function
        await informFunction(...informObject.parameters)
      }
    }
    else {
      await removeFromAll(collectible.Instance)
    }

    return true
  }
  catch (err) {
    console.error(err)
  }
}
