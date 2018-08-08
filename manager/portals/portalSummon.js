const addExperience = require('../../redis/addExperience')
const addObjectToHash = require('../../redis/addObjectToHash')
const addToActiveSet = require('../../redis/addToActiveSet')
const addToGeohash = require('../../redis/addToGeohash')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const createInstanceId = require('../../utils/createInstanceId')
const createMapToken = require('../../utils/createMapToken')
const determineExperience = require('../../utils/determineExperience')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const spiritAdd = require('../spirits/spiritAdd')

module.exports = async (portalInstance) => {
  try {
    const currentTime = Date.now()
    const portal = await getAllFromHash(portalInstance)
    const update = []

    if (portal) {
      const { moveFreq, actionFreq } =
        await getOneFromList('spirits', portal.spirit.id)
      const spirit = Object.assign(
        {},
        portal.spirit,
        { instance: createInstanceId() }
      )

      spirit.summonLat = portal.latitude
      spirit.summonLong = portal.longitude
      spirit.latitude = portal.latitude
      spirit.longitude = portal.longitude
      spirit.createdOn = currentTime
      spirit.expireOn = spirit.duration > 0 ?
        currentTime + (spirit.duration * 3600000) : 0

      let moveOn
      if (moveFreq.includes('-')) {
        const range = moveFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        moveOn = currentTime +
          ((Math.floor(Math.random() * (max - min + 1)) + min) * 1000)
      }
      else {
        moveOn = parseInt(moveFreq, 10)
      }

      spirit.moveOn = moveOn

      let actionOn
      if (actionFreq.includes('-')) {
        const range = actionFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        actionOn = currentTime +
          ((Math.floor(Math.random() * (max - min + 1)) + min) * 1000)
      }
      else {
        actionOn = parseInt(actionFreq, 10)
      }

      spirit.actionOn = actionOn

      update.push(
        addObjectToHash(spirit.instance, spirit),
        addToActiveSet('spirits', spirit.instance),
        addToGeohash(
          'spirits',
          spirit.instance,
          spirit.latitude,
          spirit.longitude
        ),
        removeFromAll('portals', portalInstance),
      )

      const inform = [
        {
          function: informNearbyPlayers,
          parameters: [
            portal,
            {
              command: 'map_token_add',
              token: createMapToken(spirit.instance, spirit)
            },
            Object.values(spirit.conditions)
              .filter(condition => condition.status === 'invisible').length ?
              1 : 0
          ]
        }
      ]

      if (spirit.owner) {
        const [summoner, xpMultipliers] = await Promise.all([
          getAllFromHash(portal.owner),
          getOneFromList('constants', 'xpMultipliers')
        ])

        summoner.instance = portal.owner

        const firstSummon = summoner.summonedSpirits ?
          summoner.summonedSpirits.includes(spirit.id) : false

        if (firstSummon) {
          update.push(
            updateHashFieldArray(
              spirit.owner,
              'add',
              'summonedSpirits',
              spirit.id
            )
          )
        }

        const xpGain = determineExperience(
          xpMultipliers,
          'summon',
          firstSummon,
          spirit,
          summoner,
          portal.ingredients
        )

        const [xpUpdate, xpInform] = await addExperience(summoner, xpGain)

        update.push(...xpUpdate)
        inform.push(...xpInform)

        const index = summoner.activePortals.indexOf(portalInstance)

        update.push(
          updateHashFieldArray(
            portal.owner,
            'remove',
            'activePortals',
            portalInstance,
            index
          ),
          updateHashFieldArray(
            portal.owner,
            'add',
            'activeSpirits',
            spirit.instance
          )
        )
      }

      if (spirit.player) {
        inform.push(
          {
            function: informPlayers,
            parameters: [
              [spirit.player],
              {
                command: 'character_spirit_summoned',
                instance: spirit.instance,
                spirit: spirit.id,
                portalInstance: portalInstance
              }
            ]
          }
        )
      }

      inform.push(
        {
          function: informNearbyPlayers,
          parameters: [
            [portal.latitude, portal.longitude],
            {
              command: 'map_token_remove',
              instance: portalInstance
            }
          ]
        }
      )

      update.push(spiritAdd(spirit.instance, spirit))

      await Promise.all(update)

      for (const informObject of inform) {
        const informFunction = informObject.function
        await informFunction(...informObject.parameters)
      }
    }

    return true
  }
  catch (err) {
    console.error(err)
  }
}
