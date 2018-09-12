const updateHashFieldObject = require('../../../redis/updateHashFieldObject')
const calculateExperience = require('../../../utils/calculateExperience')
//const addImmunity = require('./addImmunity')
//const removeImmunity = require('./removeImmunity')

module.exports = async (caster, target, spell, total, ingredients = []) => {
  const update = []
  const inform = []

  const firstCast = caster.castSpells[spell.id] ? false : true

  if (target.type !== 'spirit' && !caster.location) {
    if (
      caster.immunities &&
      Object.values(caster.immunities)
        .filter(immunity => immunity.caster === target.instance).length
    ) {
        //const [removeImmunityUpdate, removeImmunityInform] = removeImmunity(caster, target)
        //update.push(...removeImmunityUpdate)
        //inform.push(...removeImmunityInform)
    }

    //const [addImmunityUpdate, addImmunityInform] = await addImmunity(caster, target)
    //update.push(...addImmunityUpdate)
    //inform.push(...addImmunityInform)
  }

  const xpGain = await calculateExperience(
    'spell',
    firstCast,
    spell,
    caster,
    ingredients
  )

  if (total > 0 && target.type !== 'spirit') {
    update.push(
      updateHashFieldObject(
        target.instance,
        'add',
        'attackers',
        caster.instance,
        target.attackers[caster.instance] ?
          target.attackers[caster.instance] + total :
          total
      )
    )
  }
  else if (total > 0 && target.type !== 'spirit') {
    update.push(
      updateHashFieldObject(
        target.instance,
        'add',
        'benefactors',
        caster.instance,
        target.benefactors[caster.instance] ?
          target.benefactors[caster.instance] + total :
          total
      )
    )
  }

  update.push(
    updateHashFieldObject(
    caster.instance,
    'add',
    'castSpells',
    spell.id,
    firstCast ? 1 : caster.castSpells[spell.id] + 1
    )
  )

  return [xpGain, update, inform]
}
