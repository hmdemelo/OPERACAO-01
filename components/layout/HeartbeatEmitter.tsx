"use client"

import { useEffect } from "react"

const INTERVAL_MS = 10 * 60 * 1000 // 10 minutos

export function HeartbeatEmitter() {
    useEffect(() => {
        async function ping() {
            try {
                await fetch("/api/user/heartbeat", { method: "POST" })
            } catch {
                // silencia erros de rede — não crítico
            }
        }

        ping() // ping imediato ao montar (captura reabertura de aba)
        const id = setInterval(ping, INTERVAL_MS)
        return () => clearInterval(id)
    }, [])

    return null
}
