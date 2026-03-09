import { PrismaClient } from "model";
//import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
await prisma.$connect();

async function main() {

    await prisma.autor.deleteMany();
    await prisma.buch.deleteMany();
    await prisma.kategorie.deleteMany();
    await prisma.mitglied.deleteMany();
    await prisma.verleih.deleteMany();

//     Erstellen Sie ein Seed-Skript (wahlweise in TypeScript oder SQL), um folgenden Test-Datenbestand anzulegen
// • Eine Kategorie “Programmierung”.
// • Ein Buch (z.B. “Clean Code”) mit zwei Autoren.
// • Zwei registrierte Mitglieder.
// • Zwei aktive Ausleihen (Loans)


    const buch = await prisma.buch.create({
        data: {
            titel: "Clean Code",
            isbn: "1234-5678-ABC",
            erscheinungsjahr: 2020,
            inhaltsangabe: "irgendeine kurze Inhaltsangabe",
            //kategorieId: 1,
            // autoren: {
            //     connect:
            // }
            kategorie: {
                create: 
            }
        }
    })

    const autor1 = await prisma.autor.create({
        data: {
            name: "Max Mustermann",
            nationalitaet: "Österreich",
            geburtsdatum: "20.01.1980",
            buecher: {
                connect: {id: buch.id}
            }
        }
    })

    const autor2 = await prisma.autor.create({
        data: {
            name: "Anna Musterfrau",
            nationalitaet: "Schweiz",
            geburtsdatum: "20.01.1990",
            buecher: {
                connect: {id: buch.id}
            }
        }
    })

    const programmierung = await prisma.kategorie.create({
        data: {
            name: "Programmierung",
            standort: "AH.26",
            buecher: {
                connect: {id: buch.id}
            }
        }
    })

    const mitglied1 = await prisma.mitglied.create({
        data: {
            name: "John Doe",
            email: "john@doe.com",
            beitrittsdatum: "20.02.2020"
        }
    })

    const mitglied2 = await prisma.mitglied.create({
        data: {
            name: "Sarah Müller",
            email: "sarah@mueller.com",
            beitrittsdatum: "11.11.2011",
            verleihe: {

            }
        }
    })

    const verleih1 = await prisma.verleih.create({
        data: {
            mitglied: {
               
            }
            ausleihdatum:
            rueckgabedatum:
        }
    })
}


// await main();
// await prisma.$disconnect();

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });