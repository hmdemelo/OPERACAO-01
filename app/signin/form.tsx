"use client"

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"

export default function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (searchParams?.get("registered") === "true") {
            setSuccess("Conta criada com sucesso. Faça login.")
        }
        if (searchParams?.get("error")) {
            setError("Falha na autenticação. Verifique suas credenciais.")
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setIsLoading(true)

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            })

            if (res?.error) {
                setError("Falha na autenticação. Credenciais inválidas.")
                setIsLoading(false)
                return
            }

            if (res?.ok) {
                // Determine destination based on role
                try {
                    const sessionRes = await fetch("/api/auth/session")
                    const session = await sessionRes.json()
                    const role = session?.user?.role

                    if (role === "ADMIN") {
                        router.push("/admin/dashboard")
                    } else if (role === "STUDENT") {
                        router.push("/student/dashboard")
                    } else {
                        router.push("/")
                    }
                    router.refresh()
                } catch (error) {
                    logger.error("Session fetch error:", error)
                    router.push("/")
                    router.refresh()
                }
                // Leave isLoading true during navigation
            } else {
                setError("Ocorreu um erro desconhecido")
                setIsLoading(false)
            }
        } catch (err) {
            logger.error("Login error:", err)
            setError("Algo deu errado")
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
                <CardDescription className="text-center">
                    Insira seu e-mail e senha para acessar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent>
                {success && (
                    <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md mb-4 border border-green-200">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 border border-red-200">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="ex: usuario@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Senha</Label>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <div className="text-center text-sm w-full">
                    Ainda não possui conta?{" "}
                    <a
                        href="https://wa.me/5563992545618?text=Ola%21%20Gostaria%20de%20saber%20mais%20sobre%20a%20Operacao%2001."
                        className="underline font-medium text-primary hover:text-primary/90"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Fale com o suporte
                    </a>
                </div>
            </CardFooter>
        </Card>
    )
}
