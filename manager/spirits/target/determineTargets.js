const targetAll = require('./targetAll')
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
            target = spirit
            resolve([spirit.instance, spirit.actionTree[i].actions])
            break
          case 'all':
            target = await targetAll(spirit)
            break
          case 'attacker':
            if (spirit.lastAttackedBy) {
              target =
                spirit.lastAttackedBy.type === 'spirit' ?
                  await targetSpirits(spirit, targetCategory[0]) :
                  await targetCharacters(spirit, targetCategory[0])
            }
            break
          case 'previousTarget':
            if (spirit.previousTarget) {
              target =
                spirit.previousTarget.type === 'spirit' ?
                  await targetSpirits(spirit, targetCategory[0]) :
                  await targetCharacters(spirit, targetCategory[0])
            }
            break
          case 'collectible':
            if (spirit.carrying.length < spirit.maxCarry) {
              target = await targetCollectibles(spirit, targetCategory[1])
            }
            break
          case 'allies':
          case 'vulnerableAllies':
            target = await targetAllies(spirit, targetCategory[0])
            break
          case 'enemies':
          case 'vulnerableEnemies':
            target = await targetEnemies(spirit, targetCategory[0])
            break
          case 'spirits':
          case 'allySpirits':
          case 'enemySpirits':
            target = await targetSpirits(spirit, targetCategory[0])
            break
          case 'summoner':
            target = await targetCharacters(spirit, targetCategory[1])
            break
          case 'summonerAttacker':
            break
          case 'summonerPortalAttacker':
            break
          case 'portals':
            target = await targetPortals(spirit, targetCategory[0])
            break
          case 'vampires':
          case 'witches':
            target = await targetCharacters(spirit, targetCategory[0])
            break
          default:
            break
        }
        if (target) {
          resolve([target, spirit.actionTree[i].actions])
        }
      }
      resolve([false, false])
    }
    catch (err) {
      reject(err)
    }
  })
}
