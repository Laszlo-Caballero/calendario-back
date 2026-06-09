/*
  Warnings:

  - You are about to drop the column `date` on the `Debts` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Debts" (
    "debtId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maxMothlyPayment" REAL NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "paidInstallments" INTEGER NOT NULL DEFAULT 0,
    "payment" REAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Debts" ("createdAt", "debtId", "description", "endDate", "maxMothlyPayment", "paidInstallments", "payment", "startDate", "status", "title", "totalInstallments", "updatedAt", "userId") SELECT "createdAt", "debtId", "description", "endDate", "maxMothlyPayment", "paidInstallments", "payment", "startDate", "status", "title", "totalInstallments", "updatedAt", "userId" FROM "Debts";
DROP TABLE "Debts";
ALTER TABLE "new_Debts" RENAME TO "Debts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
