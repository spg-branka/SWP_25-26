-- CreateTable
CREATE TABLE "Tisch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Speise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "preis" REAL NOT NULL,
    "beschreibung" TEXT
);

-- CreateTable
CREATE TABLE "Allergen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Bestellung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tischId" INTEGER NOT NULL,
    "zeitpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bestellung_tischId_fkey" FOREIGN KEY ("tischId") REFERENCES "Tisch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bestellzeile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bestellungId" INTEGER NOT NULL,
    "speiseId" INTEGER NOT NULL,
    "menge" INTEGER NOT NULL,
    CONSTRAINT "Bestellzeile_bestellungId_fkey" FOREIGN KEY ("bestellungId") REFERENCES "Bestellung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bestellzeile_speiseId_fkey" FOREIGN KEY ("speiseId") REFERENCES "Speise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AllergenToSpeise" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AllergenToSpeise_A_fkey" FOREIGN KEY ("A") REFERENCES "Allergen" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AllergenToSpeise_B_fkey" FOREIGN KEY ("B") REFERENCES "Speise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_AllergenToSpeise_AB_unique" ON "_AllergenToSpeise"("A", "B");

-- CreateIndex
CREATE INDEX "_AllergenToSpeise_B_index" ON "_AllergenToSpeise"("B");
