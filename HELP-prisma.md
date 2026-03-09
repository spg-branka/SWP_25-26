🧾 Prisma v6 Cheat Sheet – Windows / Node / SQLite


1️⃣ Create & open a new project folder


2️⃣ Disable Deno (important!)

Open VS Code Settings → JSON (Ctrl+Shift+P → Open Settings (JSON))

Add:

{
  "deno.enable": false,
  "deno.enablePaths": []
}


Close and reopen the terminal.

Ensure node commands work (node -v, npm -v).

This avoids Deno trying to run .ts files like prisma.config.ts.

3️⃣ Initialize Node project
npm init -y


If not allowed -> 
In the VS Code integrated terminal (PowerShell), run:

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned


When asked:

[Y] Yes


Then close the terminal, open a new terminal, and retry:

npm init -y




4️⃣ Install Prisma v6 + client
npm install prisma@6 --save-dev
npm install @prisma/client@6


5️⃣ Initialize Prisma
npx prisma init --datasource-provider sqlite


Creates:

prisma/
  schema.prisma
.env

6️⃣ Configure SQLite database

Open .env:

DATABASE_URL="file:./dev.db"

7️⃣ Fix prisma/schema.prisma top
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

8️⃣ Add your models

Paste your schema (User, Profile, Post, Comment, Tag) below the datasource block.

9️⃣ Generate Prisma Client
npx prisma generate


Must do this before any seeding.

10️⃣ Create database + migration
npx prisma migrate dev --name init


Creates dev.db and prisma/migrations/

11️⃣ Install Faker for seeding
npm install @faker-js/faker

12️⃣ Create seed file

prisma/seed.js — example:

const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

async function main() {
  // Example: create 5 users
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        profile: { create: { bio: faker.lorem.sentence() } },
      },
    });
  }
  console.log('Seeding complete!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => { await prisma.$disconnect(); });

13️⃣ Run the seed

Prisma v6 does not support seed in prisma.config.ts — always run manually:

node prisma/seed.js


Or in package.json:

"scripts": {
  "seed": "node prisma/seed.js"
}


Then:

npm run seed

14️⃣ Open Prisma Studio (GUI)
npx prisma studio


Verify tables and seeded data.

15️⃣ Common Errors & Fixes
Error	Fix
@prisma/client did not initialize yet	Run npx prisma generate before running seed.js
Seed fails with TS error (seed in prisma.config.ts)	Remove seed property; run seed manually (node prisma/seed.js)
Deno interfering	Disable in VS Code: "deno.enable": false and "deno.enablePaths": []
Execution policy error on Windows	Run in PowerShell: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned


16️⃣ Useful Commands
# Generate client
npx prisma generate

# Run migration
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Open GUI
npx prisma studio

# Run seed manually
node prisma/seed.js


✅ Folder structure
.
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.js
│  └─ migrations/
├─ dev.db
├─ .env
├─ node_modules/
└─ package.json





CLI:
npm init -y
npm install prisma@6 --save-dev
npm install @prisma/client@6
npx prisma init --datasource-provider sqlite
npx prisma generate
npx prisma migrate dev --name init (--name init can be left out)
npx prisma studio
npm install @faker-js/faker
node prisma/seed.js