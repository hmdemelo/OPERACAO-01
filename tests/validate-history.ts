import { getStudyHistory } from "../lib/metrics/studentMetrics"
import { prisma } from "../lib/db"

async function main() {
    console.log("Validating Study History...")

    // Use the same admin user or test user
    const adminEmail = "admin@operacao01.com"
    const user = await prisma.user.findUnique({ where: { email: adminEmail } })

    if (!user) {
        console.error("User not found.")
        return
    }

    // 1. Fetch All
    console.log("--- Fetching All Logs ---")
    const allLogs = await getStudyHistory(user.id)
    console.log(`Found ${allLogs.length} logs.`)

    // 2. Filter by Subject (if any logs exist)
    if (allLogs.length > 0) {
        const subject = allLogs[0].subject
        console.log(`--- Filtering by Subject: ${subject} ---`)
        const filteredLogs = await getStudyHistory(user.id, { subject })
        console.log(`Found ${filteredLogs.length} logs for subject '${subject}'.`)

        const isCorrect = filteredLogs.every(l => l.subject.includes(subject))
        console.log("Filter Logic:", isCorrect ? "PASS" : "FAIL")
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
