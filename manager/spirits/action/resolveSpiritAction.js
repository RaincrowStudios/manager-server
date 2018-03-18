const checkKeyExistance = require('../../../redis/checkKeyExistance')
const determineTargets = require('./determineTargets')
const determineAction = require('./determineAction')
const basicAttack = require('./basicAttack')
const spiritCollect = require('./spiritCollect')
const spiritSpell = require('./spiritSpell')

module.exports = (spiritInstance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let targetInstance, target, actions, targetCategory
      [targetInstance, target, actions] =
        await determineTargets(spiritInstance, spirit)

      if (target) {
        switch (target.type) {
          case 'witch':
          case 'vampire':
            targetCategory = 'characters'
            break
          default:
            targetCategory = target.type + 's'
        }

        const action = determineAction(actions)

        const exists = await checkKeyExistance(targetCategory, targetInstance)

        if (exists) {
          switch (action) {
            case 'attack':
              await basicAttack(
                spiritInstance,
                spirit,
                targetCategory,
                targetInstance,
                target
              )
              break
            case 'collect':
              await spiritCollect(
                spiritInstance,
                spirit,
                targetCategory,
                targetInstance,
                target
              )
              break
            default:
              await spiritSpell(
                spiritInstance,
                spirit,
                targetCategory,
                targetInstance,
                target,
                action
              )
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
