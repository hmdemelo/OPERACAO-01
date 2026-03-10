import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/student/',
                '/api/',
                '/signin',
                '/register',
                '/maintenance',
            ],
        },
        sitemap: 'https://www.operacao01.com.br/sitemap.xml',
    }
}
