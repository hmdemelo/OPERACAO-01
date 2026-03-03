"use client"

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { studyLogSchema, StudyLogPayload } from "@/lib/validators/studyLog"

type SubjectWithContents = {
    id: string
    name: string
    contents: { id: string; name: string }[]
}

export default function StudyLogPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")
    const [subjects, setSubjects] = useState<SubjectWithContents[]>([])
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<StudyLogPayload>({
        resolver: zodResolver(studyLogSchema) as any,
        defaultValues: {
            date: new Date(),
            hoursStudied: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            subjectId: "",
            contentId: "",
            topic: "",
        },
    })

    // Watch subjectId to filter contents provided via native select or react-hook-form handling
    const watchedSubjectId = watch("subjectId")

    useEffect(() => {
        // Update local state for content filtering when form value changes
        setSelectedSubjectId(watchedSubjectId)
    }, [watchedSubjectId])

    useEffect(() => {
        async function fetchSubjects() {
            try {
                const res = await fetch("/api/student/subjects")
                if (res.ok) {
                    const data = await res.json()
                    setSubjects(data)
                }
            } catch (e) {
                logger.error("Failed to fetch subjects", e)
            }
        }
        fetchSubjects()
    }, [])

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId)

    // Format date for input type="date"
    const formatDateForInput = (date: Date) => {
        return date.toISOString().split("T")[0]
    }

    const onSubmit = async (data: StudyLogPayload) => {
        setIsSubmitting(true)
        setSuccess("")
        setError("")

        try {
            const response = await fetch("/api/study-log", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Falha ao enviar registro")
            }

            setSuccess("Registro de estudo criado com sucesso!")
            reset({
                date: new Date(),
                hoursStudied: 0,
                questionsAnswered: 0,
                correctAnswers: 0,
                subjectId: "",
                contentId: "",
                topic: "",
            })
        } catch (err) {
            setError("Ocorreu um erro. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Registrar Estudo Diário</h1>

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                    <strong className="font-bold">Sucesso!</strong>
                    <span className="block sm:inline"> {success}</span>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md">

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data</label>
                    <input
                        type="date"
                        {...register("date", { valueAsDate: true })}
                        defaultValue={formatDateForInput(new Date())}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                </div>

                {/* Hours Studied */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Horas Estudadas</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register("hoursStudied", { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.hoursStudied && <p className="text-red-500 text-xs mt-1">{errors.hoursStudied.message}</p>}
                </div>

                {/* Questions Answered */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Questões Respondidas</label>
                    <input
                        type="number"
                        {...register("questionsAnswered", { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.questionsAnswered && <p className="text-red-500 text-xs mt-1">{errors.questionsAnswered.message}</p>}
                </div>

                {/* Correct Answers */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Respostas Corretas</label>
                    <input
                        type="number"
                        {...register("correctAnswers", { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.correctAnswers && <p className="text-red-500 text-xs mt-1">{errors.correctAnswers.message}</p>}
                </div>

                {/* Subject Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Matéria</label>
                    <select
                        {...register("subjectId")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                    >
                        <option value="">Selecione uma matéria</option>
                        {subjects.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                    {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId.message}</p>}
                </div>

                {/* Content Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Conteúdo (Opcional)</label>
                    <select
                        {...register("contentId")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                        disabled={!selectedSubjectId}
                    >
                        <option value="">Selecione o conteúdo</option>
                        {selectedSubject?.contents.map((content) => (
                            <option key={content.id} value={content.id}>
                                {content.name}
                            </option>
                        ))}
                    </select>
                    {errors.contentId && <p className="text-red-500 text-xs mt-1">{errors.contentId.message}</p>}
                </div>

                {/* Legacy/Extra Topic */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Info Adicional / Tópico (Opcional)</label>
                    <input
                        type="text"
                        {...register("topic")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        placeholder="ex: Capítulo Específico"
                    />
                    {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSubmitting ? "Enviando..." : "Registrar Sessão"}
                </button>
            </form>
        </div>
    )
}
