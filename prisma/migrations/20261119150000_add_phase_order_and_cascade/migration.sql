-- AlterTable
ALTER TABLE "Todo" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Todo" ADD COLUMN "phase" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssignmentTodo" (
    "assignmentTodoId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "todoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssignmentTodo_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo" ("todoId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssignmentTodo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AssignmentTodo" ("assignmentTodoId", "createdAt", "todoId", "userId") SELECT "assignmentTodoId", "createdAt", "todoId", "userId" FROM "AssignmentTodo";
DROP TABLE "AssignmentTodo";
ALTER TABLE "new_AssignmentTodo" RENAME TO "AssignmentTodo";

CREATE TABLE "new_TodoImage" (
    "todoImageId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "todoId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    CONSTRAINT "TodoImage_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo" ("todoId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TodoImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Images" ("imageId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TodoImage" ("imageId", "todoId", "todoImageId") SELECT "imageId", "todoId", "todoImageId" FROM "TodoImage";
DROP TABLE "TodoImage";
ALTER TABLE "new_TodoImage" RENAME TO "TodoImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
