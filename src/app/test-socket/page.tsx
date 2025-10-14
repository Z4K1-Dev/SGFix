'use client'

import { useEffect, useMemo, useState } from 'react'
import { connectSocket, getSocket } from '@/lib/socket-client'

export default function TestSocketPage() {
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [socketId, setSocketId] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null)
  const [notifs, setNotifs] = useState<Array<{ title?: string; judul?: string; message?: string; pesan?: string; ts?: number }>>([])
  const [logs, setLogs] = useState<string[]>([])

  const log = (m: string) => setLogs((l) => [new Date().toLocaleTimeString() + ' ' + m, ...l].slice(0, 200))

  useEffect(() => {
    const s = connectSocket(role)

    const onConnect = () => {
      setIsConnected(true)
      setSocketId(s.id || '')
      log(`[connect] id=${s.id}`)
    }
    const onDisconnect = (reason: any) => {
      setIsConnected(false)
      log(`[disconnect] reason=${reason}`)
    }
    const onConnectError = (err: any) => log(`[connect_error] ${err?.message}`)
    const onHeartbeat = (data: any) => {
      setLastHeartbeat(data?.ts || Date.now())
      log(`[heartbeat-response] ts=${data?.ts}`)
    }
    const onNotif = (data: any) => {
      setNotifs((n) => [{ ...data }, ...n].slice(0, 50))
      log(`[notification] ${data?.title || data?.judul}: ${data?.message || data?.pesan}`)
    }

    s.on('connect', onConnect)
    s.on('disconnect', onDisconnect)
    s.on('connect_error', onConnectError)
    s.on('heartbeat-response', onHeartbeat)
    s.on('notification', onNotif)

    return () => {
      s.off('connect', onConnect)
      s.off('disconnect', onDisconnect)
      s.off('connect_error', onConnectError)
      s.off('heartbeat-response', onHeartbeat)
      s.off('notification', onNotif)
    }
  }, [role])

  const sendHeartbeat = () => {
    const s = getSocket()
    if (s) {
      s.emit('heartbeat')
      log('[heartbeat] sent')
    }
  }

  const sendNotif = async (room: 'admin' | 'user') => {
    const title = `Ping untuk ${room}`
    const message = `Waktu: ${new Date().toLocaleTimeString()}`
    const res = await fetch('/api/test-socket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, title, message }),
    })
    const data = await res.json().catch(() => ({}))
    log(`[api] POST /api/test-socket -> ${res.status} ${JSON.stringify(data)}`)
  }

  const statusColor = isConnected ? 'text-green-600' : 'text-red-600'

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Test Socket.IO</h1>

      <div className="flex items-center gap-3">
        <label className="text-sm">Role:</label>
        <select
          value={role}
          onChange={(e) => setRole((e.target.value as 'admin' | 'user') || 'user')}
          className="border rounded px-2 py-1"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <span className={statusColor}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        <span className="text-xs text-muted-foreground">id: {socketId || '-'}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={sendHeartbeat} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Heartbeat</button>
        <button onClick={() => sendNotif('admin')} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Kirim ke Admin</button>
        <button onClick={() => sendNotif('user')} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Kirim ke User</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-medium mb-2">Terima Notifikasi</h2>
          <ul className="space-y-2">
            {notifs.map((n, i) => (
              <li key={i} className="p-2 rounded border">
                <div className="text-sm font-medium">{n.title || n.judul}</div>
                <div className="text-xs text-muted-foreground">{n.message || n.pesan}</div>
                {n.ts ? <div className="text-[10px] text-muted-foreground">{new Date(n.ts).toLocaleTimeString()}</div> : null}
              </li>
            ))}
            {notifs.length === 0 && <div className="text-sm text-muted-foreground">Belum ada notifikasi</div>}
          </ul>
        </div>
        <div>
          <h2 className="font-medium mb-2">Debug Log</h2>
          <pre className="text-[11px] leading-4 p-2 rounded border max-h-[300px] overflow-auto bg-muted/30">
            {logs.join('\n')}
          </pre>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setLogs([])} className="px-2 py-1 text-xs rounded border">Clear Log</button>
            <button onClick={() => setNotifs([])} className="px-2 py-1 text-xs rounded border">Clear Notif</button>
          </div>
        </div>
      </div>
    </div>
  )
}

