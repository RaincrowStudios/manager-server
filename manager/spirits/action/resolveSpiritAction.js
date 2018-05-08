const checkKeyExistance = require('../../../redis/checkKeyExistance')
const getOneFromHash = require('../../../redis/getOneFromHash')
const determineTargets = require('../target/determineTargets')
const determineAction = require('./determineAction')
const basicAttack = require('./basicAttack')
const spiritCollect = require('./spiritCollect')
const spiritDiscover = require('./spiritDiscover')
const spiritSpell = require('./spiritSpell')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [target, actions] = await determineTargets(spirit)

      if (target.type === 'spirit') {
        const spiritInfo = await getOneFromHash('list:spirits', target.id)
        target = Object.assign({}, spiritInfo, target)
      }

      if (target) {
        const action = determineAction(actions)

        const targetExists = await checkKeyExistance(target.instance)

        if (targetExists && action) {
          switch (action) {
            case 'attack':
              await basicAttack(spirit, target)
              break
            case 'collect':
              await spiritCollect(spirit, target)
              break
            case 'discover':
              await spiritDiscover(spirit, target)
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
