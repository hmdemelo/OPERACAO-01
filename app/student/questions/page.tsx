import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import QuestionBankSection from "@/components/student/QuestionBankSection"
import { QuestionUploadFAB } from "@/components/QuestionUploadFAB"

export default async function StudentQuestionsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return <div>Acesso negado</div>
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Banco de Questões</h1>
            <QuestionBankSection />
            <QuestionUploadFAB />
        </div>
    )
}
