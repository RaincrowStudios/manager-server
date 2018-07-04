const timers = require('../../database/timers')
const adjustEnergy = require('../../redis/adjustEnergy')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const updateHashField = require('../../redis/updateHashField')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const spiritDeath = require('../spirits/spiritDeath')
const resolveCondition = require('./resolveCondition')
const deleteCondition = require('./deleteCondition')

async function conditionTrigger (conditionInstance) {
  try {
    const currentTime = Date.now()
    const condition = await getAllFromHash(conditionInstance)

    if (condition && condition.bearer) {
      const [player, type, latitude, longitude, fuzzyLatitude, fuzzyLongitude] =
        await getFieldsFromHash(
          condition.bearer,
          [
            'player',
            'type',
            'latitude',
            'longitude',
            'fuzzyLatitude',
            'fuzzyLongitude'
          ]
        )

      if (condition.caster) {
        const spell = await getOneFromList('spells', condition.id)

        const [killerDisplayName, killerId, killerType, killerDegree] =
          await getFieldsFromHash(
            condition.caster, ['displayName', 'id', 'type', 'degree']
          )

        const total = resolveCondition(spell.condition)
        const [bearerEnergy, bearerState] =
          await adjustEnergy(condition.bearer, total)

        console.log({
          event: 'condition_triggered',
          player: player,
          character: condition.bearer,
          condition: spell.id,
          total: total,
        })

        if (bearerState === 'dead' && type === 'spirit') {
          await spiritDeath(condition.bearer, condition.caster)
        }
        else if (bearerState === 'dead') {
          await Promise.all([
            informNearbyPlayers(
              fuzzyLatitude,
              fuzzyLongitude,
              {
                command: 'map_condition_death',
                instance: condition.bearer
              },
              [condition.bearer]
            ),
            informPlayers(
              [player],
              {
                command: 'character_condition_death',
                killer: killerType === 'spirit' ? killerId : killerDisplayName,
                type: killerType,
                degree: killerDegree,
                spell: spell.id
              }
            ),
            deleteCondition(conditionInstance)
          ])
        }
        else {
          let update = []
          if (type !== 'spirit') {
            update.push(
              informPlayers(
                [player],
                {
                  command: 'character_condition_trigger',
                  condition: conditionInstance,
                  spell: spell.id,
                  energy: bearerEnergy,
                  state: bearerState
                }
              )
            ),
            informNearbyPlayers(
              fuzzyLatitude,
              fuzzyLongitude,
              {
                command: 'map_condition_trigger',
                instance: condition.bearer,
                spell: spell.id,
                energy: bearerEnergy
              },
              [condition.bearer]
            )
          }
          else {
            update.push(
              informNearbyPlayers(
                latitude,
                longitude,
                {
                  command: 'map_condition_trigger',
                  instance: condition.bearer,
                  spell: spell.id,
                  energy: bearerEnergy
                },
              )
            )
          }

          condition.triggerOn =
            currentTime + (condition.tick * 1000)

          update.push(
            updateHashField(conditionInstance, 'triggerOn', condition.triggerOn)
          )

          await Promise.all(update)

          const newTimer =
            setTimeout(() =>
              conditionTrigger(conditionInstance),
              condition.tick * 1000
            )

          let conditionTimer = timers.by('instance', conditionInstance)
          if (conditionTimer) {
            conditionTimer.triggerTimer = newTimer
            timers.update(conditionTimer)
          }
        }
      }
      else {
        deleteCondition(conditionInstance)
      }
    }
    else {
      deleteCondition(conditionInstance)
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = conditionTrigger
