const incrementSortedSet = require('../redis/incrementSortedSet')

module.exports = (character, region, type, xp, group = '') => {
  return new Promise(async (resolve, reject) => {
    try {
      const leaderboards = [
        incrementSortedSet('leaderboard:world:'+ type, xp, character),
        incrementSortedSet('leaderboard:' + region + ':' + type, xp, character)
      ]
      if (group) {
        if (type === 'witch') {
          leaderboards.push(
            incrementSortedSet('leaderboard:world:coven', xp, group),
            incrementSortedSet('leaderboard:' + region + ':coven', xp, group)
          )
        }
      }

      await Promise.all(leaderboards)

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
