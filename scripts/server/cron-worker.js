#!/usr/bin/env node
/**
 * Move to AI — Worker cron quotidien
 * Exécuté par PM2 (ecosystem.config.js) chaque jour à 08h00.
 * Appelle les endpoints /api/cron/* de l'application en local.
 *
 * PM2 config :
 *   cron_restart: '0 8 * * *'
 *   exec_mode: 'fork'
 *   instances: 1
 */

const http = require('http')

const CRON_SECRET = process.env.CRON_SECRET || ''
const PORT        = process.env.PORT         || 3000
const BASE_URL    = `http://127.0.0.1:${PORT}`

// ── Jobs à exécuter dans l'ordre ─────────────────────────
const JOBS = [
  {
    path:        '/api/cron/certifications',
    description: 'Alertes expiration certifications (J-90, J-30, J=0)',
  },
  // Ajouter ici les futurs jobs cron :
  // { path: '/api/cron/ai-readiness',  description: 'Recalcul scores IA' },
  // { path: '/api/cron/quality-check', description: 'Vérification Knowledge Core' },
]

// ── Utilitaire : appel HTTP interne ───────────────────────
function callCron(job) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port:     PORT,
      path:     job.path,
      method:   'GET',
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
        'User-Agent':   'movetoai-cron-worker/1.0',
      },
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        const result = { status: res.statusCode, body }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(result)
        } else {
          reject(new Error(`HTTP ${res.statusCode} : ${body.slice(0, 200)}`))
        }
      })
    })

    req.setTimeout(30_000, () => {
      req.destroy()
      reject(new Error(`Timeout après 30s sur ${job.path}`))
    })

    req.on('error', reject)
    req.end()
  })
}

// ── Attendre que l'app soit prête ─────────────────────────
async function waitForApp(maxWaitMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    try {
      await callCron({ path: '/api/health' })
      return true
    } catch {
      await new Promise((r) => setTimeout(r, 2_000))
    }
  }
  return false
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  const startTime = new Date()
  console.log(`[CRON] ════ Démarrage des jobs quotidiens ════`)
  console.log(`[CRON] Date     : ${startTime.toISOString()}`)
  console.log(`[CRON] Endpoint : ${BASE_URL}`)
  console.log(`[CRON] Jobs     : ${JOBS.length}`)
  console.log('')

  // Attendre que Next.js soit disponible (PM2 peut démarrer le worker avant l'app)
  console.log('[CRON] Attente de l\'application...')
  const appReady = await waitForApp()
  if (!appReady) {
    console.error('[CRON] ✗ Application non disponible après 60s — abandon')
    process.exit(1)
  }
  console.log('[CRON] ✓ Application prête')
  console.log('')

  const results = []

  for (const job of JOBS) {
    const jobStart = Date.now()
    console.log(`[CRON] → ${job.description}`)
    console.log(`[CRON]   ${job.path}`)

    try {
      const result = await callCron(job)
      const duration = Date.now() - jobStart
      let parsed = {}
      try { parsed = JSON.parse(result.body) } catch { /* pas de JSON */ }

      console.log(`[CRON] ✓ HTTP ${result.status} en ${duration}ms`)
      if (parsed && typeof parsed === 'object') {
        const summary = Object.entries(parsed)
          .filter(([k]) => k !== 'ok')
          .map(([k, v]) => `${k}=${v}`)
          .join(' · ')
        if (summary) console.log(`[CRON]   ${summary}`)
      }
      results.push({ job: job.path, success: true, duration, status: result.status })
    } catch (err) {
      const duration = Date.now() - jobStart
      console.error(`[CRON] ✗ ${err.message} (${duration}ms)`)
      results.push({ job: job.path, success: false, duration, error: err.message })
    }

    console.log('')
  }

  // Résumé
  const totalDuration = Date.now() - startTime.getTime()
  const ok      = results.filter((r) => r.success).length
  const failed  = results.filter((r) => !r.success).length

  console.log('[CRON] ════ Résumé ════')
  console.log(`[CRON] Succès  : ${ok}/${JOBS.length}`)
  if (failed > 0) {
    console.log(`[CRON] Échecs  : ${failed}`)
    results.filter((r) => !r.success).forEach((r) => {
      console.log(`[CRON]   ✗ ${r.job} : ${r.error}`)
    })
  }
  console.log(`[CRON] Durée   : ${totalDuration}ms`)
  console.log(`[CRON] Fin     : ${new Date().toISOString()}`)

  // Sortir avec un code d'erreur si des jobs ont échoué (PM2 logguera l'erreur)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('[CRON] Erreur fatale :', err.message)
  process.exit(1)
})
