/*
  Warnings:

  - Added the required column `from` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "expenseId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" REAL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "expenseCategoryExpenseCategoryId" INTEGER,
    "paymentMethodPaymentMethodId" INTEGER,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "from" TEXT NOT NULL,
    CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_expenseCategoryExpenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryExpenseCategoryId") REFERENCES "ExpenseCategory" ("expenseCategoryId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_paymentMethodPaymentMethodId_fkey" FOREIGN KEY ("paymentMethodPaymentMethodId") REFERENCES "PaymentMethod" ("paymentMethodId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("amount", "createdAt", "date", "expenseCategoryExpenseCategoryId", "expenseId", "paymentMethodPaymentMethodId", "quantity", "status", "title", "unitPrice", "updatedAt", "userId") SELECT "amount", "createdAt", "date", "expenseCategoryExpenseCategoryId", "expenseId", "paymentMethodPaymentMethodId", "quantity", "status", "title", "unitPrice", "updatedAt", "userId" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
