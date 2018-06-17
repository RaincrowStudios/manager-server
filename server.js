'use strict'

const net = require('net')
const initializer = require('./initializer/initializer')
const manager = require('./manager/manager')
const createClients = require('./redis/createClients')
const createSubscribers = require('./redis/createSubscribers')
const port = process.env.NODE_ENV === 'development' ? 8082 : 80

async function startup() {
  await createClients()
  await createSubscribers()
  //initializer()
}

//startup()

const server = net.createServer(socket => {
  socket.on('data', data => {
    //manager(JSON.parse(data))
  })

  socket.on('error', err => {
    console.error(err)
  })
})

server.listen(port)

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
