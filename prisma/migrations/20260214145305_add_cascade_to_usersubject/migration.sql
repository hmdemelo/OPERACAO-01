-- DropForeignKey
ALTER TABLE "UserSubject" DROP CONSTRAINT "UserSubject_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserSubject" ADD CONSTRAINT "UserSubject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
