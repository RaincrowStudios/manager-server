const deleteAllConditions = require('../manager/conditions/deleteAllConditions')
const portalDestroy = require('../manager/portals/portalDestroy')
const spiritDeath = require('../manager/spirits/spiritDeath')
const updateHashFieldObject = require('../redis/updateHashFieldObject')

module.exports = (target, killer) => {
  const update = []
  const inform = []
  let interimUpdate, interimInform

  if (target.type === 'spirit') {
    [interimUpdate, interimInform] = spiritDeath(target, killer)

    update.push(...interimUpdate)
    inform.push(...interimInform)
  }
  else if (target.type === 'portal') {
    update.push(portalDestroy(target, killer))
  }
  else {
    if (target.conditions) {
      for (const condition of Object.values(target.conditions)) {
        update.push(
          updateHashFieldObject(
            target.instance,
            'remove',
            'conditions',
            condition.instance
          )
        )
      }
    }

    update.push(
      deleteAllConditions(target.conditions)
    )
  }

  return [update, inform]
}
