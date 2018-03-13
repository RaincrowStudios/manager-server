'use strict'

console.log('Starting Manager Server...')

const lua = require('./lua')
const subscriber = require('./redis/subscriber')
const initializer = require('./initializer/initializer')
const clearTimers = require('./utils/clearTimers')

subscriber.on('message', ((channel, message) => {
    const { command, instance } = JSON.parse(message)
    switch (command) {
      case 'clear':
        clearTimers(instance)
        break
      case 'condition':
        conditionAdd(instance)
        break
      case 'portal':
        portalAdd(instance)
        break
      case 'spirit':
        spiritAdd(instance)
        break
      default:
        break
    }
  })
)

subscriber.subscribe('manager')

/*const app = require('./app')
const port = process.env.PORT || 8083

const server = app.listen(port, function listening() {
  console.log('Server started at http://%s:%d', server.address().address, server.address().port)
})*/

lua()

initializer()

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
