# Praktische Leistungsfeststellung 5AHWII

## Datenmodellierung Bibliothek

**Sie sollen für eine öffentliche Bibliothek ein Datenmodell entwerfen, um den Bestand und den Verleihvorgang digital zu erfassen.**

Wichtig sind die

- **Bücher:** Titel, ISBN (eindeutig), Erscheinungsjahr und eine kurze Inhaltsangabe.

- **Autoren:** Name, Nationalität und Geburtsdatum. Ein Buch kann von mehreren Autoren geschrieben sein, und ein Autor kann mehrere Bücher verfasst haben.

- **Kategorien:** Jedes Buch ist genau einer Kategorie zugeordnet (z. B. "Fachbuch", "Roman", "Krimi"). Eine Kategorie hat einen Namen und einen internen Standort-Code.

- **Mitglieder:** Name, E-Mail-Adresse und das Datum des Beitritts.

- **Verleih (Ausleihe):** Es muss erfasst werden, welches Mitglied welches Buch wann ausgeliehen hat und bis zu welchem Datum die Rückgabe erfolgen soll.

Modellieren Sie ein logisches Datenmodell. Treffen Sie sinnvolle Annahmen zu Datentypen. Kardinalitäten (1:1, 1:n, n:m) sowie Primär- und Fremdschlüssel müssen deutlich erkennbar sein!

### Aufgabe 1: Prisma Schema (~30min, genügend)

Erstellen Sie ein Prisma Schema (`schema.prisma`), welches die beschriebenen Anforderungen und Beziehungen (insbesondere die n:m Beziehung zwischen Buch und Autor) abbildet. Verwenden Sie `sqlite` als Provider.

### Aufgabe 2: SQL-DDL (10min, befriedigend)

Geben Sie die notwendigen `CREATE TABLE` Statements in einer Datei **"init-library.sql"** an. Achten Sie auf:

- Korrekte Datentypen für SQLite.
- Primary Keys und Foreign Keys.
- Einen `UNIQUE`-Constraint für die ISBN.
- Ist ein Anlegen der Zwischentabelle für die n:m Beziehung notwendig oder kann ich mich auf die Prisma Automatik verlassen?

### Aufgabe 3: Seeding (gut)

Erstellen Sie ein Seed-Skript (wahlweise in TypeScript oder SQL), um folgenden Test-Datenbestand anzulegen:

- Eine Kategorie "Programmierung".
- Ein Buch (z.B. "Clean Code") mit zwei Autoren.
- Zwei registrierte Mitglieder.
- Zwei aktive Ausleihen (Loans).

### Aufgabe 4: Verleih-Logik (sehr gut)

Erstellen Sie eine Funktion (in TypeScript oder als SQL-Stored-Procedure-Entwurf), die eine neue Ausleihe anlegt.

`function borrow_book(member_id, book_id, due_date)`

**Zusatzfrage für "Sehr Gut":** Wie müssten Sie das Modell anpassen, wenn die Bibliothek mehrere physische Exemplare desselben Buches (gleiche ISBN) besitzt und diese individuell getrackt werden müssen?

**Gutes Gelingen!**

Hinweis: Ein `seed.ts` File wird bereitgestellt.
