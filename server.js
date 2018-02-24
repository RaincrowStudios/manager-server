'use strict'

console.log('Starting Creatrix Server...')

const client = require('./redis/client')
const subscriber = require('./redis/subscriber')
const manager = require('./manager/manager')
const spawner = require('./spawner/spawner')

subscriber.on('message', ((channel, message) => {
    manager(JSON.parse(message))
  })
)

subscriber.subscribe('manager')

/*const app = require('./app')
const port = process.env.PORT || 8083

const server = app.listen(port, function listening() {
  console.log('Server started at http://%s:%d', server.address().address, server.address().port)
})*/


process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
