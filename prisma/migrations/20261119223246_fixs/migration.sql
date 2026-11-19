-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todos" (
    "todosId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "parentTodosId" INTEGER,
    CONSTRAINT "Todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Todos_parentTodosId_fkey" FOREIGN KEY ("parentTodosId") REFERENCES "Todos" ("todosId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Todos" ("createdAt", "isPublic", "status", "title", "todosId", "userId") SELECT "createdAt", "isPublic", "status", "title", "todosId", "userId" FROM "Todos";
DROP TABLE "Todos";
ALTER TABLE "new_Todos" RENAME TO "Todos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
