const addExperience = require('../../../redis/addExperience')
const addFieldToHash = require('../../../redis/addFieldToHash')
const getOneFromList = require('../../../redis/getOneFromList')
const informPlayers = require('../../../utils/informPlayers')
const levelUp = require('../../../utils/levelUp')
const determineTargets = require('../target/determineTargets')
const basicAttack = require('./basicAttack')
const determineAction = require('./determineAction')
const determineExperience = require('./determineExperience')
const spiritCollect = require('./spiritCollect')
const spiritDiscover = require('./spiritDiscover')
const spiritSpell = require('./spiritSpell')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let spell
      let [target, actions] = await determineTargets(spirit)

      if (target.type === 'spirit') {
        const spiritInfo = await getOneFromList('spirits', target.id)
        target = Object.assign({}, spiritInfo, target)
      }

      if (target) {
        const action = determineAction(actions)
        if (action) {
          if (target === 'discover') {
            await spiritDiscover(spirit, action)
          }
          else {
            switch (action) {
              case 'attack':
                await basicAttack(spirit, target)
                break
              case 'collect':
                await spiritCollect(spirit, target)
                break
              default:
                spell = await getOneFromList('spells', action)
                await spiritSpell(spirit, target, spell)
                break
            }
          }
        }
        if (spirit.owner) {
          const xpMultipliers =
            await getOneFromList('constants', 'xpMultipliers')

          const xpGain = determineExperience(
            xpMultipliers,
            'action',
            false,
            spirit
          )

          const [xp, newLevel] = await addExperience(
            spirit.owner, spirit.dominion, 'witch', xpGain, spirit.coven
          )

          const inform = [
            informPlayers(
              [spirit.player],
              {
                command: 'character_spirit_action',
                spirit: spirit.displayName,
                action: spell ? spell.displayName : action,
                target: target.displayName,
                targetType: target.type,
                xp: xp
              }
            )
          ]

          if (newLevel) {
            inform.push(levelUp(spirit.player, newLevel))
          }

          await Promise.all(inform)
        }
      }
      else if (spirit.attributes && spirit.attributes.includes('bloodlust')) {
        await addFieldToHash(spirit.instance, 'bloodlustCount', 0)
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
