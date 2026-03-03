"use client"

import { Suspense } from "react"
import LoginForm from "./form"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 gap-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 text-center">
                OPERAÇÃO 01<span className="animate-pulse text-orange-500 ml-1">|</span>
            </h1>
            <Suspense fallback={<div>Carregando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
