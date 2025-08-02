-- CreateTable
CREATE TABLE "TeamScore" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "TeamScore_pkey" PRIMARY KEY ("id")
);
