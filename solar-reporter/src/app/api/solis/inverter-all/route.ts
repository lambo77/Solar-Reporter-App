import { NextRequest, NextResponse } from 'next/server'
import { buildSolisHeaders } from '@/lib/solis/auth'

const BASE_URL = process.env.SOLIS_BASE_URL!
const API_ID = process.env.SOLIS_API_ID!
const API_SECRET = process.env.SOLIS_API_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.json()
  const path = '/v1/api/inverterAll'

  const headers = buildSolisHeaders(path, body, API_ID, API_SECRET)

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok || data.code !== '0') {
    return NextResponse.json(
      { error: data.msg ?? 'SolisCloud error', code: data.code },
      { status: 502 }
    )
  }

  return NextResponse.json(data.data)
}
