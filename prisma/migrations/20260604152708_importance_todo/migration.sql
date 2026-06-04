-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "todoId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "todosId" INTEGER NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "hourNotification" DATETIME,
    "importance" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Todo_todosId_fkey" FOREIGN KEY ("todosId") REFERENCES "Todos" ("todosId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("completedAt", "description", "hourNotification", "isArchived", "pinned", "status", "title", "todoId", "todosId") SELECT "completedAt", "description", "hourNotification", "isArchived", "pinned", "status", "title", "todoId", "todosId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
