const checkKeyExistance = require('../../redis/checkKeyExistance')
const determineTargets = require('./target/determineTargets')
const determineAction = require('./action/determineAction')
const basicAttack = require('./action/basicAttack')
const spiritCollect = require('./action/spiritCollect')
const spiritSpell = require('./action/spiritSpell')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let target, actions
      [target, actions] = await determineTargets(spirit)

      if (target) {
        const action = determineAction(actions)

        const exists = await checkKeyExistance(target.instance)

        if (exists) {
          switch (action) {
            case 'attack':
              await basicAttack(spirit, target)
              break
            case 'collect':
              await spiritCollect(spirit.instance, target.instance)
              break
            default:
              await spiritSpell(spirit, target, action)
              break
          }
        }
      }
      resolve(true)
    }
      catch (err) {
        reject(err)
      }
    })
  }
