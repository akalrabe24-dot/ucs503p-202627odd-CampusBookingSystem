import { Buffer } from 'node:buffer'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function isPublishableKey(key: string) {
  if (key.startsWith('sb_publishable_')) return true
  const segments = key.split('.')
  if (segments.length !== 3) return false
  try {
    const payload = JSON.parse(Buffer.from(segments[1], 'base64url').toString('utf8'))
    return payload.role === 'anon'
  } catch {
    return false
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_SUPABASE_')
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (key && !isPublishableKey(key)) {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY must contain a Supabase publishable key or legacy anon key.')
  }
  return {
    plugins: [react()],
    base: '/ucs503p-202627odd-CampusBookingSystem/',
  }
})
