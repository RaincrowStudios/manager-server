'use strict'

const net = require('net')
const production = require('./config/production')
const initializer = require('./initializer/initializer')
const manager = require('./manager/manager')
const createRedisClients = require('./redis/createRedisClients')
const createRedisSubscribers = require('./redis/createRedisSubscribers')
const port = process.env.NODE_ENV === 'development' ? 8082 : production.port

async function startup() {
  console.log('Starting Manager...')
  await Promise.all([
    createRedisClients(),
    createRedisSubscribers()
  ])
  //initializer()
}

startup()

const server = net.createServer(socket => {
  socket.on('data', data => {
    console.log('here')
    manager(JSON.parse(data))
  })

  socket.on('error', err => {
    console.error(err)
  })
})

server.listen(port)

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
