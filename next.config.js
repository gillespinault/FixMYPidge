const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Docker deployment
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development',
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    MAPBOX_API_TOKEN: process.env.MAPBOX_API_TOKEN,
  },
};

module.exports = withPWA(nextConfig);