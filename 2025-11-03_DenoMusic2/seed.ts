import { faker } from "@faker-js/faker";
import { PrismaClient } from "./prisma/client/client.ts";

const prisma = new PrismaClient();

async function main() {
  //clear existing data
  await prisma.song.deleteMany({});
  await prisma.album.deleteMany({});
  await prisma.artist.deleteMany({});
  await prisma.genre.deleteMany({});

  //create some genres
  const genres = [];
  for (let i = 0; i < 5; i++) {
    const genre = await prisma.genre.create({
      data: {
        name: faker.music.genre(),
      },
    });
    genres.push(genre);
  }

  //create some artists
  const artists = [];
  for (let i = 0; i < 5; i++) {
    const artist = await prisma.artist.create({
      data: {
        name: faker.person.fullName(),
      },
    });
    artists.push(artist);
  }

  //create some albums for each artist
  const albums = [];
  for (const artist of artists) {
    const albumCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < albumCount; i++) {
      const album = await prisma.album.create({
        data: {
          name: faker.music.album(),
          jahr: faker.number.int({ min: 1980, max: 2025 }),
          artists: {
            connect: [{ id: artist.id }],
          },
        },
      });
      albums.push(album);
    }
  }

  //create some songs for each album
  for (const album of albums) {
    const songCount = faker.number.int({ min: 3, max: 10 });
    for (let i = 0; i < songCount; i++) {
      const genre = faker.helpers.arrayElement(genres);
      await prisma.song.create({
        data: {
          name: faker.music.songName(),
          dauer: faker.number.int({ min: 120, max: 360 }),
          albumId: album.id,
          genreId: genre.id,
        },
      });
    }
  }

  console.log("Seed finished!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
