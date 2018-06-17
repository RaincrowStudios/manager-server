const uuidv1 = require('uuid/v1')

module.exports = () => {
  const region = process.env.NODE_ENV === 'development' ?
    'local' :
    process.env.INSTANCE_REGION.split('/').pop().slice(0, -2)

  const id = region + ':' + uuidv1()

  return id
}
