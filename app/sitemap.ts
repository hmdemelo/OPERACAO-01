import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.operacao01.com.br'
    const lastModified = new Date()

    return [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/privacidade`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/termos`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]
}
