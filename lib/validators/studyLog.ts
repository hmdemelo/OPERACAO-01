import { z } from "zod"

export const studyLogSchema = z.object({
    date: z.coerce.date(),
    hoursStudied: z
        .number()
        .gt(0, "Horas estudadas deve ser maior que 0"),
    questionsAnswered: z
        .number()
        .min(0, "Qtd. de questões não pode ser negativa")
        .int("Qtd. de questões deve ser um número inteiro"),
    correctAnswers: z.number().int().min(0, "Respostas corretas devem ser 0 ou mais"),
    subjectId: z.string().min(1, "Matéria é obrigatória"),
    contentId: z.string().optional(),
    topic: z.string().optional(), // Keeping topic for legacy or extra detail
}).refine((data) => data.correctAnswers <= data.questionsAnswered, {
    message: "Respostas corretas não podem exceder questões respondidas",
    path: ["correctAnswers"],
})

export type StudyLogPayload = z.infer<typeof studyLogSchema>
