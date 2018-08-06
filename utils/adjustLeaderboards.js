const incrementSortedSet = require('../redis/incrementSortedSet')

module.exports = (entity, xp) => {
  const leaderboards = [
    incrementSortedSet(
      'leaderboard:world:'+ entity.type,
      xp,
      entity.instance
    ),
    incrementSortedSet(
      'leaderboard:' + entity.dominion + ':' + entity.type,
      xp,
      entity.instance
    )
  ]

  if (entity.type === 'witch' && entity.coven) {
    leaderboards.push(
      incrementSortedSet(
        'leaderboard:world:coven',
        xp,
        entity.coven
      ),
      incrementSortedSet(
        'leaderboard:' + entity.dominion + ':coven',
        xp,
        entity.coven
      )
    )
  }

  return leaderboards
}
