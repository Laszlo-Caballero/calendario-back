-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DebtPayment" (
    "debtPaymentId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "debtId" INTEGER NOT NULL,
    "subscriber" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DebtPayment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debts" ("debtId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DebtPayment" ("amount", "date", "debtId", "debtPaymentId") SELECT "amount", "date", "debtId", "debtPaymentId" FROM "DebtPayment";
DROP TABLE "DebtPayment";
ALTER TABLE "new_DebtPayment" RENAME TO "DebtPayment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
