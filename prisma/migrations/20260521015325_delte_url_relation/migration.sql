/*
  Warnings:

  - You are about to drop the column `url` on the `TodoImage` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TodoImage" (
    "todoImageId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "todoId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    CONSTRAINT "TodoImage_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo" ("todoId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TodoImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Images" ("imageId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TodoImage" ("imageId", "todoId", "todoImageId") SELECT "imageId", "todoId", "todoImageId" FROM "TodoImage";
DROP TABLE "TodoImage";
ALTER TABLE "new_TodoImage" RENAME TO "TodoImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
