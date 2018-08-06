const deleteAllConditions = require('../manager/conditions/deleteAllConditions')
const portalDestroy = require('../manager/portals/portalDestroy')
const spiritDeath = require('../manager/spirits/spiritDeath')
const updateHashFieldArray = require('../redis/updateHashFieldArray')

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
      for (let i = 0; i < target.conditions.length; i++) {
        update.push(
          updateHashFieldArray(
            target.instance,
            'remove',
            'conditions',
            target.conditions[i],
            i
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
