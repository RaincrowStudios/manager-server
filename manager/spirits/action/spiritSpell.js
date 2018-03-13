const getOneFromHash = require('../../../utils/getOneFromHash')
const determineHeal = require('./determineHeal')
const determineDamage = require('./determineDamage')
const addCondition = require('./addCondition')

function spiritSpell(instance, spirit, targetInstance, target, action) {
  return new Promise(async (resolve, reject) => {
    try {
      const spell = await getOneFromHash('spells', action)
      let result = {}

      if (spell.special) {
        spiritSpecialSpell()
      }
      else {
        if (spell.range.includes('#')) {
          result = determineHeal(spell)
        }
        else {
          result = determineDamage(spirit, target, spell)
        }

        if (spell.condition) {
          if (spell.condition.maxStack <= 0) {
            result.condition = await addCondition(
              instance,
              spirit,
              targetInstance,
              target,
              action,
              spell
            )
          }
          else {
            let stack = 0
            for (const condition of target.conditions) {
              if (condition && condition.id === action) {
                stack++
              }
            }
            if (stack < spell.condition.maxStack) {
              result.condition = await addCondition(
                instance,
                spirit,
                targetInstance,
                target,
                spell
              )
            }
          }
        }
      }


      spirit.previousTarget = targetInstance
      target.energy += result.total
      if (result.condition) {
        target.conditions.push(result.condition)
      }

      if (result.total < 0) {
        target.lastAttackedBy = { instance, type: 'spirit' }
      }
      else if (result.total > 0) {
        target.lastHealedBy = { instance, type: 'spirit' }
      }

      if (target.energy <= 0) {
        target.dead = true
      }

      const nearCharacters =
        await getNearbyFromGeohashByPoint(
          'Characters',
          spirit.latitude,
          spirit.longitude,
          constants.maxRadius
        )

      const nearCharactersInfo =
        await Promise.all(
          nearCharacters.map(character => getInfoFromRedis(character))
        )

      const playersToInform =
        nearCharactersInfo
        .filter(character => character)
        .map(character => character.owner)



                if (target.dead) {
                  await Promise.all([
                    informPlayers(
                      playersToInform,
                      {
                        command: 'map_spirit_action',
                        instance: instance,
                        target: targetInstance,
                        total: result.total,
                        dead: target.dead
                      }
                    ),
                    informPlayers(
                      [spirit.ownerPlayer],
                      {
                        command: 'player_spirit_action',
                        instance: instance,
                        displayName: spirit.displayName,
                        target: target.type === 'spirit' || target.type === 'portal' ?
                          target.displayName : targetInstance,
                        xp: 'xp_gain'
                      }
                    ),
                    addToRedis(instance, spirit),
                    resolveTargetDestruction(targetInstance, target, instance)
                  ])
                }
                else {
                  await Promise.all([
                    informPlayers(
                      playersToInform,
                      {
                        command: 'map_spirit_action',
                        instance: instance,
                        target: targetInstance,
                        total: result.total,
                        dead: target.dead
                      }
                    ),
                    informPlayers(
                      [spirit.ownerPlayer],
                      {
                        command: 'player_spirit_action',
                        instance: instance,
                        displayName: spirit.displayName,
                        target: target.type === 'spirit' || target.type === 'portal' ?
                          target.displayName : targetInstance,
                        xp: 'xp_gain'
                      }
                    ),
                    addToRedis(instance, spirit),
                    addToRedis(targetInstance, target)
                  ])
                }

      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}

module.exports = spiritSpell
