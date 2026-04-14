-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Calendar" (
    "calendarId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Calendar" ("calendarId", "isPublic", "name") SELECT "calendarId", "isPublic", "name" FROM "Calendar";
DROP TABLE "Calendar";
ALTER TABLE "new_Calendar" RENAME TO "Calendar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
