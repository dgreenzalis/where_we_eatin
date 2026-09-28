import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites under /<repo>/, so built asset URLs need
  // that prefix. A user site (dgreenzalis.github.io) would drop this entirely.
  base: '/where_we_eatin/',
  server: {
    // Listen on all interfaces so phones/laptops on the home LAN can connect.
    host: true,
    port: 5173,
    strictPort: true,
    // Vite rejects unknown Host headers to guard against DNS rebinding.
    // Plain IPs are allowed already; this adds mDNS names such as
    // Davids-MacBook-Pro.local. A leading dot matches all .local subdomains,
    // so this keeps working if the Mac gets renamed.
    allowedHosts: ['.local'],
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['.local'],
  },
})
