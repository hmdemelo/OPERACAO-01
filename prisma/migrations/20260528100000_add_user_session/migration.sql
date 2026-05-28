CREATE TABLE "UserSession" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "loginAt"     TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "logoutAt"    TIMESTAMP(3),
    "lastSeenAt"  TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "durationMin" INTEGER,
    "ipAddress"   VARCHAR(45),
    "userAgent"   VARCHAR(255),

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserSession_userId_idx" ON "UserSession" ("userId");
CREATE INDEX "UserSession_loginAt_idx" ON "UserSession" ("loginAt");

ALTER TABLE "UserSession"
    ADD CONSTRAINT "UserSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
