/*
  Warnings:

  - Added the required column `createdBy` to the `TodoNote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Todos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "TodosAsigment" (
    "todosAsigmentId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "todosId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "TodosAsigment_todosId_fkey" FOREIGN KEY ("todosId") REFERENCES "Todos" ("todosId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TodosAsigment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "assigmentUserId" INTEGER,
    CONSTRAINT "Todo_todosId_fkey" FOREIGN KEY ("todosId") REFERENCES "Todos" ("todosId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Todo_assigmentUserId_fkey" FOREIGN KEY ("assigmentUserId") REFERENCES "User" ("userId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("completedAt", "description", "hourNotification", "importance", "isArchived", "pinned", "status", "title", "todoId", "todosId") SELECT "completedAt", "description", "hourNotification", "importance", "isArchived", "pinned", "status", "title", "todoId", "todosId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
CREATE TABLE "new_TodoNote" (
    "todoNoteId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "todosTodosId" INTEGER,
    CONSTRAINT "TodoNote_todosTodosId_fkey" FOREIGN KEY ("todosTodosId") REFERENCES "Todos" ("todosId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TodoNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TodoNote" ("content", "createdAt", "isArchived", "isPinned", "status", "title", "todoNoteId", "todosTodosId") SELECT "content", "createdAt", "isArchived", "isPinned", "status", "title", "todoNoteId", "todosTodosId" FROM "TodoNote";
DROP TABLE "TodoNote";
ALTER TABLE "new_TodoNote" RENAME TO "TodoNote";
CREATE TABLE "new_Todos" (
    "todosId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Todos" ("isPublic", "status", "title", "todosId") SELECT "isPublic", "status", "title", "todosId" FROM "Todos";
DROP TABLE "Todos";
ALTER TABLE "new_Todos" RENAME TO "Todos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
