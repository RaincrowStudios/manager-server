const clients = require('../database/clients')

module.exports = (key = '') => {
 const header = key.split(':')[0]

 let region
 if (key && header !== 'list' && header !== 'geohash') {
   region = key.split(':')[0]
 }
 else {
   region = process.env.NODE_ENV === 'development' ?
    'local' :
    process.env.INSTANCE_REGION.split('/').pop().slice(0, -2)
 }

 return clients.by('region', region).client
}
