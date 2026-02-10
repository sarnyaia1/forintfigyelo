import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://havikiadas.hu'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/auth', '/test-connection'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
