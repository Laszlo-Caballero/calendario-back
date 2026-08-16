-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TodosAsigment" (
    "todosAsigmentId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "todosId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TodosAsigment_todosId_fkey" FOREIGN KEY ("todosId") REFERENCES "Todos" ("todosId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TodosAsigment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TodosAsigment" ("todosAsigmentId", "todosId", "userId") SELECT "todosAsigmentId", "todosId", "userId" FROM "TodosAsigment";
DROP TABLE "TodosAsigment";
ALTER TABLE "new_TodosAsigment" RENAME TO "TodosAsigment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
