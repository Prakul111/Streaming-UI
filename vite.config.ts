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

const tmdbProxyConfig = {
  target: "https://api.tmdb.org/3",
  changeOrigin: true,
  rewrite: (path: string) => path.replace(/^\/api\/tmdb/, ""),
  agent,
  secure: true,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api/tmdb": tmdbProxyConfig,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api/tmdb": tmdbProxyConfig,
    },
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-react"
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query"
            }
            if (id.includes("framer-motion") || id.includes("motion")) {
              return "vendor-motion"
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons"
            }
          }
        },
      },
    },
  },
})
