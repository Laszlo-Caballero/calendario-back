-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Images" (
    "imageId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL DEFAULT 'Untitled'
);
INSERT INTO "new_Images" ("imageId", "url") SELECT "imageId", "url" FROM "Images";
DROP TABLE "Images";
ALTER TABLE "new_Images" RENAME TO "Images";
CREATE TABLE "new_Schedule" (
    "scheduleId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "color" TEXT NOT NULL,
    "calendarId" INTEGER,
    "imageId" INTEGER,
    CONSTRAINT "Schedule_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar" ("calendarId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Schedule_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Images" ("imageId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Schedule" ("calendarId", "color", "date", "description", "endTime", "scheduleId", "startTime", "title") SELECT "calendarId", "color", "date", "description", "endTime", "scheduleId", "startTime", "title" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
