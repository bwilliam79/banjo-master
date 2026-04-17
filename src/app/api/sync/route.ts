import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

const DATA_DIR = process.env.DATA_DIR || '/data'
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json')

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

export async function GET() {
  try {
    if (!existsSync(PROGRESS_FILE)) {
      return NextResponse.json({ progress: null, sessions: null })
    }
    const data = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ progress: null, sessions: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureDir()
    const body = await req.json()
    writeFileSync(PROGRESS_FILE, JSON.stringify(body), 'utf8')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
