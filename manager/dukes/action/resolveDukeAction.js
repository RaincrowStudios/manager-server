const getOneFromList = require('../../../redis/getOneFromList')
const determineAction = require('./determineAction')
const determineTargets = require('./determineTargets')
const handleDukeAction = require('./handleDukeAction')

module.exports = (duke) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      const targets = await determineTargets(duke)

      for (let target of targets) {
        if (target.type === 'spirit') {
          const spiritInfo = await getOneFromList('spirits', target.id)
          target = Object.assign({}, spiritInfo, target)

          if (!target.owner) {
            target = {...target, ...spiritInfo.wild}
          }

          const action = determineAction(duke, target)

          if (action) {
            const [actionUpdate, actionInform] =
              await handleDukeAction(duke, target, action)

            update.push(...actionUpdate)
            inform.push(...actionInform)
          }
        }
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
