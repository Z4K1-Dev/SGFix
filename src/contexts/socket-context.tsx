'use client'

import { createContext } from 'react'
import { Socket } from 'socket.io-client'

// Create context for global socket
export const SocketContext = createContext<Socket | null>(null)