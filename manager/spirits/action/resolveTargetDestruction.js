const spiritDeath = require('../spiritDeath')
const portalDestroy = require('../../portals/portalDestroy')

module.exports = (targetInstance, target, instance) => {
  if (target.type === 'spirit') {
    spiritDeath(targetInstance, target, instance)
  }
  else if (target.type === 'portal') {

  }
  else {
    
  }
  //portalDestroy(targetInstance, target, instance)
}
