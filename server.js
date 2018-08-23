'use strict'

const net = require('net')
const production = require('./config/production')
const initializer = require('./initializer/initializer')
const manager = require('./manager/manager')
const createRedisClients = require('./redis/createRedisClients')
const createRedisSubscribers = require('./redis/createRedisSubscribers')
const port = process.env.NODE_ENV === 'development' ? 8082 : production.port

async function startup() {
  console.log('Starting manager server...')
  await Promise.all([
    createRedisClients(),
    createRedisSubscribers()
  ])
  initializer()
}

startup()

const server = net.createServer(socket => {
  socket.on('data', data => {
    console.log(data)
    manager(JSON.parse(data))
  })

  socket.on('error', err => {
    if (err.code !== 'ECONNRESET') {
      console.error(err)
    }
  })
})

server.listen(port, () => {
  console.log('Manager server started.')
})

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
