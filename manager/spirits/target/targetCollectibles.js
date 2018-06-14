module.exports = (spirit, nearTargets, type) => {
  let target
  let nearCollectibles = nearTargets
    .filter(target => (
      target.type === 'gem' ||
      target.type === 'herb' ||
      target.type === 'tool' ||
      target.type === 'silver'
    ))

  if (type) {
    nearCollectibles = nearCollectibles
      .filter(collectible => {
        if (
          collectible.id === type ||
          collectible.type === type
        ) {
          return collectible
        }
      })
  }

  if (nearCollectibles.length) {
    target = nearCollectibles[
      Math.floor(Math.random() * nearCollectibles.length)
    ]
  }

  if (target) {
    return target
  }

  return false
}
