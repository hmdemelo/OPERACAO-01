import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { redirect } from 'next/navigation'
import { StudentReportView } from '@/components/admin/StudentReportView'

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ period?: string; date?: string }>
}

export default async function StudentReportPage({ params, searchParams }: PageProps) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'MENTOR'].includes(session.user.role)) {
        redirect('/signin')
    }

    const { id } = await params
    const { period, date } = await searchParams

    const initialPeriod = period === 'month' ? 'month' : 'week'

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <StudentReportView
                userId={id}
                initialPeriod={initialPeriod}
                initialDate={date}
            />
        </div>
    )
}
