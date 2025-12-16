import { io } from 'socket.io-client'

let socket

export const initSocket = () => {
  socket = io('/', { path: '/socket.io' })
  return socket
}

export const getSocket = () => socket
