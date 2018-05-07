const targetAllies = require('./targetAllies')
const targetCharacters = require('./targetCharacters')
const targetCollectibles = require('./targetCollectibles')
const targetEnemies = require('./targetEnemies')
const targetPortals = require('./targetPortals')
const targetSpirits = require('./targetSpirits')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < spirit.actionTree.length; i++) {
        const targetCategory = spirit.actionTree[i].target.split(':')
        let target

        switch (targetCategory[0]) {
          case 'self':
            resolve([spirit.instance, spirit.actionTree[i].actions])
            break
          case 'attacker':
            if (spirit.lastAttackedBy) {
              const target =
                spirit.lastAttackedBy.type === 'spirit' ?
                  await targetSpirits(spirit, targetCategory[0]) :
                  await targetCharacters(spirit, targetCategory[0])

              if (target) {
                resolve([target, spirit.actionTree[i].actions])
              }
            }
            break
          case 'previousTarget':
            if (spirit.previousTarget) {
              const target =
                spirit.previousTarget.type === 'spirit' ?
                  await targetSpirits(spirit, targetCategory[0]) :
                  await targetCharacters(spirit, targetCategory[0])

              if (target) {
                resolve([target, spirit.actionTree[i].actions])
              }
            }
            break
          case 'collectibles':
            if (spirit.carrying.length < spirit.maxCarry) {
              target = await targetCollectibles(spirit, targetCategory[1])

              if (target) {
                resolve([target, spirit.actionTree[i].actions])
              }
            }
            break
          case 'allies':
          case 'vulnerableAllies':
            target = await targetAllies(spirit, targetCategory[0])

            if (target) {
              resolve([target, spirit.actionTree[i].actions])
            }
            break
          case 'enemies':
          case 'vulnerableEnemies':
            target = await targetEnemies(spirit, targetCategory[0])

            if (target) {
              resolve([target, spirit.actionTree[i].actions])
            }
            break
          case 'spirits':
          case 'allySpirits':
          case 'enemySpirits':
            target = await targetSpirits(spirit, targetCategory[0])

            if (target) {
              resolve([target, spirit.actionTree[i].actions])
            }
            break
          case 'summoner':
            target = await targetCharacters(spirit, targetCategory[1])

            if (target) {
              resolve([target, spirit.actionTree[i].actions])
            }
            break
          case 'summonerAttacker':
            break
          case 'summonerPortalAttacker':
            break
          case 'portals':
            target = await targetPortals(spirit, targetCategory[0])

            if (target) {
              resolve([target, spirit.actionTree[i].actions])
            }
            break
          case 'vampires':
          case 'witches':
            target = await targetCharacters(spirit, targetCategory[0])

            if (target) {
              resolve([target, spirit.actionTree[i].actions])
            }
            break
          default:
            break
        }
      }
      resolve([false, false])
    }
    catch (err) {
      reject(err)
    }
  })
}
