/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      { source: '/mailbox', destination: '/admin/mailbox/', permanent: true },
      { source: '/mailbox/', destination: '/admin/mailbox/', permanent: true },
      { source: '/account/mailbox', destination: '/admin/mailbox/', permanent: true },
      { source: '/account/mailbox/', destination: '/admin/mailbox/', permanent: true },
      { source: '/admin/studio/beheer', destination: '/studio/inschrijvingen/', permanent: true },
      { source: '/admin/studio/beheer/', destination: '/studio/inschrijvingen/', permanent: true },
      { source: '/studio/beheer', destination: '/studio/inschrijvingen/', permanent: true },
      { source: '/studio/beheer/', destination: '/studio/inschrijvingen/', permanent: true },
      { source: '/launchpad', destination: '/admin/dashboard/', permanent: true },
      { source: '/launchpad/', destination: '/admin/dashboard/', permanent: true },
      { source: '/studio/launchpad', destination: '/admin/dashboard/', permanent: true },
      { source: '/studio/launchpad/', destination: '/admin/dashboard/', permanent: true }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/wp-json/voices/v2/translations/',
        destination: '/api/translations/',
      },
      {
        source: '/voicy.png',
        destination: '/assets/common/branding/voicy/voicy-avatar.png',
      },
    ];
  },
  // Skip linting during build to speed up
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.voices.be',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'vcbxyyjsxuquytcsskpj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/translations/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        source: '/api/translations/',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self "https://meet.ffmuc.net"), microphone=(self "https://meet.ffmuc.net"), geolocation=(), interest-cohort=()'
          }
        ]
      },
      {
        source: '/assets/agency/voices/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
