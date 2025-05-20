import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'force-security-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Force headers for all responses in dev mode
          res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' http://localhost:5173 'sha256-NEZvGkT0ZWP6XHdKYM4B1laRPcM6Lw4LJfkDtIEVAKc='; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:3000 http://localhost:3000; object-src 'none'"
          )
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
          res.setHeader('X-Content-Type-Options', 'nosniff')
          res.setHeader('X-Frame-Options', 'DENY')
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
          res.setHeader('Cache-Control', 'no-cache')
          next()
        }, { force: true }) // Ensure middleware runs for all responses
      },
    },
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/proxy': 'http://localhost:3000',
    },
    headers: {
      'Server': 'LilAPI UI',
      'X-Powered-By': 'Monster Energy',
    },
  },
})