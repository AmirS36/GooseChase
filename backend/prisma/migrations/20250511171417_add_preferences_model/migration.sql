/*
  Warnings:

  - You are about to drop the column `allowExplicit` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `avgBPM` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `likesHipHop` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `likesPop` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `prefersHappy` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Preference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "likesHipHop" REAL NOT NULL DEFAULT 0,
    "likesPop" REAL NOT NULL DEFAULT 0,
    "prefersHappy" REAL NOT NULL DEFAULT 0,
    "avgBPM" REAL NOT NULL DEFAULT 0,
    "allowExplicit" BOOLEAN NOT NULL DEFAULT false
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "preferenceId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preference" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "id", "password", "updatedAt", "username") SELECT "createdAt", "id", "password", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_preferenceId_key" ON "User"("preferenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
