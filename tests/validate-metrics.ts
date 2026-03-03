import { getWeeklySummary, getDailyProgress, getSubjectDistribution } from "../lib/metrics/studentMetrics"
import { prisma } from "../lib/db"

async function main() {
    console.log("Validating Metrics Logic...")

    // Mock user ID (replace with a real one if testing against live DB, but for now we just want to ensure functions don't crash)
    // To truly test, we'd need to seed a user and logs.
    // For this step, I'll just run the functions against the existing admin user to ensure no runtime errors.

    const adminEmail = "admin@operacao01.com"
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } })

    if (!admin) {
        console.error("Admin user not found. Run seed script first.")
        return
    }

    console.log(`Testing metrics for user: ${admin.id}`)

    try {
        const weekly = await getWeeklySummary(admin.id)
        console.log("Weekly Summary:", weekly)

        const daily = await getDailyProgress(admin.id)
        console.log("Daily Progress:", daily)

        const subjects = await getSubjectDistribution(admin.id)
        console.log("Subject Distribution:", subjects)

        console.log("Metrics functions executed successfully.")
    } catch (error) {
        console.error("Error executing metrics functions:", error)
        process.exit(1)
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
