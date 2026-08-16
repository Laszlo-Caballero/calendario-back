/*
  Warnings:

  - You are about to drop the column `todosTodosId` on the `AssignmentTodo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssignmentTodo" (
    "assignmentTodoId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "todoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssignmentTodo_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo" ("todoId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssignmentTodo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AssignmentTodo" ("assignmentTodoId", "createdAt", "todoId", "userId") SELECT "assignmentTodoId", "createdAt", "todoId", "userId" FROM "AssignmentTodo";
DROP TABLE "AssignmentTodo";
ALTER TABLE "new_AssignmentTodo" RENAME TO "AssignmentTodo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
