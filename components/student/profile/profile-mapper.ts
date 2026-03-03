import { ProfileFormValues } from "./profile-schema";

// Helper to format date string YYYY-MM-DD
export function formatDateForInput(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split('T')[0];
    } catch (e) {
        return "";
    }
}

// Maps database user object to form values
export function dbToForm(initialData: any): Partial<ProfileFormValues> {
    if (!initialData) return {};

    return {
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        cpf: initialData.cpf || "",
        birthDate: formatDateForInput(initialData.birthDate),
        educationLevel: initialData.educationLevel || "",
        dailyHours: typeof initialData.dailyHours === 'number' ? initialData.dailyHours : 0,
        addressCity: initialData.addressCity || "",
        addressState: initialData.addressState || "",
        role: initialData.role || "STUDENT",
        active: typeof initialData.active === "boolean" ? initialData.active : true,
        subjectIds: initialData.userSubjects?.map((item: any) => item.subjectId) || [],
        concursoIds: initialData.userConcursos?.map((item: any) => item.concursoId) || [],
        mentorId: initialData.studentLink?.mentorId || null,
    };
}
