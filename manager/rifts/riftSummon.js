const uuidv1 = require('uuid/v1')
const timers = require('../../database/timers')
const addFieldToHash = require('../../redis/addFieldToHash')
const addObjectToHash = require('../../redis/addObjectToHash')
const addToActiveSet = require('../../redis/addToActiveSet')
const addToGeohash = require('../../redis/addToGeohash')
const getAllFromHash = require('../../redis/getAllFromHash')
const createMapToken = require('../../utils/createMapToken')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const riftSummon = require('./riftSummon')
const spiritAdd = require('../spirits/spiritAdd')

module.exports = async (instance) => {
  try {
    const currentTime = Date.now()
    const rift = await getAllFromHash(instance)

    if (rift) {
      const spiritInstance = uuidv1()
      const spirit = rift.spirit
      spirit.degree = rift.white > rift.shadow ? 1 : -1
      spirit.createdOn = currentTime
      spirit.expiresOn = currentTime + spirit.duration
      spirit.moveOn = currentTime
      spirit.actionOn = currentTime

      spirit.summonLat = rift.latitude
      spirit.summonLong = rift.longitude
      spirit.latitude = rift.latitude
      spirit.longitude = rift.longitude

      await Promise.all([
        addObjectToHash(spiritInstance, spirit),
        addToActiveSet('spirits', spiritInstance),
        addToGeohash(
          'spirits',
          spiritInstance,
          spirit.latitude,
          spirit.longitude
        )
      ])

      await Promise.all([
        informNearbyPlayers(
          rift.latitude,
          rift.longitude,
          {
            command: 'map_spirit_add',
            tokens: [createMapToken(instance, spirit)]
          }
        )
      ])
      spiritAdd(spiritInstance, spirit)

      const newSummonOn = currentTime + rift.summonFreq

      const newTimer =
        setTimeout(() =>
          riftSummon(instance), newSummonOn - currentTime
        )

      await addFieldToHash(instance, ['summonOn'], [newSummonOn])

      const riftTimers = timers.by('instance', instance)
      if (riftTimers) {
        riftTimers.summonTimer = newTimer
        timers.update(riftTimers)
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}
