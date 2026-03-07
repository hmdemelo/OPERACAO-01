export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6">
            <div className="text-center max-w-md space-y-6">
                <div className="text-7xl">🛠️</div>
                <h1 className="text-3xl font-bold tracking-tight">Sistema em Manutenção</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    Estamos realizando melhorias para oferecer a melhor experiência possível.
                    Voltaremos em breve!
                </p>
                <p className="text-sm text-muted-foreground opacity-60">
                    Se você é administrador, acesse o sistema normalmente pelo login.
                </p>
                <a
                    href="/signin"
                    className="inline-block text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    Ir para o Login
                </a>
            </div>
        </div>
    )
}
