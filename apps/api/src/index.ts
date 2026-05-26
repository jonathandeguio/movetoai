import { serve } from "@hono/node-server"
import { createApp } from "./app.js"

const app = createApp()
const port = Number(process.env.API_PORT ?? 4001)

serve({ fetch: app.fetch, port }, () => {
  console.log(`API server running on http://localhost:${port}`)
})
