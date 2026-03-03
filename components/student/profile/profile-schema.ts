import * as z from "zod"

export const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
    email: z.string().email(),
    phone: z.string().optional().nullable(),
    cpf: z.string().optional().nullable(),
    birthDate: z.string().optional().nullable(), // YYYY-MM-DD
    targetExam: z.string().optional().nullable(),
    educationLevel: z.string().optional().nullable(),
    dailyHours: z.coerce.number().int().min(0).max(24).optional().nullable(),
    addressCity: z.string().optional().nullable(),
    addressState: z.string().max(2, "Sigla do estado (UF)").optional().nullable(),
    role: z.enum(["ADMIN", "MENTOR", "STUDENT"]).default("STUDENT").optional(),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
    active: z.boolean().optional(),
    subjectIds: z.array(z.string()).optional(),
    concursoIds: z.array(z.string()).optional(),
    mentorId: z.string().optional().nullable(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
