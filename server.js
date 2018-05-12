'use strict'

console.log('Starting Manager Server...')

const initializer = require('./initializer/initializer')
const lua = require('./lua/lua')
const subscriber = require('./redis/subscriber')

lua()
initializer()

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
