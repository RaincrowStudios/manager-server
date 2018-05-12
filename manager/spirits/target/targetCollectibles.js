module.exports = (spirit, nearTargets, targetCategory) => {
  let target
  let nearCollectibles = nearTargets
    .filter(target => (
      target.type === 'gem' ||
      target.type === 'herb' ||
      target.type === 'tool' ||
      target.type === 'silver'
    ))

  if (targetCategory) {
    nearCollectibles = nearCollectibles
      .filter(collectible => {
        if (
          collectible.id === targetCategory ||
          collectible.type === targetCategory
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
