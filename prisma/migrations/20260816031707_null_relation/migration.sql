-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TodoNote" (
    "todoNoteId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "todosTodosId" INTEGER,
    CONSTRAINT "TodoNote_todosTodosId_fkey" FOREIGN KEY ("todosTodosId") REFERENCES "Todos" ("todosId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TodoNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("userId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TodoNote" ("content", "createdAt", "createdBy", "isArchived", "isPinned", "status", "title", "todoNoteId", "todosTodosId") SELECT "content", "createdAt", "createdBy", "isArchived", "isPinned", "status", "title", "todoNoteId", "todosTodosId" FROM "TodoNote";
DROP TABLE "TodoNote";
ALTER TABLE "new_TodoNote" RENAME TO "TodoNote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
