const addExperience = require('../../../redis/addExperience')
const addFieldToHash = require('../../../redis/addFieldToHash')
const getAllFromHash = require('../../../redis/getAllFromHash')
const getOneFromList = require('../../../redis/getOneFromList')
const incrementHashField = require('../../../redis/getOneFromList')
const determineExperience = require('../../../utils/determineExperience')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
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
      const update = []
      const inform = []

      let [target, actions] = await determineTargets(spirit)
      let action = false 
      
      if(target) {
        action = determineAction(actions)
      }
console.log(action)
      if (target === 'discover') {
        const [interimUpdate, interimInform] =
          await spiritDiscover(spirit, action)

        update.push(...interimUpdate)
        inform.push(...interimInform)
      }
      else if (target.type === 'spirit') {
        const spiritInfo = await getOneFromList('spirits', target.id)
        target = Object.assign({}, spiritInfo, target)
      }

      if (target && target !== 'discover') {
        if (!checkSuccess(spirit, target)) {
          if (spirit.attributes && spirit.attributes.includes('bloodlust')) {
            update.push(addFieldToHash(spirit.instance, 'bloodlustCount', 0))
          }

          inform.unshift(
            {
              function: informNearbyPlayers,
              parameters: [
                spirit,
                {
                  command: 'map_spell_cast',
                  casterInstance: spirit.instance,
                  caster: spirit.id,
                  targetInstance: '',
                  target: '',
                  spell: '',
                  base: '',
                  result: 'failed'
                }
              ]
            }
          )
        }
        else {
          if (action) {
            if (action === 'attack') {
              const [interimUpdate, interimInform] =
                await basicAttack(spirit, target)

              update.push(...interimUpdate)
              inform.push(...interimInform)
            }
            else if (action === 'collect') {
              const [interimUpdate, interimInform] =
                await spiritCollect(spirit, target)

              update.push(...interimUpdate)
              inform.push(...interimInform)
            }
            else {
              const spell = await getOneFromList('spells', action)

              const [interimUpdate, interimInform] =
                await spiritSpell(spirit, target, spell)

              update.push(...interimUpdate)
              inform.push(...interimInform)
            }
          }
        }
      }
      else if (spirit.attributes && spirit.attributes.includes('bloodlust')) {
        update.push(addFieldToHash(spirit.instance, 'bloodlustCount', 0))
      }

      await Promise.all(update)

      for (const informObject of inform) {
        const informFunction = informObject.function
        await informFunction(...informObject.parameters)
      }

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
