-- Migration script to update CoachApplication and add Certificate model

-- Step 1: Add requestedCoachType to existing CoachApplication records
UPDATE "CoachApplication" 
SET "requestedCoachType" = 'EXPERIENCED' 
WHERE "requestedCoachType" IS NULL;

-- Step 2: Create Certificate table
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "certificateType" "CertificateType" NOT NULL DEFAULT 'PROFESSIONAL',
    "issuedBy" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "coachProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add foreign key constraint
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_coachProfileId_fkey" 
FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
