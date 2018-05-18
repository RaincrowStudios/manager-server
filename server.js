'use strict'

console.log('Starting Manager Server...')

const lua = require('./lua/lua')

lua()

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
