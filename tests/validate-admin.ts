import { getWeeklyStudentPerformance } from "../lib/metrics/adminMetrics"
import { prisma } from "../lib/db"

async function main() {
    console.log("Validating Admin Metrics...")

    // Ensure there is at least one student to test with
    // If not, creates a dummy student and some logs.

    const studentEmail = "test-student@example.com"
    let student = await prisma.user.findUnique({ where: { email: studentEmail } })

    if (!student) {
        console.log("Creating test student...")
        student = await prisma.user.create({
            data: {
                email: studentEmail,
                name: "Test Student",
                passwordHash: "dummy",
                role: "STUDENT",
            },
        })

        // Create some logs for this student
        await prisma.studyLog.createMany({
            data: [
                {
                    userId: student.id,
                    date: new Date(),
                    hoursStudied: 2,
                    questionsAnswered: 50,
                    correctAnswers: 40,
                    subject: "Math",
                },
                {
                    userId: student.id,
                    date: new Date(),
                    hoursStudied: 1.5,
                    questionsAnswered: 30,
                    correctAnswers: 20,
                    subject: "Physics",
                },
            ],
        })
    }

    const performance = await getWeeklyStudentPerformance()
    console.log("Admin Dashboard Data:", JSON.stringify(performance, null, 2))

    if (performance.length > 0) {
        const testStudentStats = performance.find(p => p.id === student!.id)
        if (testStudentStats) {
            console.log("Test Student Found:", testStudentStats)
            if (testStudentStats.totalQuestions === 80) {
                console.log("PASS: Total Questions Correct")
            } else {
                console.log("FAIL: Total Questions Mismatch")
            }
        } else {
            console.log("WARN: Test student not found in performance list (maybe date range issue?)")
        }
    } else {
        console.log("FAIL: No student performance data returned")
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
