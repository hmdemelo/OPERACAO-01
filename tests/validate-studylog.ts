import { studyLogSchema } from "../lib/validators/studyLog"

const validData = {
    date: new Date(),
    hoursStudied: 2.5,
    questionsAnswered: 10,
    correctAnswers: 8,
    subject: "Math",
    topic: "Algebra"
}

const invalidHours = { ...validData, hoursStudied: 0 }
const invalidQuestions = { ...validData, questionsAnswered: -1 }
const invalidLogic = { ...validData, questionsAnswered: 5, correctAnswers: 6 }

console.log("Testing StudyLog Validation...")

const res1 = studyLogSchema.safeParse(validData)
console.log("Valid Data:", res1.success ? "PASS" : "FAIL")

const res2 = studyLogSchema.safeParse(invalidHours)
console.log("Invalid Hours (0):", !res2.success ? "PASS" : "FAIL")

const res3 = studyLogSchema.safeParse(invalidQuestions)
console.log("Invalid Questions (-1):", !res3.success ? "PASS" : "FAIL")

const res4 = studyLogSchema.safeParse(invalidLogic)
console.log("Invalid Logic (Correct > Total):", !res4.success ? "PASS" : "FAIL")
