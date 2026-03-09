const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  // Create 5 users with profiles
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        profile: {
          create: {
            bio: faker.lorem.sentence(),
          },
        },
      },
    });

    // Create 1-3 posts per user
    const postCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < postCount; j++) {
      const post = await prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(2),
          authorId: user.id,
        },
      });

      // Create 0-3 comments per post
      const commentCount = faker.number.int({ min: 0, max: 3 });
      for (let k = 0; k < commentCount; k++) {
        await prisma.comment.create({
          data: {
            text: faker.lorem.sentence(),
            postId: post.id,
          },
        });
      }
    }
  }

  // Create some tags
  const tagNames = ['tech', 'life', 'travel', 'food', 'science'];
  for (const name of tagNames) {
    await prisma.tag.create({
      data: { name },
    });
  }

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
