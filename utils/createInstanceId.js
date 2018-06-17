const uuidv1 = require('uuid/v1')

module.exports = () => {
  const region = process.env.INSTANCE_REGION.split('/').pop().slice(0, -2)

  return region + ':' + uuidv1()
}
