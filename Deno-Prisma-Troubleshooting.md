# Deno + Prisma Troubleshooting Guide

This guide helps fix common errors when setting up a Deno project with Prisma, based on typical issues encountered in school tests.

## Step 1: Check for deno.json
If you see errors about missing modules or types:
- Ensure there's a `deno.json` file in the project root
- It should contain imports for Prisma and other dependencies
- Example:
```json
{
  "imports": {
    "@prisma/client": "npm:@prisma/client@^6.18.0",
    "prisma": "npm:prisma@^6.18.0",
    "prisma/config": "npm:prisma/config@^6.18.0",
    "@std/dotenv": "jsr:@std/dotenv@^0.225.2"
  },
  "nodeModulesDir": "auto",
  "tasks": {
    "prisma": "deno -A prisma",
    "generate": "deno -A prisma generate",
    "migrate": "deno -A prisma migrate dev"
  }
}
```

## Step 2: Remove Node.js files
If you see "Cannot find type definition file for 'node'" or similar:
- Delete `package.json` and `tsconfig.json` if present
- These are for Node.js, not Deno

## Step 3: Fix Prisma Schema
For schema validation errors:
- Generator should be:
```prisma
generator client {
  provider = "prisma-client"
  output = "client"
  runtime = "deno"
}
```
- Datasource should include URL:
```prisma
datasource db {
  provider = "sqlite"
  url = "file:./database.db"
}
```

## Step 4: Fix prisma.config.ts
If imports fail:
- Use Deno-compatible imports
- Example:
```typescript
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "file:./database.db",
  },
});
```

## Step 5: Load Environment Variables
In main.ts or seed files:
- Use `@std/dotenv` instead of `dotenv/config`
- Example:
```typescript
import { load } from "@std/dotenv";
await load({ export: true });
```

## Step 6: Generate Prisma Client
After schema changes:
```bash
deno task generate
```
- If it fails with "Missing DATABASE_URL", set it:
```bash
$env:DATABASE_URL="file:./database.db"; deno task generate
```

## Step 7: Run Migrations
To create/update database:
```bash
deno task migrate
```
- Name the migration when prompted (e.g., "init")

## Step 8: Import Prisma Client
In your code:
```typescript
import { PrismaClient } from "./prisma/client/client.ts";
const prisma = new PrismaClient();
```

## Step 9: Run Tests
For test files:
- Use Deno.test instead of Jest/Mocha
- Import from @std/assert
- Example:
```typescript
import { assertEquals } from "@std/assert";

Deno.test("test name", () => {
  assertEquals(2 + 2, 4);
});
```

## Common Error Fixes

### "Cannot find module 'prisma/config'"
- Add to deno.json imports: `"prisma/config": "npm:prisma/config@^6.18.0"`

### "Cannot find name 'Deno'"
- Ensure deno.json exists and VS Code is using Deno extension

### "Datasource provider not known"
- Check spelling: "sqlite" not "SQLlite"
- Ensure URL is provided

### "Migration failed"
- Check database file permissions
- Ensure no other process is using the database

### "Prisma client not generated"
- Always run `deno task generate` after schema changes

## Quick Setup Checklist
- [ ] deno.json present with correct imports
- [ ] No package.json or tsconfig.json
- [ ] Schema has correct generator and datasource
- [ ] prisma.config.ts uses Deno imports
- [ ] Environment variables loaded with @std/dotenv
- [ ] Prisma client generated
- [ ] Database migrated
- [ ] Code uses correct imports

## Running the Project
```bash
# Generate client
deno task generate

# Run migrations
deno task migrate

# Run main script
deno run main.ts

# Run tests
deno test main_test.ts
```