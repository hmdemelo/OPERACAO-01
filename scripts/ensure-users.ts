
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@operacao01.com';
    const userEmail = 'kelson@gmail.com';
    const adminPass = 'admin123';
    const userPass = 'a102030s';

    // Ensure Admin Exists
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
        console.log(`Creating Admin: ${adminEmail}`);
        const hashPass = await hash(adminPass, 12);
        admin = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: adminEmail,
                passwordHash: hashPass,
                role: 'ADMIN',
                active: true
            }
        });
    } else {
        console.log(`Admin exists: ${admin.id}`);
    }

    // Ensure User Exists
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
        console.log(`Creating User: ${userEmail}`);
        const hashPass = await hash(userPass, 12);
        user = await prisma.user.create({
            data: {
                name: 'Kelson User',
                email: userEmail,
                passwordHash: hashPass,
                role: 'STUDENT',
                active: true
            }
        });
    } else {
        console.log(`User exists: ${user.id}`);

        // Check for existing Plan/Logs
        const plans = await prisma.weeklyPlan.count({ where: { userId: user.id } });
        const logs = await prisma.studyLog.count({ where: { userId: user.id } });
        console.log(`User has ${plans} plans and ${logs} study logs.`);

        // Clean up for fresh test?
        // Maybe better to NOT destroy data unless explicitly asked. The prompt implied verifying *new* actions.
        // But Step 1 is "Create NEW WeeklyPlan".
        // I will delete plans for NEXT week to ensure clean slate for the test?
        // Or just let the admin create one.
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
