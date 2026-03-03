import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-2xl font-bold">Página Não Encontrada</h2>
            <p className="text-muted-foreground">Não conseguimos encontrar o recurso solicitado.</p>
            <Link href="/" className="text-primary hover:underline">
                Voltar para o Início
            </Link>
        </div>
    )
}
