import { NextResponse } from "next/server"

// POST /api/user/heartbeat
// Desativado: Retorna 204 No Content imediatamente para evitar qualquer sobrecarga no banco de dados.
export async function POST() {
    return new NextResponse(null, { status: 204 })
}
