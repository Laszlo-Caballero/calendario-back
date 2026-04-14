-- CreateTable
CREATE TABLE "Todos" (
    "todosId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Todo" (
    "todoId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "todosId" INTEGER NOT NULL,
    CONSTRAINT "Todo_todosId_fkey" FOREIGN KEY ("todosId") REFERENCES "Todos" ("todosId") ON DELETE RESTRICT ON UPDATE CASCADE
);
