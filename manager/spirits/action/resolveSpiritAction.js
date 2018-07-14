const addExperience = require('../../../redis/addExperience')
const addFieldToHash = require('../../../redis/addFieldToHash')
const getOneFromList = require('../../../redis/getOneFromList')
const incrementHashField = require('../../../redis/getOneFromList')
const determineExperience = require('../../../utils/determineExperience')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const informPlayers = require('../../../utils/informPlayers')
const levelUp = require('../../../utils/levelUp')
const determineTargets = require('../target/determineTargets')
const basicAttack = require('./basicAttack')
const checkSuccess = require('./checkSuccess')
const determineAction = require('./determineAction')
const spiritCollect = require('./spiritCollect')
const spiritDiscover = require('./spiritDiscover')
const spiritSpell = require('./spiritSpell')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let spell
      let inform = []
      let [target, actions] = await determineTargets(spirit)

      if (target.type === 'spirit') {
        const spiritInfo = await getOneFromList('spirits', target.id)
        target = Object.assign({}, spiritInfo, target)
      }

      if (target) {
        if (!checkSuccess(spirit, target)) {
          if (spirit.attributes && spirit.attributes.includes('bloodlust')) {
            inform.push(addFieldToHash(spirit.instance, 'bloodlustCount', 0))
          }
          if (target.type === 'witch' || target.type === 'vampire') {
            inform.push(
              informNearbyPlayers(
                spirit.latitude,
                spirit.longitude,
                {
                  command: 'map_spirit_fail',
                  instance: spirit.instance,
                  spirit: spirit.id,
                }
              )
            )
          }
        }
        else {
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

            inform = [
              incrementHashField(spirit.instance, 'xpGained', xpGain),
              informPlayers(
                [spirit.player],
                {
                  command: 'character_spirit_action',
                  spirit: spirit.id,
                  action: spell ? spell.id : action,
                  xp: xp
                }
              )
            ]

            if (newLevel) {
              inform.push(levelUp(spirit.owner, newLevel))
            }
          }
        }
      }
      else if (spirit.attributes && spirit.attributes.includes('bloodlust')) {
        await addFieldToHash(spirit.instance, 'bloodlustCount', 0)
      }

      await Promise.all(inform)
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
