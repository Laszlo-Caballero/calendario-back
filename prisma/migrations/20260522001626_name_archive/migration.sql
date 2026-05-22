-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Archives" (
    "archiveId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "folderId" INTEGER,
    CONSTRAINT "Archives_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("folderId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Archives" ("archiveId", "createdAt", "folderId", "public_id", "type", "url") SELECT "archiveId", "createdAt", "folderId", "public_id", "type", "url" FROM "Archives";
DROP TABLE "Archives";
ALTER TABLE "new_Archives" RENAME TO "Archives";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
