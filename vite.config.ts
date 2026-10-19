import path from "path"
import https from "node:https"
import dns from "node:dns/promises"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Resolver using Cloudflare and Google public DNS to bypass ISP sinkholing (e.g. Jio/Airtel)
const resolver = new dns.Resolver()
resolver.setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1"])

const agent = new https.Agent({
  lookup: (hostname, options, callback) => {
    resolver
      .resolve4(hostname)
      .then((addresses) => {
        if (options.all) {
          callback(
            null,
            addresses.map((a) => ({ address: a, family: 4 }))
          )
        } else {
          callback(null, addresses[0], 4)
        }
      })
      .catch(() => {
        import("node:dns").then((nativeDns) => {
          nativeDns.lookup(hostname, options, callback)
        })
      })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/tmdb": {
        target: "https://api.themoviedb.org/3",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tmdb/, ""),
        agent,
        secure: true,
      },
    },
  },
})

