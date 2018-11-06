const clients = require('../database/clients')
const createRedisClients = require('./createRedisClients')

module.exports = async (key = '') => {
  const header = key.split(':')[0]

  let region
  if (key && header !== 'list' && header !== 'geohash') {
    region = key.split(':')[0]
  } else {
    region =
      process.env.NODE_ENV === 'development'
        ? 'local'
        : process.env.INSTANCE_REGION.split('/')
            .pop()
            .slice(0, -2)
  }

  if (!clients.by('region', region)) {
    await createRedisClients()
  }

  return clients.by('region', region).client
}
