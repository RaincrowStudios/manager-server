'use strict'

console.log('Starting Creatrix Server...')

const client = require('./redis/client')
const manager = require('./manager/manager')
const spawner = require('./spawner/spawner')

/*const app = require('./app')
const port = process.env.PORT || 8083

const server = app.listen(port, function listening() {
  console.log('Server started at http://%s:%d', server.address().address, server.address().port)
})*/

setInterval(async () => {
  await manager()
  await spawner()
}, 1000)

process.on('unhandledRejection', (reason, location) => {
  console.log('Unhandled Rejection at:', location, 'reason:', reason)
})
