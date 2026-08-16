/*
  Warnings:

  - You are about to drop the column `assigmentUserId` on the `Todo` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "AssignmentTodo" (
    "assignmentTodoId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "todoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "todosTodosId" INTEGER,
    CONSTRAINT "AssignmentTodo_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo" ("todoId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssignmentTodo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssignmentTodo_todosTodosId_fkey" FOREIGN KEY ("todosTodosId") REFERENCES "Todos" ("todosId") ON DELETE SET NULL ON UPDATE CASCADE
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
    "createById" INTEGER,
    CONSTRAINT "Todo_todosId_fkey" FOREIGN KEY ("todosId") REFERENCES "Todos" ("todosId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Todo_createById_fkey" FOREIGN KEY ("createById") REFERENCES "User" ("userId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("completedAt", "description", "hourNotification", "importance", "isArchived", "pinned", "status", "title", "todoId", "todosId") SELECT "completedAt", "description", "hourNotification", "importance", "isArchived", "pinned", "status", "title", "todoId", "todosId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
