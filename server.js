'use strict'

console.log('Starting Manager Server...')

const initializer = require('./initializer')
const lua = require('./lua')
const subscriber = require('./redis/subscriber')

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
