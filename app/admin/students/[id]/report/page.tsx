import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { StudentReportView } from '@/components/admin/StudentReportView'
import { StudentV2ReportView } from '@/components/admin/StudentV2ReportView'

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

    const user = await prisma.user.findUnique({
        where: { id },
        select: { appVersion: true },
    })

    if (user?.appVersion === 'v2') {
        return (
            <div className="max-w-5xl">
                <StudentV2ReportView userId={id} />
            </div>
        )
    }

    const initialPeriod = period === 'month' ? 'month' : 'week'

    return (
        <div className="max-w-5xl">
            <StudentReportView
                userId={id}
                initialPeriod={initialPeriod}
                initialDate={date}
            />
        </div>
    )
}
