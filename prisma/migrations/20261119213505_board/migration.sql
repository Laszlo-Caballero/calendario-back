-- CreateTable
CREATE TABLE "BoardDoc" (
    "boardDocId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL DEFAULT 'Hoja de Planificación & Tareas',
    "subtitle" TEXT DEFAULT '',
    "content" TEXT NOT NULL,
    "todosId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BoardDoc_todosId_fkey" FOREIGN KEY ("todosId") REFERENCES "Todos" ("todosId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardDoc_todosId_key" ON "BoardDoc"("todosId");
