const determineTargets = require('./determineTargets')
const determineAction = require('./determineAction')
const basicAttack = require('./basicAttack')
const spiritCollect = require('./spiritCollect')
const spiritSpell = require('./spiritSpell')

module.exports = (spiritInstance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let targetInstance, target, actions
      [targetInstance, target, actions] =
        await determineTargets(spiritInstance, spirit)

      if (target) {
        const action = determineAction(actions)

        switch (action) {
          case 'attack':
            await basicAttack(spiritInstance, spirit, targetInstance, target)
            break
          case 'collect':
            await spiritCollect(spiritInstance, spirit, targetInstance, target)
            break
          default:
            await spiritSpell(
              spiritInstance,
              spirit,
              targetInstance,
              target,
              action
            )
            break
        }
      }
      resolve(true)
    }
      catch (err) {
        reject(err)
      }
    })
  }
