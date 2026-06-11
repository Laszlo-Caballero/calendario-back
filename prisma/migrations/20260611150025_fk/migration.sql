/*
  Warnings:

  - You are about to drop the column `todoId` on the `TodoNote` table. All the data in the column will be lost.

*/
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
    "todosTodosId" INTEGER,
    CONSTRAINT "TodoNote_todosTodosId_fkey" FOREIGN KEY ("todosTodosId") REFERENCES "Todos" ("todosId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TodoNote" ("content", "createdAt", "isArchived", "isPinned", "status", "title", "todoNoteId") SELECT "content", "createdAt", "isArchived", "isPinned", "status", "title", "todoNoteId" FROM "TodoNote";
DROP TABLE "TodoNote";
ALTER TABLE "new_TodoNote" RENAME TO "TodoNote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
