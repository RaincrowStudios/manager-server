const clients = require('../database/clients')

module.exports = (key = '') => {
 let region

 if (key) {
   region = key.split(':')[0]
 }
 else {
   region = process.env.INSTANCE_REGION === 'local' ?
    'local' :
    process.env.INSTANCE_REGION.split('/').pop().slice(0, -2)
 }

 return clients.by('region', region)
}
