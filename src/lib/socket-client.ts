"use client"

import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null
let currentRole: SocketRole | undefined


export type SocketRole = "admin" | "user"

export function connectSocket(role?: SocketRole): Socket {
  if (!socket) {
    const baseURL = typeof window !== "undefined" ? window.location.origin : ""

    socket = io(baseURL, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      timeout: 10000,
      withCredentials: false,
    })

    // Debug logs
    socket.on("connect", () => {
      console.log("[socket-client] connected:", socket?.id)
      // Re-join room after (re)connect to ensure membership persists
      if (currentRole === "admin") socket!.emit("join-admin")
      else if (currentRole === "user") socket!.emit("join-user")
    })
    socket.on("disconnect", (reason) => {
      console.log("[socket-client] disconnect:", reason)
    })
    socket.on("connect_error", (err) => {
      console.error("[socket-client] connect_error:", err.message)
    })
    socket.on("reconnect_attempt", (attempt) => {
      console.log("[socket-client] reconnect_attempt:", attempt)
    })
    socket.on("reconnect_failed", () => {
      console.warn("[socket-client] reconnect_failed")
    })
    socket.on("connect_timeout", () => {
      console.warn("[socket-client] connect_timeout")
    })
  }

  // Join room based on role
  if (role) currentRole = role

  if (role === "admin") {
    socket.emit("join-admin")
  } else if (role === "user") {
    socket.emit("join-user")
  }

  return socket
}

export function getSocket(): Socket | null {
  return socket
}
