const getOneFromHash = require('../../../redis/getOneFromHash')

module.exports = (spirit, nearTargets, targetCategory) => {
  return new Promise(async (resolve, reject) => {
    try {
      const nearCharacters = nearTargets
        .filter(target => target.type === 'witch' || target.type === 'vampire')

      let target
      if (nearCharacters.length) {
        if (targetCategory === 'allyWitch') {
          const nearAllies = nearCharacters
            .filter(target => target.coven === spirit.coven)

          if (nearAllies.length) {
            target = nearAllies[Math.floor(Math.random() * nearAllies.length)]
          }
        }
        else if (targetCategory === 'enemyWitch') {
          const nearEnemies = nearCharacters
            .filter(target => target.coven !== spirit.coven)

          if (nearEnemies.length) {
            target = nearEnemies[Math.floor(Math.random() * nearEnemies.length)]
          }
        }
        else if (targetCategory === 'attacker') {
          target = nearCharacters
            .filter(target => target.instance === spirit.lastAttackedBy.instance)[0]

        }
        else if (targetCategory === 'previousTarget') {
          target = nearCharacters
            .filter(target => target.instance === spirit.previousTarget.instance)[0]
        }
        else if (targetCategory === 'summoner') {
          target = nearCharacters
            .filter(target => target.instance === spirit.owner)[0]
        }
        else if (targetCategory === 'summonerAttacker') {
          const summonerAttacker =
            await getOneFromHash(spirit.owner, 'lastAttackedBy')
          if (summonerAttacker) {
            target = nearCharacters
              .filter(target => target.instance === summonerAttacker.instance)[0]
          }
        }
        else {
          target = nearCharacters[Math.floor(Math.random() * nearCharacters.length)]
        }
        if (target) {
          resolve(target)
        }
      }

      resolve(false)
    }
    catch (err) {
      reject(err)
    }
  })
}
